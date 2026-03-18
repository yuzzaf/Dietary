const calculateTDEE = (user) => {
  const { weight, height, age, gender, activityLevel } = user;

  if (!weight || !height || !age || !gender) {
    throw {
      name: "BadRequest",
      message: "Incomplete user profile",
    };
  }

  let bmr;

  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    active: 1.55,
  };

  const multiplier = activityMap[activityLevel] || 1.2;

  return Math.round(bmr * multiplier);
};

const calculateTotalCalories = (logs) => {
  return logs.reduce((total, log) => {
    const calories = log.Food?.calories || 0;
    const qty = log.quantity || 1;

    return total + calories * qty;
  }, 0);
};

module.exports = {
  calculateTDEE,
  calculateTotalCalories,
};
