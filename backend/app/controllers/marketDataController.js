import MarketData from '../models/marketData.js';

export const createMarketData = async (req, res) => {
  try {
    const { url, ...rest } = req.body;
    const doc = new MarketData(rest);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllMarketData = async (req, res) => {
  try {
    const docs = await MarketData.find().populate('sector').populate('subSector');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 