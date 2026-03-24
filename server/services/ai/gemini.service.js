const { GoogleGenerativeAI } = require("@google/generative-ai");
const logger = require("../../helpers/logger");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite",
    systemInstruction: `You are a friendly expert nutritionist and AI assistant for the Dietary app. You answer questions about calories, diet, health, and fitness. Give short, concise, and highly effective answers (maximum 2-3 paragraphs). Be encouraging! ${userContext}`
  });

  try {
    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
    });

    if (io && socketId) {
      try {
        const result = await chat.sendMessageStream(message);
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          io.to(socketId).emit("chat-stream", { text: chunkText, isDone: false });
        }
        io.to(socketId).emit("chat-stream", { text: "", isDone: true });
        return "Stream completed";
      } catch (streamErr) {
        logger.error("Gemini Stream Error:", streamErr.message);
        io.to(socketId).emit("chat-stream", { text: " Sorry, I am having trouble connecting.", isDone: true });
        return "Stream error";
      }
    } else {
      const result = await chat.sendMessage(message);
      const response = await result.response;
      return response.text();
    }
  } catch (err) {
    logger.error("Gemini Chat Error:", err.message);
    throw { name: "InternalServerError", message: "AI is currently unavailable" };
  }
};

module.exports = { generateInsight, detectWithGemini, chatWithGemini };
