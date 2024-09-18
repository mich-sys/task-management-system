const express = require('express');
const Task = require('../models/task');
const auth = require('../routes/auth');
const router = express.Router();

// create a task
router.post('/', auth, async (req, res) => {
    const { title, description, dueDate } = req.body;
    try {
        const task = new Task({user: req.user.id, title, description, dueDate});
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'server error' });
    }
});

// get all tasks for logged in user
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'server error' });
    }});

    // update a task
router.put('/:id', auth, async (req, res) => {
    const { title, description, dueDate, status } = req.body;
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        task.title = title || task.title;
        task.description = description || task.description;
        task.dueDate = dueDate || task.dueDate;
        task.status = status || task.status;

        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'server error' });
    }
    });

    // delete a task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (task.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'Not authorized' });
        }

        await task.remove();

        res.json({ msg: 'Task removed' });
    } catch (error) {
        res.status(500).json({ error: 'server error' });
    }
});

module.exports = router;

