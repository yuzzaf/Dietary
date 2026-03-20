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

module.exports = { generateInsight, detectWithGemini };
