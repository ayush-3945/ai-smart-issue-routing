require('dotenv').config();

const analyzeComplaint = async (title, description) => {
  const prompt = `You are an AI complaint management system. Analyze the following complaint and return a JSON response.

Complaint Title: ${title}
Complaint Description: ${description}

Return ONLY a valid JSON object with these exact fields:
{
  "category": "one of: IT, HR, Finance, Operations, General",
  "priority": "one of: Low, Medium, High, Critical",
  "confidence": number between 0 and 100,
  "department": "one of: IT Department, HR Department, Finance Department, Operations Department, General Department",
  "summary": "2-3 line summary of the complaint",
  "suggestedResolution": "brief suggested next steps for admin"
}

Return ONLY the JSON, no extra text.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemma-4-26b-a4b-it:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API Error');
    }

    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error('AI Analysis failed:', error.message);
    return {
      category: 'General',
      priority: 'Medium',
      confidence: 0,
      department: 'General Department',
      summary: 'AI analysis failed. Manual review required.',
      suggestedResolution: 'Please manually review and categorize this complaint.'
    };
  }
};

module.exports = { analyzeComplaint };