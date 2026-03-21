import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { medicineName, uses } = await request.json();

    if (!medicineName) {
      return NextResponse.json({ error: 'No medicine name provided' }, { status: 400 });
    }

    // If no API key, return a detailed mock response to demonstrate the UI
    if (!process.env.OPENAI_API_KEY) {
      const mockExplanations: Record<string, string> = {
        default: `${medicineName} is a commonly prescribed medication. It works by targeting specific biological mechanisms to relieve symptoms. Always take it as directed by your doctor and complete the full course even if you feel better. Avoid altering doses without consulting your healthcare provider.`,
      };

      const knownDrugs: Record<string, string> = {
        Metformin: 'Metformin is an oral medication used to manage Type 2 Diabetes Mellitus. It works by reducing glucose production in the liver and improving insulin sensitivity in the body. It is often the first-line treatment for diabetes and may help with weight management. Common side effects include nausea, stomach upset, and diarrhea, especially when first starting the medication.',
        Lisinopril: 'Lisinopril is an ACE inhibitor used to treat High Blood Pressure (Hypertension) and Heart Failure. It works by relaxing blood vessels, making it easier for the heart to pump blood. It is also prescribed to protect the kidneys in patients with diabetes. Side effects can include a dry cough, dizziness, and elevated potassium levels.',
        Atorvastatin: 'Atorvastatin (Lipitor) is a statin used to reduce Cholesterol and lower the risk of heart disease, heart attacks, and strokes. It works by blocking an enzyme in the liver responsible for producing LDL (bad) cholesterol. It is usually taken at night and is generally well-tolerated. Rare side effects include muscle pain (myopathy).',
        Amlodipine: 'Amlodipine is a calcium channel blocker used to treat High Blood Pressure and Angina (chest pain). It works by relaxing blood vessels and reducing the heart\'s workload. It is effective for long-term blood pressure management. Common side effects include ankle swelling (edema), flushing, and headache.',
        Paracetamol: 'Paracetamol (Acetaminophen) is a widely used analgesic and antipyretic for relieving mild to moderate Pain and reducing Fever. It can be used for headaches, muscle aches, arthritis, backache, toothache, colds, and fevers. It is generally safe when taken as directed, but overdose can cause serious liver damage.',
        Amoxicillin: 'Amoxicillin is a penicillin-type Antibiotic used to treat a wide range of Bacterial Infections, including ear infections, pneumonia, strep throat, urinary tract infections, and skin infections. It works by stopping the growth of bacteria. It is not effective against viral infections like the common cold or flu.',
      };

      const explanation = knownDrugs[medicineName] || mockExplanations.default;
      return NextResponse.json({ success: true, explanation });
    }

    // Real ChatGPT API call
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful medical assistant. Explain medicines in simple, clear language that a patient can understand. Focus on what it is used for, how it works at a basic level, and any important warnings. Keep your response to 3-4 sentences. Do not use jargon. End with a recommendation to follow the doctor\'s advice.'
        },
        {
          role: 'user',
          content: `Please explain the medicine "${medicineName}"${uses ? ` (typically used for: ${uses})` : ''} in simple terms for a patient.`
        }
      ],
      model: 'gpt-3.5-turbo',
      max_tokens: 200,
    });

    const explanation = completion.choices[0].message.content || 'No explanation available.';
    return NextResponse.json({ success: true, explanation });

  } catch (error) {
    console.error('Medicine Explain API Error:', error);
    return NextResponse.json({ error: 'Failed to get medicine explanation' }, { status: 500 });
  }
}
