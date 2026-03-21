import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractedMedicine } from './types';

// Initialize Gemini with Vite env variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);


const PROMPT = `You are a highly skilled pharmacist and medical OCR assistant. Carefully examine this prescription image.
Extract EVERY medicine, tablet, capsule, syrup, or drug listed — including those with complex or handwritten names.

For EACH medicine found, return these fields:
- name: The full medicine/drug name as written
- dosage: Amount per dose (e.g. "500mg", "10mg", "1 tablet", "5ml") — use "Unknown" if not visible
- timing: Exactly one of: "Morning", "Afternoon", "Night", "Multiple", "Unknown"
  (use "Multiple" if taken at more than one time of day)
- foodInstruction: Exactly one of: "Before Food", "After Food", "Anytime", "Unknown"
- uses: A precise 3-6 word medical phrase (e.g. "Type 2 diabetes control", "Hypertension management", "Pain and inflammation relief")
- sideEffects: One short sentence listing 2-3 common side effects (e.g. "May cause nausea, dizziness, or dry mouth.")

Return ONLY a raw JSON array. No explanation, no markdown, no code blocks, no labels.
Example output:
[{"name":"Metformin","dosage":"500mg","timing":"Morning","foodInstruction":"After Food","uses":"Type 2 diabetes control","sideEffects":"May cause nausea, stomach upset, or diarrhea."}]
If you find NO medicines, return: []`;


export async function scanPrescription(file: File): Promise<ExtractedMedicine[]> {
  if (!apiKey) {
    throw new Error('No Gemini API key provided. Please set VITE_GEMINI_API_KEY in your .env.local file.');
  }

  const arrayBuffer = await file.arrayBuffer();
  // ArrayBuffer to Base64
  const base64 = btoa(
    new Uint8Array(arrayBuffer)
      .reduce((data, byte) => data + String.fromCharCode(byte), '')
  );
  const mimeType = file.type?.startsWith('image/') ? file.type : 'image/jpeg';

  try {
    const imagePart = {
      inlineData: {
        data: base64,
        mimeType: mimeType
      }
    };

    let result;
    let lastError;
    const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash'];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`[Scan] Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent([PROMPT, imagePart]);
        break; // Success
      } catch (err: any) {
        lastError = err;
        console.warn(`[Scan] Model ${modelName} failed:`, err.message);
      }
    }

    if (!result) {
      throw lastError;
    }
    const response = await result.response;
    const rawContent = response.text().trim();
    
    // Clean markdown if Gemini included it
    const cleaned = rawContent.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m: any, i: number) => ({
          id: `scan-${i}`,
          name: m.name || 'Unknown',
          dosage: m.dosage || 'Unknown',
          timing: m.timing || 'Unknown',
          foodInstruction: m.foodInstruction || 'Unknown',
          uses: m.uses || 'General use',
          sideEffects: m.sideEffects || undefined,
        }));
      }
    }
  } catch (error: any) {
    console.error('[Scan] Gemini API Error:', error);
    throw new Error(error.message || 'Failed to extract medicines using Gemini');
  }

  throw new Error('Failed to extract medicines properly. Please try uploading a clearer image.');
}

export async function explainMedicine(medicineName: string, uses?: string): Promise<string> {
  if (!apiKey) {
    throw new Error('No Gemini API key provided. Please set VITE_GEMINI_API_KEY in your .env.local file.');
  }

  try {
    const prompt = `You are a pharmacist. For the medicine "${medicineName}"${uses ? ` (used for: ${uses})` : ''}, write EXACTLY 2 short simple sentences for a patient: (1) what it treats and how it works, (2) key instructions like food timing or important side effects. No bullet points. Plain text only. End with: "Follow your doctor's instructions."`;


    
    let result;
    let lastError;
    const modelsToTry = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash', 'gemini-pro-latest'];
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        result = await model.generateContent(prompt);
        break;
      } catch (err: any) {
        lastError = err;
        console.warn(`[Explain] Model ${modelName} failed:`, err.message);
      }
    }

    if (!result) {
      throw lastError;
    }
    const response = await result.response;
    return response.text() || 'No explanation available.';
  } catch (error: any) {
    console.error('Medicine Explain API Error:', error);
    throw new Error(error.message || 'Failed to get medicine explanation from Gemini');
  }
}
