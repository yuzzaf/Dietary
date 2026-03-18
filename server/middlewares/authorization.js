const { FoodLog } = require("../models/index.js");

const authorizeFoodLog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const data = await FoodLog.findByPk(id);

    if (!data) {
      return res.status(404).json({ message: "Data not found" });
    }

    if (data.user_id !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = authorizeFoodLog;
