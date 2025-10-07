import { chatSession } from '@/utils/GeminiAIModal';
import { parseAIJsonResponse, getFallbackQuestions } from '@/utils/jsonParser';

export const generateInterviewQuestions = async ({ 
  jobPosition, 
  jobDesc, 
  jobExperience, 
  resumeContent = null 
}) => {
  try {
    let InputPrompt;

    if (resumeContent && resumeContent.trim()) {
      // Enhanced prompt with resume analysis
      InputPrompt = `
You are an expert HR interviewer conducting a technical interview. Please analyze the provided information and generate 5 comprehensive interview questions with detailed answers.

**Job Information:**
- Position: ${jobPosition}
- Job Description/Tech Stack: ${jobDesc}
- Required Experience: ${jobExperience} years

**Candidate's Resume Content:**
${resumeContent}

**Instructions:**
1. Analyze the candidate's resume to understand their background, skills, and experience
2. Generate questions that are specifically tailored to:
   - The job requirements and tech stack mentioned
   - The candidate's experience level and background from their resume
   - Skills and projects mentioned in their resume
   - Gaps or areas that need clarification based on the resume

**Question Types to Include:**
- 2 technical questions based on skills mentioned in resume and job requirements
- 1 project-based question about specific projects/experience from the resume
- 1 problem-solving/scenario question relevant to the role
- 1 behavioral question about career progression or challenges mentioned in resume

**Response Format:**
Please provide the response in JSON format with exactly this structure:
[
  {
    "Question": "## Question Title\n\nYour detailed question here with proper markdown formatting.\n\n*Include context or specific requirements.*",
    "Answer": "### Sample Answer Structure:\n\n**Key Points to Cover:**\n- Point 1 with examples\n- Point 2 with technical details\n\n**Evaluation Criteria:**\n- What interviewers look for\n- Red flags to avoid\n\n**Example Response:**\n> Sample answer showing expected depth and format"
  }
]

**Important Guidelines:**
- Questions should be challenging but appropriate for ${jobExperience} years of experience
- Use markdown formatting (headers, bold, code blocks, bullet points) for better readability
- Include specific technologies/skills mentioned in both job description and resume
- Reference specific experiences or projects from the resume when relevant
- Answers should include structured guidance with examples and evaluation criteria
- Make questions realistic and commonly asked in actual interviews for this role
- Use proper markdown formatting: ## for question titles, ### for answer sections, **bold** for emphasis, \`code\` for technical terms
`;
    } else {
      // Standard prompt without resume
      InputPrompt = `
You are an expert HR interviewer conducting a technical interview. Generate 5 comprehensive interview questions with detailed answers.

**Job Information:**
- Position: ${jobPosition}
- Job Description/Tech Stack: ${jobDesc}
- Years of Experience Required: ${jobExperience}

**Instructions:**
Generate questions appropriate for a ${jobPosition} role with ${jobExperience} years of experience, focusing on the technologies and skills mentioned in: ${jobDesc}

**Question Types to Include:**
- 2 technical questions about specific technologies/frameworks mentioned
- 1 system design or architecture question (if applicable to role)
- 1 problem-solving/coding question (if technical role)
- 1 behavioral/situational question relevant to the role level

**Response Format:**
Please provide the response in JSON format with exactly this structure:
[
  {
    "Question": "## Question Title\\n\\nYour detailed question here with proper markdown formatting.\\n\\n*Include context or specific requirements.*",
    "Answer": "### Sample Answer Structure:\\n\\n**Key Points to Cover:**\\n- Point 1 with examples\\n- Point 2 with technical details\\n\\n**Evaluation Criteria:**\\n- What interviewers look for\\n- Red flags to avoid\\n\\n**Example Response:**\\n> Sample answer showing expected depth and format"
  }
]

**Guidelines:**
- Questions should be challenging but appropriate for ${jobExperience} years of experience
- Use markdown formatting (headers, bold, code blocks, bullet points) for better readability
- Include specific technologies mentioned in job description: ${jobDesc}
- Answers should include structured guidance with examples and evaluation criteria
- Make questions realistic and commonly asked in actual interviews for this role
- Use proper markdown formatting: ## for question titles, ### for answer sections, **bold** for emphasis, \`code\` for technical terms
`;
    }

    console.log('Sending prompt to AI:', InputPrompt);
    
    const result = await chatSession.sendMessage(InputPrompt);
    const MockJsonResp = result.response.text();

    console.log('AI Response:', MockJsonResp);
    
    const parseResult = parseAIJsonResponse(MockJsonResp);
    
    if (parseResult.success) {
      // Validate that we have an array of questions
      if (!Array.isArray(parseResult.data) || parseResult.data.length === 0) {
        console.error('Invalid response format - not an array or empty');
        return {
          success: false,
          error: 'Invalid response format',
          questions: JSON.stringify(getFallbackQuestions(jobPosition)),
          parsedQuestions: getFallbackQuestions(jobPosition)
        };
      }
      
      // Validate each question object
      for (let i = 0; i < parseResult.data.length; i++) {
        if (!parseResult.data[i].Question || !parseResult.data[i].Answer) {
          console.error(`Invalid question format at index ${i}`);
          return {
            success: false,
            error: `Invalid question format at index ${i}`,
            questions: JSON.stringify(getFallbackQuestions(jobPosition)),
            parsedQuestions: getFallbackQuestions(jobPosition)
          };
        }
      }
      
      return {
        success: true,
        questions: JSON.stringify(parseResult.data),
        parsedQuestions: parseResult.data
      };
    } else {
      console.error('JSON parsing error:', parseResult.error);
      return {
        success: false,
        error: parseResult.error,
        questions: JSON.stringify(getFallbackQuestions(jobPosition)),
        parsedQuestions: getFallbackQuestions(jobPosition)
      };
    }

  } catch (error) {
    console.error('Error generating interview questions:', error);
    return {
      success: false,
      error: error.message,
      questions: null
    };
  }
};

export const generateResumeBasedPrompt = (resumeContent) => {
  return `
Based on the following resume content, please extract key information that would be relevant for interview question generation:

Resume Content:
${resumeContent}

Please identify and return:
1. Key technical skills and technologies
2. Years of experience in different areas
3. Notable projects and achievements
4. Educational background
5. Current/most recent role and responsibilities
6. Industry domains worked in

This analysis will be used to generate personalized interview questions.
`;
};