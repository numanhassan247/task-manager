const express = require('express')
const router = new express.Router()
const User = require('../Models/User')
const auth = require('../middleware/auth')
var multer = require('multer')
const sharp = require('sharp')




router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})
router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch (e) {
        res.status(402).send({ 'error': e.message })
    }
})
router.post('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter(val => val.token !== req.token)
        await req.user.save()

        res.status(200).send('Logged out')
    } catch (e) {
        res.status(500).send({ 'error': e.message })
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.status(200).send(req.user)
})

router.get('/users/:id', async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).send({ 'error': 'not found' })
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation)
        return res.status(404).send({ 'error': 'Invalid update key' })

    try {

        const user = req.user
        Object.assign(user, req.body)
        await user.save();

        // BELOW LINE DON'T RUN MIDDLEWARE
        // const user = await User.findByIdAndUpdate(id,req.body,{'new': true,'runValidators': true})

        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send('user deleted')
    } catch (e) {
        res.status(500).send(e)
    }
})

// UNUSED FUNCTION 
router.patch('/users/:id', async (req, res) => {
    const { id } = req.params
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation)
        return res.status(404).send({ 'error': 'Invalid update key' })

    try {

        const user = await User.findById(id)
        Object.assign(user, req.body)
        await user.save();

        // BELOW LINE DON'T RUN MIDDLEWARE
        // const user = await User.findByIdAndUpdate(id,req.body,{'new': true,'runValidators': true})

        if (!user) {
            return res.status(404).send({ 'error': 'not found' })
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

// UNUSED FUNCTION 
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findByIdAndDelete(id)
        if (!user) {
            return res.status(404).send({ 'error': 'not found' })
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

var upload = multer({
    // dest: 'uploads/', // Upload file to file system
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('Please Upload valid image file'))
        }
        callback(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('file'), async (req, res) => {
    // resize image
    const buffer = await sharp(req.file.buffer).resize({ width: 100, height: 100 }).png().toBuffer()

    // req.user.avatar = req.file.buffer
    req.user.avatar = buffer
    await req.user.save()
    res.send('Uploaded')
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

module.exports = router