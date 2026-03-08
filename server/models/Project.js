const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['todo', 'inprogress', 'done'], default: 'todo' },
  dueDate: { type: Date, default: null }
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  tasks: [taskSchema]
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);