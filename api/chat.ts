import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "Gemini API key is missing" });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // We will pass the system instructions and history
    let validHistory = [...history];
    while (validHistory.length > 0 && validHistory[0].role !== 'user') {
      validHistory.shift();
    }
    
    const formattedHistory = validHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: "You are AgriVision AI Assistant, an expert in onion quality assessment, agricultural grading, and digital passports. Keep answers helpful, concise, and professional.",
      }
    });
    
    res.status(200).json({ text: response.text });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat" });
  }
}
