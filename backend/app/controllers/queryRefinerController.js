import QueryRefiner from '../models/queryRefiner.js';

export const createQueryRefiner = async (req, res) => {
  try {
    const doc = new QueryRefiner(req.body);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllQueryRefiner = async (req, res) => {
  try {
    const docs = await QueryRefiner.find().populate('sector').populate('subSector');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 