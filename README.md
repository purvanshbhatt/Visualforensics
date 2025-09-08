AI-Powered Forensic Triage Tool
A rapid-response tool for Digital Forensics (DFIR) analysts to accelerate the initial triage of suspected image manipulation, built on Google's Gemini (Nano Banana).

Note: The video above is the original "Visual Tutor" concept submitted for the hackathon. A new, professional proof-of-concept video is in development.

🚀 Live Demo
[Try the Forensic Triage Tool Live]([Your Vercel or Netlify Deployment URL Here])

💡 The Problem & The Professional Solution
In a Digital Forensics and Incident Response (DFIR) workflow, time is critical. Analysts are often faced with a high volume of digital media that requires examination. The initial "triage" phase—quickly identifying which pieces of evidence warrant a deeper, manual investigation—can be a significant bottleneck.

This project is not an educational toy. It is a professional triage tool designed to accelerate that initial assessment.

The value proposition is speed and efficiency. By leveraging Google's Gemini model, this tool provides a rapid, AI-driven first-pass analysis of suspected image manipulation. It highlights specific technical artifacts and regions of interest, allowing a human analyst to more quickly focus their efforts on the most critical evidence.

✨ Core Features for the Analyst
Rapid Anomaly Detection: Submits an image to Gemini for a technical analysis focused on forensic artifacts like cloning, splicing, compression anomalies, and inconsistent lighting/shadows.

Visual Evidence Highlighting: The tool's key feature is its use of structured JSON output from Gemini to programmatically draw precise bounding boxes around identified regions of interest, providing an immediate visual guide for the analyst.

Contextual Manipulation Generation: The tool can generate a subtly tampered version of an uploaded image, serving as a reference or a training example for junior analysts.

🏆 Technical Innovation: Structured Data for Forensics
The core innovation is the enforcement of a structured JSON schema in the prompt to Gemini. Instead of a conversational summary, the model is required to return a machine-readable object containing:

A concise, technical analysis.

An array of manipulatedAreas with precise bounding box coordinates (x1, y1, x2, y2).

A technical description for each bounding box (e.g., "Suspected clone stamp artifact").

This data-driven approach is what elevates the tool from a simple AI wrapper to a functional component in a professional forensic workflow.

🛠️ Tech Stack
Core AI Model: Google Gemini 2.5 Flash Image Preview (Nano Banana)

AI Narration (Legacy): ElevenLabs

AI Image Enhancement (Legacy): Fal.ai

Framework: React with Vite

Language: TypeScript

Styling: Tailwind CSS

Deployment: Vercel / Netlify

⚙️ Setup and Local Installation
To run this project locally:

Clone the repository:

git clone https://www.github.com/purvanshbhatt/visualforensics.git
cd forensic-triage-tool

Install dependencies:

npm install

Set up environment variables:

Create a file named .env.local in the project root.

Add your Gemini API key:

GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

Run the development server:

npm run dev
