import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { encode } from 'https://deno.land/std@0.168.0/encoding/base64.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// Note: Ensure GEMINI_API_KEY is set in Supabase Secrets.
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { storagePath } = await req.json();
    if (!storagePath) {
      throw new Error('storagePath is required');
    }

    // 1. Verify Authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    // 2. Download Image from Storage
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('receipts')
      .download(storagePath);

    if (downloadError) throw new Error(`Failed to download image: ${downloadError.message}`);

    // 3. Convert image to base64 SAFELY (avoiding call stack size limits)
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = encode(new Uint8Array(arrayBuffer));

    // 4. Call Gemini API via REST (using fetch directly since SDKs can sometimes have Deno issues)
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

    const today = new Date().toISOString().slice(0, 10);

    const prompt = `You are a receipt data extraction assistant. Today's date is ${today}. Extract the following information from the receipt image:
    1. merchant: The name of the store or merchant.
    2. amount: The total amount paid (number only, no currency symbol).
    3. date: The date of the transaction in YYYY-MM-DD format using the Gregorian (CE) calendar, or null if not found. Thai receipts often print Buddhist Era (BE/พ.ศ.) years such as 2568: convert them to CE by subtracting 543. Receipts are normally from the last few weeks, so if the year looks implausible relative to today's date, re-check the digits and prefer the most plausible recent date.
    4. items: A list of purchased items, each with a "name", "quantity", and "total_price" (number).
    5. payment_method: "cash", "credit_card", "debit_card", "qr_code", "transfer", or null
    6. suggested_category: Best category for this merchant/receipt (e.g. "Food & Drink", "Transport", "Shopping", "Coffee", "Pet Care")
    7. confidence: A number between 0 and 1 indicating how confident you are in this extraction.

    Respond ONLY with a valid JSON object matching this schema exactly:
    {
      "merchant": "Store Name",
      "amount": 100.50,
      "date": "${today}",
      "items": [{"name": "Item 1", "quantity": 1, "total_price": 100.50}],
      "payment_method": "credit_card",
      "suggested_category": "Food & Drink",
      "confidence": 0.95
    }`;

    const requestBody = JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64 } }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // Gemini returns 429/503 during demand spikes. Retry with backoff on the primary
    // model, then fall back to a second model before giving up.
    const PRIMARY_MODEL = Deno.env.get('GEMINI_MODEL') ?? 'gemini-3.5-flash-lite';
    const FALLBACK_MODEL = Deno.env.get('GEMINI_FALLBACK_MODEL') ?? 'gemini-3.6-flash';
    const RETRYABLE = new Set([429, 500, 502, 503, 504]);
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    let geminiRes: Response | null = null;
    let lastError = '';
    for (const model of [PRIMARY_MODEL, PRIMARY_MODEL, FALLBACK_MODEL, FALLBACK_MODEL]) {
      geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody,
      });
      if (geminiRes.ok) break;

      lastError = await geminiRes.text();
      console.error(`Gemini ${model} failed (${geminiRes.status}): ${lastError}`);
      if (!RETRYABLE.has(geminiRes.status)) break;
      await sleep(1200);
    }

    if (!geminiRes || !geminiRes.ok) {
      const busy = geminiRes ? RETRYABLE.has(geminiRes.status) : false;
      throw new Error(
        busy
          ? 'AI_BUSY: The AI service is busy right now. Please try again in a moment.'
          : `Gemini API Error: ${lastError}`
      );
    }

    const geminiData = await geminiRes.json();
    const jsonString = geminiData.candidates[0].content.parts[0].text;
    const extractedData = JSON.parse(jsonString);

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message, stack: error.stack }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
