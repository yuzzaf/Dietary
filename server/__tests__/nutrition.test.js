const { calculateTDEE, calculateTotalCalories, calculateUserTarget } = require("../services/nutrition.service");

describe("Nutrition Service", () => {
  describe("calculateTDEE", () => {
    it("should throw error if user profile is incomplete", () => {
      expect(() => calculateTDEE({ weight: 70 })).toThrow("Incomplete user profile");
    });

    it("should calculate correctly for male using active multiplier", () => {
      // BMR = 10*70 + 6.25*175 - 5*25 + 5 = 1673.75
      // TDEE = 1673.75 * 1.725 (active) = 2887.21875
      const tdee = calculateTDEE({ 
        weight: 70, height: 175, age: 25, gender: "male", activityLevel: "active" 
      });
      expect(tdee).toBe(2887);
    });

    it("should calculate correctly for female using default/sedentary multiplier", () => {
      // BMR = 10*60 + 6.25*160 - 5*25 - 161 = 1314
      // TDEE = 1314 * 1.2 = 1576.8
      const tdee = calculateTDEE({ 
        weight: 60, height: 160, age: 25, gender: "female", activityLevel: "sedentary" 
      });
      expect(tdee).toBe(1577);
    });
  });

  describe("calculateTotalCalories", () => {
    it("should calculate correct total from food logs", () => {
      const logs = [
        { Food: { calories: 150 }, quantity: 2 }, // 300
        { Food: { calories: 50 }, quantity: 1 },  // 50
        { quantity: 1 }                           // missing Food, defaults to 0
      ];
      expect(calculateTotalCalories(logs)).toBe(350);
    });
  });

  describe("calculateUserTarget", () => {
    const mockMaleUser = { weight: 70, height: 175, age: 25, gender: "male", activityLevel: "active" }; // TDEE: 2887
    
    it("should return TDEE if no goal is set", () => {
      expect(calculateUserTarget(mockMaleUser, null)).toBe(2887);
    });

    it("should prioritize targetCalories from goal if it exists", () => {
      expect(calculateUserTarget(mockMaleUser, { targetCalories: 2000 })).toBe(2000);
    });

    it("should reduce 300 calories if goalType is cutting", () => {
      expect(calculateUserTarget(mockMaleUser, { goalType: "cutting" })).toBe(2587);
    });

    it("should add 300 calories if goalType is bulking", () => {
      expect(calculateUserTarget(mockMaleUser, { goalType: "bulking" })).toBe(3187);
    });

    it("should return unchanged TDEE for other goal types", () => {
      expect(calculateUserTarget(mockMaleUser, { goalType: "maintain" })).toBe(2887);
    });
  });
});
