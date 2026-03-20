const axios = require("axios");

const detectFoodHF = async (file) => {
  const response = await axios.post(
    "https://api-inference.huggingface.co/models/prithivMLmods/Food-101-93M",
    file.buffer,
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
    },
  );

  const result = response.data;

  if (!result || !result.length) {
    throw { name: "BadRequest", message: "Detection failed" };
  }

  return {
    label: result[0].label,
    score: result[0].score,
  };
};

module.exports = { detectFoodHF };
