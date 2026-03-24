const calculateTDEE = (user) => {
  const { weight, height, age, gender, activityLevel } = user;

  if (!weight || !height || !age || !gender) {
    const error = new Error("Incomplete user profile");
    error.name = "BadRequest";
    throw error;
  }

  let bmr;
  const normalizedGender = String(gender).toLowerCase();

  if (normalizedGender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const normalizedActivity = String(activityLevel || "sedentary").toLowerCase().trim();
  
  const activityMap = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    "very active": 1.725,
    extra: 1.9
  };

  const multiplier = activityMap[normalizedActivity] || 1.55; // Default to moderate if not mapped exactly

  return Math.round(bmr * multiplier);
};

const calculateTotalCalories = (logs) => {
  const sum = logs.reduce((total, log) => {
    const calories = log.Food?.calories || 0;
    const qty = log.quantity || 1;

    return total + calories * qty;
  }, 0);
  return Math.round(sum);
};

const calculateUserTarget = (user, goal) => {
  const tdee = calculateTDEE(user);

  if (!goal) return tdee;

  if (goal.targetCalories) return Math.round(goal.targetCalories);

  if (goal.goalType === "cutting") return tdee - 300;
  if (goal.goalType === "bulking") return tdee + 300;

  return tdee;
};

module.exports = {
  calculateTDEE,
  calculateTotalCalories,
  calculateUserTarget,
};
