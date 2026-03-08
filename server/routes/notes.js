const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Note    = require('../models/Note');

// GET all notes
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.userId }).sort({ pinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST create note
router.post('/', auth, async (req, res) => {
  try {
    const note = new Note({ ...req.body, user: req.user.userId });
    await note.save();
    res.status(201).json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT update note
router.put('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true }
    );
    res.json(note);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE note
router.delete('/:id', auth, async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;