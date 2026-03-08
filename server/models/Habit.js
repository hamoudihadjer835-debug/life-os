const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  icon: { type: String, default: '⭐' },
  completedDates: [{ type: String }] // format: "YYYY-MM-DD"
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);