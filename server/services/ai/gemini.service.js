const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../../helpers/logger");

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

  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    logger.error("Gemini Error:", err.message);
    throw err;
  }
};

const detectWithGemini = async (file) => {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-lite",
  });

  const base64Image = file.buffer.toString("base64");

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

  text = text.toLowerCase().replace(".", "").split("\n")[0].trim();

  return text;
};

const chatWithGemini = async (history, message, userContext = "", socketId = null, io = null) => {
  const genAI = getGenAI();
  const systemInstruction = `You are a friendly expert nutritionist and AI assistant for the Dietary app. You answer questions about calories, diet, health, and fitness. Give short, concise, and highly effective answers (maximum 2-3 paragraphs). Be encouraging! ${userContext}`;
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite",
    systemInstruction,
  });

  try {
    const validHistory = sanitizeHistory(history);
    const chat = model.startChat({ history: validHistory });

    if (io && socketId) {
      try {
        const result = await chat.sendMessageStream(message);
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
        logger.error(`Gemini Stream Error: ${streamErr.stack || streamErr.message || streamErr}`);

        try {
          const fallbackRes = await chat.sendMessage(message);
          const fallbackText = fallbackRes.response?.text?.() || "";
          if (fallbackText) {
            io.to(socketId).emit("chat-stream", { text: fallbackText, isDone: true });
            return "Fallback completed";
          }
        } catch (fallbackErr) {
          logger.error(`Gemini Fallback Error: ${fallbackErr.stack || fallbackErr.message || fallbackErr}`);
        }

        io.to(socketId).emit("chat-stream", { 
          text: " Maaf, asisten AI sedang mengalami gangguan koneksi. Silakan kirim pesan Anda kembali.", 
          isDone: true 
        });
        return "Stream error";
      }
    } else {
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    }
  } catch (err) {
    logger.error(`Gemini Chat Error: ${err.stack || err.message || err}`);
    if (io && socketId) {
      io.to(socketId).emit("chat-stream", { 
        text: " Maaf, asisten AI sedang tidak tersedia saat ini. Silakan coba lagi.", 
        isDone: true 
      });
    }
    throw { name: "InternalServerError", message: "AI is currently unavailable" };
  }
};

module.exports = { generateInsight, detectWithGemini, chatWithGemini, sanitizeHistory };