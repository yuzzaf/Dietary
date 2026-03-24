const logger = require("../helpers/logger");
const { User, FoodLog, Food, UserGoal, AIInsight } = require("../models");
const { generateInsight } = require("../services/ai/gemini.service.js");
const {
  calculateTotalCalories,
  calculateUserTarget,
} = require("../services/nutrition.service");

const { Op } = require("sequelize");

class AIController {
  static async generateInsight(req, res, next) {
    try {
      const userId = req.user.id;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await AIInsight.findOne({
        where: {
          userId,
          date: {
            [Op.gte]: today,
          },
        },
      });

      if (existing) {
        return res.json({
          status: "success",
          data: {
            targetCalories: existing.caloriesTarget,
            consumedCalories: existing.caloriesConsumed,
            remaining: existing.caloriesTarget - existing.caloriesConsumed,
            status: existing.status,
            insight: existing.content,
          },
          meta: {
            ai: "gemini",
            cached: true,
          },
        });
      }

      const user = await User.findByPk(userId);
      if (!user.weight || !user.height) {
        return res.json({
          status: "success",
          data: {
            targetCalories: 0,
            consumedCalories: 0,
            remaining: 0,
            status: "unknown",
            insight:
              "Please go to the Profile page and complete your weight and height to unlock personalized AI insights.",
            goalType: null,
          },
          meta: {
            ai: "system",
            cached: false,
          },
        });
      }

      const goal = await UserGoal.findOne({ where: { userId } });

      const logs = await FoodLog.findAll({
        where: {
          userId,
          consumedAt: {
            [Op.gte]: today,
          },
        },
        include: [{ model: Food }],
      });

      const foods = logs.map((l) => l.Food);

      const targetCalories = calculateUserTarget(user, goal);
      const consumedCalories = calculateTotalCalories(logs);
      const remaining = targetCalories - consumedCalories;

      let status = "balanced";
      if (remaining > 200) status = "deficit";
      else if (remaining < -200) status = "excess";

      let insight;
      try {
        insight = await generateInsight({
          foods,
          targetCalories,
          consumedCalories,
          remaining,
          status,
        });
      } catch (geminiError) {
        logger.error("AI Error", geminiError.message);
        insight = "Keep maintaining a balanced diet.";
      }

      await AIInsight.create({
        userId,
        date: new Date(),
        content: insight,
        caloriesConsumed: consumedCalories,
        caloriesTarget: targetCalories,
        status,
      });

      res.json({
        status: "success",
        data: {
          targetCalories,
          consumedCalories,
          remaining,
          status,
          insight,
          goalType: goal ? goal.goalType : null,
        },
        meta: {
          ai: "gemini",
          cached: false,
        },
      });
    } catch (err) {
      next(err);
      logger.error("AI Insight Error", err.message);
    }
  }

  static async getInsightsWeekly(req, res, next) {
    try {
      const userId = req.user.id;
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const insights = await AIInsight.findAll({
        where: {
          userId,
          date: {
            [Op.gte]: oneWeekAgo,
          },
        },
        order: [["date", "DESC"]],
      });

      const totalWeeklyCalories = insights.reduce(
        (sum, item) => sum + (item.caloriesConsumed || 0),
        0,
      );
      const totalWeeklyTarget = insights.reduce(
        (sum, item) => sum + (item.caloriesTarget || 0),
        0,
      );

      res.json({
        status: "success",
        data: insights,
        meta: {
          total: insights.length,
          timeframe: "7 days",
          totalWeeklyCalories,
          totalWeeklyTarget,
        },
      });
    } catch (err) {
      next(err);
      logger.error("Weekly Insights Error", err.message);
    }
  }

  static async exportInsightWeeklyPdf(req, res, next) {
    try {
      const PDFDocument = require("pdfkit");
      const doc = new PDFDocument({ margin: 50 });
      const userId = req.user.id;
      const user = await User.findByPk(userId);

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const insights = await AIInsight.findAll({
        where: { userId, date: { [Op.gte]: oneWeekAgo } },
        order: [["date", "DESC"]],
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Dietary_Weekly_Report_${user.firstName}.pdf`,
      );

      doc.pipe(res);

      doc
        .fontSize(24)
        .fillColor("#2563eb")
        .text("Dietary", { align: "center", font: "Helvetica-Bold" });
      doc
        .fontSize(16)
        .fillColor("#1f2937")
        .text("Weekly AI Report", { align: "center" });
      doc.moveDown(2);

      doc
        .fontSize(12)
        .fillColor("#4b5563")
        .text(`User: ${user.firstName} ${user.lastName || ""}`);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`);
      doc.moveDown(2);

      if (insights.length === 0) {
        doc.fontSize(12).text("No data recorded over the last 7 days.");
      } else {
        const totalCals = insights.reduce(
          (acc, curr) => acc + (curr.caloriesConsumed || 0),
          0,
        );
        const totalTarget = insights.reduce(
          (acc, curr) => acc + (curr.caloriesTarget || 0),
          0,
        );
        doc
          .fontSize(14)
          .fillColor("#1f2937")
          .text(`Weekly Summary`, { underline: true });
        doc
          .fontSize(12)
          .fillColor("#4b5563")
          .text(`Total Calories Consumed: ${totalCals} kcal`);
        doc.text(`Total Target Calories: ${totalTarget} kcal`);
        doc.moveDown(2);

        doc
          .fontSize(14)
          .fillColor("#1f2937")
          .text(`Daily Log Insights`, { underline: true });
        doc.moveDown(1);

        insights.forEach((insight) => {
          doc
            .fontSize(12)
            .fillColor("#2563eb")
            .text(`${new Date(insight.date).toLocaleDateString()}`);
          doc
            .fontSize(10)
            .fillColor("#1f2937")
            .text(
              `Status: ${insight.status.toUpperCase()} (${insight.caloriesConsumed} / ${insight.caloriesTarget} kcal)`,
            );
          doc
            .fontSize(11)
            .fillColor("#4b5563")
            .text(`AI Insight: ${insight.content}`);
          doc.moveDown(1.5);
        });
      }

      doc.end();
    } catch (err) {
      if (!res.headersSent) {
        next(err);
      } else {
        logger.error("PDF Export Error", err.message);
      }
    }
  }

  static async handleChat(req, res, next) {
    try {
      const { message, history, socketId } = req.body;
      if (!message)
        throw { name: "BadRequest", message: "Message is required" };

      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const logs = await FoodLog.findAll({
        where: {
          userId,
          consumedAt: {
            [Op.gte]: today,
          },
        },
        include: [{ model: Food }],
      });

      const foods = logs.map((l) => l.Food);

      const {
        calculateTotalCalories,
        calculateUserTarget,
      } = require("../services/nutrition.service");
      const consumedCalories = calculateTotalCalories(logs);

      const user = await User.findByPk(userId);
      const goal = await UserGoal.findOne({ where: { userId } });
      const targetCalories =
        user.weight && user.height
          ? calculateUserTarget(user, goal)
          : "Unknown";

      const userContext = `Here is the user's current context today: the user has consumed ${consumedCalories} kcal today. Their daily target is ${targetCalories} kcal. The foods they have logged today are: ${foods.length > 0 ? foods.map((f) => `${f.name} (${f.calories} kcal)`).join(", ") : "None"}. Always answer using this correct context if they ask about their daily calories.`;

      const { chatWithGemini } = require("../services/ai/gemini.service.js");
      const io = req.app.get("io");

      setTimeout(() => {
        chatWithGemini(history || [], message, userContext, socketId, io).catch(
          (err) => logger.error("Stream Error", err),
        );
      }, 0);

      res.json({
        status: "success",
        data: {
          reply: "Streaming started...",
        },
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AIController;
