
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Check if API key is available
if (!apiKey) {
  console.warn("NEXT_PUBLIC_GEMINI_API_KEY is not set. AI features will be disabled.");
}

let genAI = null;
let model = null;
let chatSession = null;

try {
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    
    // Try gemini-2.5-flash first, fallback to gemini-1.5-flash if needed
    model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ];

    chatSession = model.startChat({
      generationConfig,
      safetySettings
    });
  }
} catch (error) {
  console.error("Failed to initialize Gemini AI:", error);
}

// Enhanced chat session with error handling and retries
export const getChatSession = async () => {
  if (!chatSession) {
    throw new Error("Gemini AI is not available. Please check your API key and network connection.");
  }
  return chatSession;
};

// Wrapper function for sending messages with retry logic
export const sendMessageWithRetry = async (message, maxRetries = 3) => {
  if (!chatSession) {
    throw new Error("Gemini AI is not initialized");
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await chatSession.sendMessage(message);
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      if (error.message?.includes('503') || error.message?.includes('service is currently unavailable')) {
        if (attempt === maxRetries) {
          throw new Error("Gemini AI service is currently unavailable. Please try again later.");
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }
      
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        throw new Error("API quota exceeded. Please try again later or check your billing.");
      }
      
      if (error.message?.includes('401') || error.message?.includes('API key')) {
        throw new Error("Invalid API key. Please check your NEXT_PUBLIC_GEMINI_API_KEY environment variable.");
      }
      
      // For other errors, don't retry
      throw error;
    }
  }
};

// Fallback chat session for backward compatibility
export { chatSession };
