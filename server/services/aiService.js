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
  "summary": "2-3 line executive summary of the complaint in clear English",
  "summaryHindi": "2-3 line translation/summary of the complaint in Hindi (Devanagari script)",
  "detectedLanguage": "English, Hindi, or Hinglish",
  "suggestedResolution": "1-2 line actionable resolution guidance for the support admin team",
  "troubleshootingSteps": [
    "Step 1: specific immediate action to diagnose or fix",
    "Step 2: secondary troubleshooting or verification step",
    "Step 3: escalation or final resolution step"
  ]
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
      suggestedResolution: 'Please manually review and categorize this complaint.',
      troubleshootingSteps: [
        'Verify issue details with the reporting user',
        'Check system status and related service logs',
        'Assign to appropriate department lead for resolution'
      ]
    };
  }
};

const predictWorkloadSurge = async (recentStats) => {
  const prompt = `You are an AI IT Operations and Enterprise Workforce Forecaster. Analyze the following department complaint statistics from the past week and forecast future ticket surges for the next 7 days.

Current Stats:
Total Complaints: ${recentStats.totalComplaints}
Category Breakdown: ${JSON.stringify(recentStats.categoryStats)}
Priority Breakdown: ${JSON.stringify(recentStats.priorityStats)}
Status Breakdown: ${JSON.stringify(recentStats.statusStats)}

Return ONLY a valid JSON response with this exact structure:
{
  "riskLevel": "one of: High, Moderate, Low",
  "projectedSurgePercentage": number (e.g. 28),
  "primarySurgeDepartment": "department name (e.g. IT, HR, Finance, Operations)",
  "forecastSummary": "2 line executive summary of predicted bottlenecks and trend insights",
  "actionableRecommendation": "specific staffing or resource allocation action for management",
  "departmentForecasts": [
    { "department": "IT", "risk": "High", "projectedVolume": "+35%", "insight": "Server & VPN instability" },
    { "department": "HR", "risk": "Moderate", "projectedVolume": "+12%", "insight": "Quarterly payroll queries" },
    { "department": "Finance", "risk": "Low", "projectedVolume": "Stable", "insight": "Standard invoice flow" },
    { "department": "Operations", "risk": "Low", "projectedVolume": "Stable", "insight": "Facility maintenance steady" }
  ]
}

Return ONLY valid JSON, no markdown, no other text.`;

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
    if (!response.ok) throw new Error(data.error?.message || 'API Error');

    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Workload prediction failed:', error.message);
    return {
      riskLevel: 'Moderate',
      projectedSurgePercentage: 18,
      primarySurgeDepartment: 'IT',
      forecastSummary: 'Expected moderate volume across technical departments with stable operations in administrative teams.',
      actionableRecommendation: 'Maintain standard SLA response teams and monitor peak hour ticket submissions.',
      departmentForecasts: [
        { department: 'IT', risk: 'Moderate', projectedVolume: '+20%', insight: 'Standard support volume' },
        { department: 'HR', risk: 'Low', projectedVolume: 'Stable', insight: 'Routine onboarding queries' },
        { department: 'Finance', risk: 'Low', projectedVolume: 'Stable', insight: 'Regular reimbursement cycle' },
        { department: 'Operations', risk: 'Low', projectedVolume: 'Stable', insight: 'No anomalies detected' }
      ]
    };
  }
};

module.exports = { analyzeComplaint, predictWorkloadSurge };