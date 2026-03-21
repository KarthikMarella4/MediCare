import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Define the medicine type we want the AI to return
export interface ExtractedMedicine {
  id: string; // we will generate this
  name: string;
  dosage: string;
  timing: 'Morning' | 'Afternoon' | 'Night' | 'Multiple' | 'Unknown';
  foodInstruction: 'Before Food' | 'After Food' | 'Anytime' | 'Unknown';
  uses: string;
}

// In a real app, you would require the user to provide an API key or use your own.
// For the prototype, we assume it's set in the environment or we can fall back to a mock.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

// Mock Data Fallback when no real API key is present
const extractMockData = (text: string): Omit<ExtractedMedicine, 'id'>[] => {
  return [
    {
      name: 'Paracetamol',
      dosage: '500mg',
      timing: 'Morning',
      foodInstruction: 'After Food',
      uses: 'Fever and pain relief'
    },
    {
      name: 'Amoxicillin',
      dosage: '250mg',
      timing: 'Multiple',
      foodInstruction: 'After Food',
      uses: 'Antibiotic for bacterial infections'
    }
  ];
};

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // If no real API key is configured, return mock data for prototype functionality
    if (process.env.OPENAI_API_KEY === 'dummy_key' || !process.env.OPENAI_API_KEY) {
      console.log('Using mock AI extraction because no valid API key was found.');
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({ success: true, medicines: extractMockData(text) });
    }

    // Call actual OpenAI API
    const prompt = `
      Extract the medicines from the following prescription text.
      For each medicine, determine:
      - name: The name of the medicine
      - dosage: The dosage (e.g., 500mg)
      - timing: When to take it (Morning, Afternoon, Night, Multiple, or Unknown)
      - foodInstruction: (Before Food, After Food, Anytime, or Unknown)
      - uses: A short 3-5 word description of what the medicine is typically used for (e.g., Blood Pressure, Pain Relief)

      Return a JSON array of objects strictly following this format. No markdown blocks, just the raw JSON array.

      Prescription Text:
      "${text}"
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' }, 
    });

    const resultString = completion.choices[0].message.content || '{"medicines": []}';
    let resultJSON = JSON.parse(resultString);
    
    // Handle both raw arrays or objects containing a medicines array
    const medicines = Array.isArray(resultJSON) ? resultJSON : (resultJSON.medicines || []);

    return NextResponse.json({ success: true, medicines });

  } catch (error) {
    console.error('AI Extraction Error:', error);
    return NextResponse.json({ error: 'Failed to extract medicine data' }, { status: 500 });
  }
}
