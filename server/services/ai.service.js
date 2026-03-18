const { GoogleGenerativeAI } = require("@google/generative-ai");

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
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error("Gemini Error:", err);
    throw err;
  }
};

module.exports = { generateInsight };
