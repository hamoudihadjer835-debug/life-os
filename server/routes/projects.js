const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const auth = require('../middleware/auth');

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.userId });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const project = new Project({ user: req.user.userId, title: req.body.title });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    await Project.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add task to project
router.post('/:id/tasks', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.userId });
    project.tasks.push(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task status (drag & drop)
router.patch('/:id/tasks/:taskId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.userId });
    const task = project.tasks.id(req.params.taskId);
    task.status = req.body.status;
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete task
router.delete('/:id/tasks/:taskId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.userId });
    project.tasks.pull(req.params.taskId);
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;