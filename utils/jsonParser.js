/**
 * Utility function to safely parse AI-generated JSON responses
 * Handles common issues like markdown formatting, extra text, and malformed JSON
 */

export const parseAIJsonResponse = (rawResponse) => {
  try {
    if (!rawResponse || typeof rawResponse !== 'string') {
      throw new Error('Invalid input: response must be a non-empty string');
    }

    let cleanedResponse = rawResponse;
    
    // Remove markdown code block formatting
    cleanedResponse = cleanedResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    
    // Find the JSON array or object bounds
    const arrayStart = cleanedResponse.indexOf('[');
    const arrayEnd = cleanedResponse.lastIndexOf(']') + 1;
    const objectStart = cleanedResponse.indexOf('{');
    const objectEnd = cleanedResponse.lastIndexOf('}') + 1;
    
    // Determine if it's an array or object and extract accordingly
    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      cleanedResponse = cleanedResponse.substring(arrayStart, arrayEnd);
    } else if (objectStart !== -1 && objectEnd > objectStart) {
      cleanedResponse = cleanedResponse.substring(objectStart, objectEnd);
    }
    
    // Additional cleaning - remove any trailing text after the JSON
    cleanedResponse = cleanedResponse.trim();
    
    // Parse the JSON
    const parsedData = JSON.parse(cleanedResponse);
    
    // Validate the structure for interview questions
    if (Array.isArray(parsedData)) {
      // Validate each question object
      for (let i = 0; i < parsedData.length; i++) {
        if (!parsedData[i].Question || !parsedData[i].Answer) {
          console.warn(`Invalid question format at index ${i}:`, parsedData[i]);
          // Fix missing properties
          parsedData[i].Question = parsedData[i].Question || `Question ${i + 1}`;
          parsedData[i].Answer = parsedData[i].Answer || 'Answer not available';
        }
      }
    }
    
    return {
      success: true,
      data: parsedData,
      cleaned: cleanedResponse
    };
    
  } catch (error) {
    console.error('JSON parsing error:', error.message);
    console.error('Raw response length:', rawResponse?.length);
    console.error('Raw response preview:', rawResponse?.substring(0, 500) + '...');
    
    return {
      success: false,
      error: error.message,
      data: null,
      cleaned: null
    };
  }
};

/**
 * Fallback questions for when AI response parsing fails
 */
export const getFallbackQuestions = (jobPosition = 'Software Developer') => {
  return [
    {
      Question: `## Introduction Question\n\nTell me about yourself and your experience as a **${jobPosition}**.\n\n*Focus on your professional journey and key achievements.*`,
      Answer: `### Sample Answer Structure:\n\n1. **Brief Professional Summary**\n   - Current role and years of experience\n   - Key skills and technologies\n\n2. **Relevant Experience**\n   - Highlight 2-3 most relevant projects\n   - Quantify achievements where possible\n\n3. **Connection to Role**\n   - Explain why you're interested in this position\n   - How your background aligns with the role\n\n**Example:** "I'm a ${jobPosition} with X years of experience in [technologies]. In my current role at [company], I've [key achievement]. I'm particularly excited about this opportunity because [connection to role]."`
    },
    {
      Question: `## Strengths Assessment\n\nWhat are your **greatest strengths** and how do they relate to this ${jobPosition} position?`,
      Answer: `### How to Answer:\n\n**Choose 2-3 relevant strengths:**\n- Technical skills (programming languages, frameworks)\n- Soft skills (problem-solving, communication, leadership)\n- Industry knowledge\n\n**Structure your response:**\n1. **State the strength clearly**\n2. **Provide specific examples**\n3. **Connect to the role requirements**\n\n**Example Format:**\n> "One of my key strengths is [strength]. For example, [specific situation and outcome]. This would be valuable in this role because [connection to job requirements]."`
    },
    {
      Question: `## Problem-Solving Experience\n\nDescribe a **challenging technical problem** you solved as a ${jobPosition}. Walk me through your approach.`,
      Answer: `### Use the STAR Method:\n\n**🎯 Situation**\n- Context and background\n- What made it challenging\n\n**📋 Task**\n- Your specific responsibility\n- What needed to be accomplished\n\n**⚡ Action**\n- Steps you took to solve the problem\n- Technologies or methodologies used\n- Collaboration with team members\n\n**🏆 Result**\n- Quantifiable outcomes\n- Impact on project/company\n- Lessons learned\n\n**💡 Pro Tip:** Choose a problem that demonstrates relevant technical skills for this role.`
    },
    {
      Question: `## Career Goals\n\nWhere do you see yourself in **5 years** as a ${jobPosition}?`,
      Answer: `### Framework for Response:\n\n**1. Professional Growth**\n- Technical skills you want to develop\n- Leadership or mentoring aspirations\n- Industry expertise you want to build\n\n**2. Value Creation**\n- How you want to contribute to future teams\n- Projects or initiatives you'd like to lead\n- Impact you want to have on the organization\n\n**3. Alignment with Role**\n- How this position fits your trajectory\n- Growth opportunities you see in this company\n\n**Example:**\n> "In 5 years, I see myself as a senior ${jobPosition} who has mastered [relevant technologies] and is mentoring junior developers. I'd love to lead technical initiatives that [specific impact]. This role would help me develop [skills] while contributing to [company goals]."`
    },
    {
      Question: `## Company Interest\n\nWhy are you interested in this **${jobPosition} role** and our company specifically?`,
      Answer: `### Research-Based Response:\n\n**🏢 Company Research:**\n- Mission, values, and culture\n- Recent news, products, or initiatives\n- Growth trajectory and market position\n\n**💼 Role Alignment:**\n- Specific technologies or methodologies used\n- Team structure and collaboration style\n- Growth and learning opportunities\n\n**🎯 Personal Connection:**\n- How your skills match their needs\n- What unique value you bring\n- Your enthusiasm for their domain/industry\n\n**Sample Structure:**\n1. "I'm drawn to [company] because [specific reason based on research]"\n2. "This ${jobPosition} role excites me because [technical/professional reasons]"\n3. "I believe I can contribute by [specific ways you'll add value]"`
    }
  ];
};

/**
 * Validate and clean AI response before storing in database
 */
export const validateAIResponse = (response) => {
  const parseResult = parseAIJsonResponse(response);
  
  if (!parseResult.success) {
    throw new Error(`Invalid AI response: ${parseResult.error}`);
  }
  
  if (!Array.isArray(parseResult.data) || parseResult.data.length === 0) {
    throw new Error('AI response must contain an array of questions');
  }
  
  // Ensure minimum number of questions
  if (parseResult.data.length < 3) {
    throw new Error('AI response must contain at least 3 questions');
  }
  
  return parseResult.cleaned;
};