import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { month, year } = await req.json();
    if (!month || !year) throw new Error('Month and year are required');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    // Dates
    const startOfMonth = new Date(year, month - 1, 1).toISOString();
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999).toISOString();
    
    // Previous month dates
    const prevMonthStr = month === 1 ? 12 : month - 1;
    const prevYearStr = month === 1 ? year - 1 : year;
    const startOfPrevMonth = new Date(prevYearStr, prevMonthStr - 1, 1).toISOString();
    const endOfPrevMonth = new Date(prevYearStr, prevMonthStr, 0, 23, 59, 59, 999).toISOString();

    // 1. Fetch Current Summary
    const { data: currentSummary } = await supabase.rpc('get_analytics_summary', {
      p_start_date: startOfMonth,
      p_end_date: endOfMonth
    });

    // 2. Fetch Previous Summary
    const { data: prevSummary } = await supabase.rpc('get_analytics_summary', {
      p_start_date: startOfPrevMonth,
      p_end_date: endOfPrevMonth
    });

    // 3. Fetch Top Categories (Approximation via transactions)
    const { data: txData } = await supabase
      .from('transactions')
      .select('amount, categories (name)')
      .gte('transaction_date', startOfMonth)
      .lte('transaction_date', endOfMonth);

    const categoryMap: Record<string, number> = {};
    (txData || []).forEach(tx => {
      const catName = (tx.categories as any)?.name || 'Uncategorized';
      categoryMap[catName] = (categoryMap[catName] || 0) + parseFloat(tx.amount);
    });

    const topCategories = Object.entries(categoryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, amount]) => ({ name, amount }));

    // Prepare Summary Data for AI
    const currStats = currentSummary?.[0] || {};
    const prevStats = prevSummary?.[0] || {};

    const summaryData = {
      current_month_total: Number(currStats.total_spending) || 0,
      previous_month_total: Number(prevStats.total_spending) || 0,
      transaction_count: Number(currStats.transaction_count) || 0,
      daily_average: Number(currStats.daily_average) || 0,
      largest_expense: Number(currStats.largest_expense) || 0,
      top_categories: topCategories,
    };

    if (summaryData.transaction_count < 3) {
      return new Response(JSON.stringify({ 
        insights: ["ระบบต้องการข้อมูลอย่างน้อย 3 รายการ เพื่อให้ AI วิเคราะห์พฤติกรรมการใช้จ่ายของคุณ"],
        summary_data: summaryData
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Call Gemini
    const prompt = `
You are a financial analyst for a Thai expense tracking app.
Based on the following spending data, provide 2 short, actionable insights in Thai language.
Do not invent numbers. Do not give generic financial advice. Focus on patterns in the data (e.g. increases, highest categories, daily averages).
Format the output as a valid JSON array of strings. Example: ["Insight 1", "Insight 2"]

Data:
- Current Month Total: ${summaryData.current_month_total} THB
- Previous Month Total: ${summaryData.previous_month_total} THB
- Daily Average: ${summaryData.daily_average.toFixed(0)} THB
- Top Categories: ${summaryData.top_categories.map(c => `${c.name} (${c.amount} THB)`).join(', ')}
`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini Error:', errorText);
      throw new Error('AI processing failed');
    }

    const aiResult = await geminiResponse.json();
    const textResponse = aiResult.candidates[0].content.parts[0].text;
    
    let insights = [];
    try {
      insights = JSON.parse(textResponse);
    } catch (e) {
      insights = ["เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล กรุณาลองใหม่อีกครั้ง"];
    }

    return new Response(JSON.stringify({ 
      insights,
      summary_data: summaryData
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Insight generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
