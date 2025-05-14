import ClarificationGuidance from '../models/clarificationGuidance.js';

export const createClarificationGuidance = async (req, res) => {
  try {
    const doc = new ClarificationGuidance(req.body);
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllClarificationGuidance = async (req, res) => {
  try {
    const docs = await ClarificationGuidance.find().populate('sector').populate('subSector');
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 