// Fallback data when AI service is unavailable
export const fallbackInterviewData = {
  technical: {
    greeting: "Welcome to the Technical Interview! Due to AI service unavailability, we're using pre-defined questions.",
    questions: [
      {
        question: "Tell me about yourself and your technical background.",
        category: "Introduction",
        followUps: [
          "What technologies are you most passionate about?",
          "What's your most challenging project so far?",
          "How do you stay updated with new technologies?"
        ]
      },
      {
        question: "Explain the difference between SQL and NoSQL databases.",
        category: "Database Design", 
        followUps: [
          "When would you choose one over the other?",
          "Can you give examples of each type?",
          "How do you handle data consistency in NoSQL?"
        ]
      },
      {
        question: "How would you optimize a slow-performing web application?",
        category: "Performance",
        followUps: [
          "What tools would you use to identify bottlenecks?",
          "How do you handle database query optimization?",
          "What about frontend performance optimization?"
        ]
      }
    ]
  },
  
  hr: {
    greeting: "Welcome to the HR Interview! We'll explore your soft skills and cultural fit.",
    questions: [
      {
        question: "Tell me about a time when you had to work with a difficult team member.",
        scenario: "Conflict Resolution",
        type: "STAR",
        tips: [
          "Use the STAR method (Situation, Task, Action, Result)",
          "Focus on your communication and problem-solving skills",
          "Show how you maintained professionalism",
          "Highlight the positive outcome"
        ]
      },
      {
        question: "Describe a situation where you had to learn something completely new quickly.",
        scenario: "Learning Agility", 
        type: "STAR",
        tips: [
          "Describe your learning approach and methodology",
          "Show resourcefulness and initiative",
          "Mention how you applied the new knowledge",
          "Discuss the impact of your quick learning"
        ]
      },
      {
        question: "How do you handle stress and tight deadlines?",
        scenario: "Stress Management",
        type: "Behavioral",
        tips: [
          "Give specific examples of high-pressure situations",
          "Describe your stress management techniques",
          "Show how you prioritize and organize work",
          "Mention how you communicate with stakeholders"
        ]
      }
    ]
  },

  feedback: {
    generic: "Thank you for completing the interview! While AI feedback is currently unavailable, here are some general tips: Practice the STAR method for behavioral questions, prepare specific examples from your experience, research the company and role thoroughly, and don't forget to ask thoughtful questions about the position and company culture."
  }
};

export const getAIStatus = () => {
  return {
    isAvailable: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    message: process.env.NEXT_PUBLIC_GEMINI_API_KEY 
      ? "AI service is configured" 
      : "AI service is not available - using fallback mode"
  };
};