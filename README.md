# MediCom — Your Personal Medical Dashboard 💊

MediCom is a smart, AI-powered web application that helps patients digitize, track, and understand their medical prescriptions. It uses **Google's Gemini AI** to act as a highly skilled pharmacist, extracting complex medical data directly from uploaded images or PDFs.

## ✨ Features

- **Instant AI Extraction (OCR):** Upload a photo or PDF of a prescription. The system instantly detects every medicine name, dosage, and consumption instruction — even from complex formats.
- **Smart Prescription Comparison:** Compare an old prescription against a new one. MediCom highlights exactly which medicines were **Newly Added**, **Removed**, or **Modified** (dosage/timing changes) so nothing slips through the cracks.
- **Plain-English Explanations:** Click on any medicine to get a 2-sentence explanation of what it treats, how it works, and common side effects — generated specifically for patients, without the medical jargon.
- **Personalized Daily Schedule:** MediCom automatically generates a daily Morning / Afternoon / Night timetable for your active prescriptions and allows you to **export it as a PDF** to share with family or your doctor.

## 🛠️ Tech Stack

- **Frontend:** React + Vite, TypeScript 
- **AI Processing:** Google Generative AI (Gemini 1.5 Pro/Flash)
- **Styling:** CSS Modules with Glassmorphism UI & Custom Animations (Framer Motion)
- **PDF Generation:** jsPDF + html2canvas
- **Routing:** React Router DOM
