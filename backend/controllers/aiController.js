import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// General Gemini AI chat endpoint
export const geminiChat = async (req, res) => {
  try {
    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is not set in environment variables");
      return res.status(500).json({ 
        error: "AI service is not configured. Please set GEMINI_API_KEY in your environment variables.",
        details: "Missing API key"
      });
    }

    let messages = req.body.messages;

    // Support legacy prompt/message for compatibility
    if (!messages && (req.body.prompt || req.body.message)) {
      messages = [{ role: "user", content: req.body.prompt || req.body.message }];
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (messages.length === 0) {
      return res.status(400).json({ error: "At least one message is required." });
    }

    // Build conversation history for Gemini
    // Keep last 10 messages for context (to avoid token limits)
    const recentMessages = messages.slice(-10);
    
    // Extract system prompt if present
    const systemMessage = recentMessages.find(m => m.role === "system");
    const userMessages = recentMessages.filter(m => m.role === "user" || m.role === "assistant");
    
    // Combine messages intelligently
    let promptText = "";
    if (systemMessage) {
      promptText = `${systemMessage.content}\n\n`;
    }
    
    // Build conversation history
    for (const msg of userMessages) {
      if (msg.role === "user") {
        promptText += `User: ${msg.content}\n\n`;
      } else if (msg.role === "assistant") {
        promptText += `Assistant: ${msg.content}\n\n`;
      }
    }

    // Ensure we have a prompt
    if (!promptText.trim()) {
      promptText = recentMessages[recentMessages.length - 1]?.content || "";
    }

    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{ parts: [{ text: promptText.trim() }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    // Extract response text
    const aiMessage =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
      response.data?.candidates?.[0]?.content?.parts?.find(p => p.text)?.text ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    if (!aiMessage || aiMessage.trim() === "") {
      return res.status(500).json({ 
        error: "AI service returned an empty response",
        details: "The AI model did not generate any content"
      });
    }

    res.json({ 
      response: aiMessage,
      context: req.body.context || "general"
    });
  } catch (error) {
    console.error("Gemini API error:", error?.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response) {
      // API returned an error
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      if (statusCode === 401 || statusCode === 403) {
        return res.status(500).json({ 
          error: "AI service authentication failed. Please check your API key configuration.",
          details: errorData?.error?.message || "Invalid API key"
        });
      } else if (statusCode === 429) {
        return res.status(429).json({ 
          error: "AI service rate limit exceeded. Please try again later.",
          details: "Too many requests"
        });
      } else if (statusCode === 400) {
        return res.status(400).json({ 
          error: "Invalid request to AI service.",
          details: errorData?.error?.message || "Bad request"
        });
      }
      
      return res.status(500).json({ 
        error: "AI service error occurred.",
        details: errorData?.error?.message || error.message
      });
    } else if (error.request) {
      // Request was made but no response received
      return res.status(503).json({ 
        error: "AI service is temporarily unavailable. Please try again later.",
        details: "Network timeout or connection error"
      });
    } else {
      // Other error
      return res.status(500).json({ 
        error: "An unexpected error occurred while processing your request.",
        details: error.message
      });
    }
  }
};

// Impact score using Gemini
export const getImpactScore = async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "AI service is not configured. Please set GEMINI_API_KEY in your environment variables."
      });
    }

    const { idea } = req.body;
    if (!idea) {
      return res.status(400).json({ error: "Idea data is required." });
    }

    const prompt = `Rate the impact of this idea on a scale of 1 to 100 and provide a brief explanation (1-2 sentences). Format your response as: "Score: X/100. Explanation: [your explanation]"

Idea: ${idea}`;

    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY,
        },
        timeout: 30000,
      }
    );

    const impactScore =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.data?.candidates?.[0]?.content?.parts?.find(p => p.text)?.text ||
      "";

    if (!impactScore) {
      return res.status(500).json({ 
        error: "AI service returned an empty response"
      });
    }

    res.json({ impactScore });
  } catch (error) {
    console.error("Gemini API error:", error?.response?.data || error.message);
    
    if (error.response) {
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      if (statusCode === 401 || statusCode === 403) {
        return res.status(500).json({ 
          error: "AI service authentication failed. Please check your API key configuration."
        });
      } else if (statusCode === 429) {
        return res.status(429).json({ 
          error: "AI service rate limit exceeded. Please try again later."
        });
      }
      
      return res.status(500).json({ 
        error: errorData?.error?.message || "AI service error occurred."
      });
    } else if (error.request) {
      return res.status(503).json({ 
        error: "AI service is temporarily unavailable. Please try again later."
      });
    } else {
      return res.status(500).json({ 
        error: error.message || "An unexpected error occurred."
      });
    }
  }
};

// Export for routes
export const chat = geminiChat;
export default { chat, getImpactScore, geminiChat };
