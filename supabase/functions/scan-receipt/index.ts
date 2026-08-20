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

    const prompt = `You are a receipt data extraction assistant. Extract the following information from the receipt image:
    1. merchant: The name of the store or merchant.
    2. amount: The total amount paid (number only, no currency symbol).
    3. date: The date of the transaction in YYYY-MM-DD format, or null if not found.
    4. items: A list of purchased items, each with a "name", "quantity", and "total_price" (number).
    5. payment_method: "cash", "credit_card", "debit_card", "qr_code", "transfer", or null
    6. suggested_category: Best category for this merchant/receipt (e.g. "Food & Drink", "Transport", "Shopping", "Coffee", "Pet Care")
    7. confidence: A number between 0 and 1 indicating how confident you are in this extraction.

    Respond ONLY with a valid JSON object matching this schema exactly:
    {
      "merchant": "Store Name",
      "amount": 100.50,
      "date": "2023-10-25",
      "items": [{"name": "Item 1", "quantity": 1, "total_price": 100.50}],
      "payment_method": "credit_card",
      "suggested_category": "Food & Drink",
      "confidence": 0.95
    }`;

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64 } }
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json",
        }
      })
    });

    if (!geminiRes.ok) {
      const errorText = await geminiRes.text();
      throw new Error(`Gemini API Error: ${errorText}`);
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
