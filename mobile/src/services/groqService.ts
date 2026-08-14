/**
 * KrishiBundle Groq NLU Service
 *
 * Integrates directly with Groq Cloud APIs using the LLaMA model
 * to extract structured agricultural orders from raw multilingual text/transcripts.
 */

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface ExtractedOrderData {
  crop: string;
  quantityKg: number;
  destination: string;
  confidence: number; // 0-100
  language: string;
  explanation: string;
}

export async function extractOrderFromText(rawText: string): Promise<ExtractedOrderData> {
  if (!GROQ_API_KEY) {
    throw new Error('EXPO_PUBLIC_GROQ_API_KEY environment variable is not defined.');
  }

  const systemPrompt = `
You are an expert agricultural logistics AI for KrishiBundle.
Your job is to analyze the farmer's raw voice transcript (which may be in English, Tamil, Telugu, Malayalam, or Hindi) and extract order details into a clean JSON format.

Standardize crop names to standard English (e.g., "தக்காளி" -> "Tomato", "Aloo" -> "Potato", "Onion" -> "Onion").
Standardize quantities to numbers representing Kilograms (kg).
Standardize destinations to the English name of the market (e.g., "கோയമ്പേട്" -> "Koyambedu Market", "Koyambedu" -> "Koyambedu Market").

Return ONLY a valid JSON object matching this schema. Do not return markdown, do not return extra text.

{
  "crop": "string (standardized English crop name, e.g., 'Tomato', 'Onion', 'Potato', 'Carrot', 'Cabbage', 'Mango', 'Banana', or 'Unknown')",
  "quantityKg": "number (extracted weight in kilograms, or 0 if not specified)",
  "destination": "string (standardized market name, or 'Unknown')",
  "confidence": "number (0-100, confidence based on transcript clarity and completeness of required fields)",
  "language": "string (ISO 639-1 code of original speech: 'en', 'ta', 'te', 'ml', 'hi')",
  "explanation": "string (Brief friendly explanation of what you extracted and why, written in the source language to show the farmer)"
}
`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please extract order details from this transcript: "${rawText}"` },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${errText}`);
    }

    const json = await response.json();
    const content = json.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Groq returned empty response content.');
    }

    const data: ExtractedOrderData = JSON.parse(content);
    return data;
  } catch (error) {
    console.error('[GroqService] Extraction failed:', error);
    // Return safe fallback values if the API or parsing fails
    return {
      crop: 'Unknown',
      quantityKg: 0,
      destination: 'Unknown',
      confidence: 0,
      language: 'en',
      explanation: 'Failed to connect to AI server. Please fill manually.',
    };
  }
}
