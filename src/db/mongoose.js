const mongoose = require('mongoose')
const validator = require('validator')

const dbServerURL = 'mongodb://127.0.0.1:27017/';
const database = 'task-manager-api';

mongoose.connect(dbServerURL + database, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});