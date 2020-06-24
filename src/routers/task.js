const express = require('express')
const router = new express.Router()
const Task = require('../Models/Task')
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        user: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed)
        match.completed = req.query.completed === 'true'

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        // const tasks = await Task.find({})
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();

        res.status(201).send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }

})
router.get('/tasks/:id', auth, async (req, res) => {
    const { id } = req.params

    try {
        //const task = await Task.findById(id)
        const task = await Task.findOne({ _id: id, user: req.user._id })

        if (!task) {
            return res.status(404).send({ 'error': 'not found' })
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})
router.patch('/tasks/:id', auth, async (req, res) => {
    const { id } = req.params
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation)
        return res.status(404).send({ 'error': 'Invalid update key' })

    try {
        const task = await Task.findOne({ _id: id, user: req.user._id })
        if (!task) {
            return res.status(404).send({ 'error': 'not found' })
        }

        Object.assign(task, req.body)
        await task.save();
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})
router.delete('/tasks/:id', auth, async (req, res) => {
    const { id } = req.params

    try {

        const task = await Task.findOne({ _id: id, user: req.user._id })
        if (!task) {
            return res.status(404).send({ 'error': 'not found' })
        }
        task.remove()

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router