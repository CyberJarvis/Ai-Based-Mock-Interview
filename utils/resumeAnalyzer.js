import { chatSession } from '@/utils/GeminiAIModal';

export const generateResumeAnalysis = async (resumeContent) => {
  try {
    const prompt = `
Analyze the following resume content and provide a comprehensive analysis. Extract key information and provide insights.

Resume Content:
${resumeContent}

Please analyze and return a JSON response with the following structure:
{
  "summary": {
    "name": "Candidate name if found",
    "title": "Current/most recent job title",
    "experience": "Total years of experience",
    "location": "Location if mentioned"
  },
  "skills": {
    "technical": ["List of technical skills"],
    "soft": ["List of soft skills"],
    "tools": ["Tools and technologies"]
  },
  "experience": [
    {
      "role": "Job title",
      "company": "Company name",
      "duration": "Duration",
      "highlights": ["Key achievements/responsibilities"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "School/University name",
      "year": "Year if available"
    }
  ],
  "strengths": ["List of key strengths"],
  "suggestions": ["Areas for improvement or missing elements"],
  "score": 85
}

Focus on extracting accurate information and providing helpful insights for interview preparation.
Return only valid JSON without any markdown formatting.
`;

    const result = await chatSession.sendMessage(prompt);
    const response = result.response.text();
    
    // Clean and parse JSON
    let cleanResponse = response.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
    
    try {
      return {
        success: true,
        data: JSON.parse(cleanResponse)
      };
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return {
        success: false,
        error: 'Failed to parse analysis response'
      };
    }
  } catch (error) {
    console.error('Resume analysis error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze resume'
    };
  }
};

export const generateJobRecommendations = async (resumeAnalysis) => {
  try {
    const prompt = `
Based on the following resume analysis, recommend suitable job roles and provide career insights.

Resume Analysis:
${JSON.stringify(resumeAnalysis, null, 2)}

Please return a JSON response with job recommendations:
{
  "recommendations": [
    {
      "title": "Job title",
      "match": 95,
      "reasoning": "Why this role fits",
      "requirements": ["Key requirements for this role"],
      "next_steps": ["Skills to develop for this role"]
    }
  ],
  "career_insights": {
    "current_level": "Junior/Mid/Senior",
    "growth_path": ["Potential career progression"],
    "market_demand": "High/Medium/Low demand assessment",
    "salary_range": "Estimated salary range if applicable"
  },
  "skill_gaps": ["Skills to improve for better opportunities"]
}

Focus on providing 3-5 relevant job recommendations based on the candidate's experience and skills.
Return only valid JSON without any markdown formatting.
`;

    const result = await chatSession.sendMessage(prompt);
    const response = result.response.text();
    
    // Clean and parse JSON
    let cleanResponse = response.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
    
    try {
      return {
        success: true,
        data: JSON.parse(cleanResponse)
      };
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return {
        success: false,
        error: 'Failed to parse recommendations response'
      };
    }
  } catch (error) {
    console.error('Job recommendations error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate recommendations'
    };
  }
};