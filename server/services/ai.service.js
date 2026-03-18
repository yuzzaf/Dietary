const axios = require("axios");

const detectWithGemini = async (file) => {
  const base64 = file.buffer.toString("base64");

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            { text: "What food is this? Answer only the name." },
            {
              inlineData: {
                mimeType: file.mimetype,
                data: base64,
              },
            },
          ],
        },
      ],
    },
  );

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text;
};

module.exports = { detectWithGemini };
