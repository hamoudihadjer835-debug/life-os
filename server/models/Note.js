const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:     { type: String, required: true },
  content:   { type: String, default: '' },
  category:  { type: String, default: 'General' },
  tags:      [{ type: String }],
  pinned:    { type: Boolean, default: false },
  color:     { type: String, default: '#7c6fcd' },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);