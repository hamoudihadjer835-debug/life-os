const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

// Get all habits
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.userId });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create habit
router.post('/', auth, async (req, res) => {
  try {
    const habit = new Habit({
      user: req.user.userId,
      name: req.body.name,
      icon: req.body.icon || '⭐'
    });
    await habit.save();
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle date (complete/uncomplete)
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.userId });
    const date = req.body.date; // "YYYY-MM-DD"
    const index = habit.completedDates.indexOf(date);
    if (index > -1) {
      habit.completedDates.splice(index, 1);
    } else {
      habit.completedDates.push(date);
    }
    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete habit
router.delete('/:id', auth, async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;