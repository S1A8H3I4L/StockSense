const StockMove = require("../models/StockMove");

const getMoveHistory = async (req, res) => {
  try {
    const { docType, search, from, to } = req.query;
    const query = {};
    if (docType) query.docType = docType;
    if (search) query.reference = { $regex: search, $options: "i" };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const moves = await StockMove.find(query)
      .populate("product", "name sku")
      .populate("performedBy", "name")
      .sort({ date: -1 })
      .limit(500);

    res.json(moves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMoveHistory };
