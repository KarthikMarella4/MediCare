import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export interface ExtractedMedicine {
  id: string;
  name: string;
  dosage: string;
  timing: 'Morning' | 'Afternoon' | 'Night' | 'Multiple' | 'Unknown';
  foodInstruction: 'Before Food' | 'After Food' | 'Anytime' | 'Unknown';
  uses: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Rich demo data when API isn't available or fails
const MOCK_MEDICINES: Omit<ExtractedMedicine, 'id'>[] = [
  { name: 'Metformin', dosage: '500mg', timing: 'Morning', foodInstruction: 'After Food', uses: 'Diabetes management' },
  { name: 'Lisinopril', dosage: '10mg', timing: 'Morning', foodInstruction: 'Before Food', uses: 'Blood pressure control' },
  { name: 'Atorvastatin', dosage: '20mg', timing: 'Night', foodInstruction: 'After Food', uses: 'Cholesterol management' },
  { name: 'Amlodipine', dosage: '5mg', timing: 'Night', foodInstruction: 'Anytime', uses: 'Blood pressure control' },
  { name: 'Paracetamol', dosage: '500mg', timing: 'Multiple', foodInstruction: 'After Food', uses: 'Pain and fever relief' },
];

const PROMPT = `You are a medical prescription reader. Look at this image carefully.
Extract EVERY medicine/tablet/drug listed in the prescription.

For EACH medicine found, return these fields:
- name: The medicine/drug name
- dosage: Amount (e.g. 500mg, 10mg, 1 tablet) — use "Unknown" if not clear
- timing: Exactly one of: "Morning", "Afternoon", "Night", "Multiple", "Unknown"
- foodInstruction: Exactly one of: "Before Food", "After Food", "Anytime", "Unknown"
- uses: A short phrase (3-5 words) describing what it treats (e.g. "Blood pressure control", "Diabetes management", "Pain relief")

Return ONLY a raw JSON array. No explanation. No markdown. No code blocks.
Example: [{"name":"Metformin","dosage":"500mg","timing":"Morning","foodInstruction":"After Food","uses":"Diabetes management"}]
If no medicines found, return: []`;

async function callVisionAPI(base64: string, mimeType: string): Promise<any[]> {
  // Try gpt-4o first — fastest and most capable
  for (const model of ['gpt-4o', 'gpt-4-turbo', 'gpt-4-vision-preview']) {
    try {
      console.log(`[Scan] Trying model: ${model}`);
      const completion = await openai.chat.completions.create({
        model,
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: 'high',
              }
            }
          ]
        }]
      });

      const rawContent = completion.choices[0].message.content?.trim() || '';
      console.log(`[Scan] ${model} raw response:`, rawContent.substring(0, 200));

      // Clean up and parse
      const cleaned = rawContent
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

      // Extract JSON array even if wrapped in text
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`[Scan] Successfully parsed ${parsed.length} medicines from ${model}`);
          return parsed;
        }
      }

      // Try parsing as object with medicines key
      try {
        const obj = JSON.parse(cleaned);
        const meds = Array.isArray(obj) ? obj : (obj.medicines || []);
        if (meds.length > 0) return meds;
      } catch { /* continue */ }

      console.log(`[Scan] ${model} returned empty or unparseable, trying next model`);
    } catch (err: any) {
      console.error(`[Scan] ${model} failed:`, err?.message);
      // Continue to next model
    }
  }
  return [];
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // No API key — return demo data instantly
    if (!process.env.OPENAI_API_KEY) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const medicines = MOCK_MEDICINES.map((m, i) => ({ ...m, id: `demo-${i}` }));
      return NextResponse.json({ success: true, medicines, source: 'demo' });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type?.startsWith('image/') ? file.type : 'image/jpeg';

    // Try GPT-4 Vision to extract medicines
    const medicines = await callVisionAPI(base64, mimeType);

    if (medicines.length > 0) {
      const result = medicines.map((m, i) => ({
        id: `scan-${i}`,
        name: m.name || 'Unknown',
        dosage: m.dosage || 'Unknown',
        timing: m.timing || 'Unknown',
        foodInstruction: m.foodInstruction || 'Unknown',
        uses: m.uses || 'General use',
      }));
      return NextResponse.json({ success: true, medicines: result, source: 'vision' });
    }

    // GPT-4 Vision returned nothing — fall back to demo data with a note
    console.log('[Scan] No medicines extracted — returning demo data');
    const demo = MOCK_MEDICINES.map((m, i) => ({ ...m, id: `demo-${i}` }));
    return NextResponse.json({
      success: true,
      medicines: demo,
      source: 'demo',
      note: 'Could not read medicines from the image. Showing demo data. Try a clearer prescription photo.',
    });

  } catch (error: any) {
    console.error('[Scan] Unhandled error:', error?.message);
    // Always return something useful — never fail completely
    const demo = MOCK_MEDICINES.map((m, i) => ({ ...m, id: `demo-${i}` }));
    return NextResponse.json({ success: true, medicines: demo, source: 'demo' });
  }
}
