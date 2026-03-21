import { NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert File to ArrayBuffer for Tesseract
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Initialize Tesseract worker
    const worker = await createWorker('eng');
    
    // Perform OCR
    const { data: { text } } = await worker.recognize(buffer);
    
    await worker.terminate();

    return NextResponse.json({ success: true, text });

  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}
