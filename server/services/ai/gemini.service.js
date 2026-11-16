const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../../helpers/logger");

const GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

const getGenAI = () => new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sanitizeHistory = (rawHistory) => {
  if (!Array.isArray(rawHistory)) return [];

  const firstUserIdx = rawHistory.findIndex((m) => m && m.role === "user");
  if (firstUserIdx === -1) return [];

  const formatted = [];
  for (const msg of rawHistory.slice(firstUserIdx)) {
    if (!msg || !msg.text || !msg.text.trim()) continue;
    const role = msg.role === "user" ? "user" : "model";
    if (formatted.length === 0 && role !== "user") continue;

    if (formatted.length > 0 && formatted[formatted.length - 1].role === role) {
      formatted[formatted.length - 1].parts[0].text += "\n" + msg.text;
    } else {
      formatted.push({ role, parts: [{ text: msg.text }] });
    }
  }

  if (formatted.length > 0 && formatted[formatted.length - 1].role === "user") {
    formatted.pop();
  }

  return formatted;
};

const generateInsight = async ({
  foods,
  targetCalories,
  consumedCalories,
  remaining,
  status,
}) => {
  const prompt = `
User daily calorie target: ${targetCalories} kcal
Consumed today: ${consumedCalories} kcal
Remaining: ${remaining} kcal
Status: ${status}

Foods eaten today:
${foods.map((f) => `- ${f.name} (${f.calories} kcal)`).join("\n")}

Instructions:
- Explain the user's condition (deficit, balanced, or excess)
- Give short health advice
- Suggest foods if still lacking calories
- Keep it concise (max 3-4 sentences)
- Speak casually like a friendly nutrition coach
- Avoid robotic tone
`;

  const genAI = getGenAI();
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      lastError = err;
      logger.error(`Gemini Insight Error with ${modelName}: ${err.message}`);
    }
  }

  throw lastError;
};

const detectWithGemini = async (file) => {
  const genAI = getGenAI();
  const base64Image = file.buffer.toString("base64");
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [
          {
            parts: [
              {
                text: "Return only the food name in English. No explanation.",
              },
              {
                inlineData: {
                  mimeType: file.mimetype,
                  data: base64Image,
                },
              },
            ],
          },
        ],
      });

      let text = result.response.text();
      return text.toLowerCase().replace(".", "").split("\n")[0].trim();
    } catch (err) {
      lastError = err;
      logger.error(`Gemini Detect Error with ${modelName}: ${err.message}`);
    }
  }

  throw lastError;
};

const chatWithGemini = async (history, message, userContext = "", socketId = null, io = null) => {
  if (Array.isArray(message) && typeof history === "string") {
    const temp = message;
    message = history;
    history = temp;
  }

  const promptText = typeof message === "string" ? message.trim() : "";
  if (!promptText) {
    throw new Error("No content is provided for sending chat message.");
  }

  const genAI = getGenAI();
  const systemInstruction = `You are a friendly expert nutritionist and AI assistant for the Dietary app. You answer questions about calories, diet, health, and fitness. Give short, concise, and highly effective answers (maximum 2-3 paragraphs). Be encouraging! ${userContext}`;
  const validHistory = sanitizeHistory(history);

  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction,
      });

      const chat = model.startChat({ history: validHistory });

      if (io && socketId) {
        try {
          const result = await chat.sendMessageStream(promptText);
          let streamedAny = false;
          for await (const chunk of result.stream) {
            let chunkText = "";
            try {
              chunkText = chunk.text();
            } catch {
              chunkText = chunk.candidates?.[0]?.content?.parts?.[0]?.text || "";
            }
            if (chunkText) {
              streamedAny = true;
              io.to(socketId).emit("chat-stream", { text: chunkText, isDone: false });
            }
          }
          io.to(socketId).emit("chat-stream", { text: "", isDone: true });
          return "Stream completed";
        } catch (streamErr) {
          logger.error(`Gemini Stream Error with ${modelName}: ${streamErr.message}`);

          try {
            const fallbackRes = await chat.sendMessage(promptText);
            const fallbackText = fallbackRes.response?.text?.() || "";
            if (fallbackText) {
              io.to(socketId).emit("chat-stream", { text: fallbackText, isDone: true });
              return "Fallback completed";
            }
          } catch (fallbackErr) {
            logger.error(`Gemini Fallback Error with ${modelName}: ${fallbackErr.message}`);
          }

          continue;
        }
      } else {
        const result = await chat.sendMessage(promptText);
        const response = await result.response;
        return response.text();
      }
    } catch (modelErr) {
      logger.error(`Gemini Model Error with ${modelName}: ${modelErr.message}`);
    }
  }

  if (io && socketId) {
    io.to(socketId).emit("chat-stream", { 
      text: " Maaf, semua model AI sedang mengalami gangguan atau kehabisan kuota saat ini. Silakan coba kembali beberapa saat lagi.", 
      isDone: true 
    });
  }
  throw { name: "InternalServerError", message: "AI is currently unavailable" };
};

module.exports = { 
  GEMINI_MODELS, 
  generateInsight, 
  detectWithGemini, 
  chatWithGemini, 
  sanitizeHistory 
};