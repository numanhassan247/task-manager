const express = require('express')
require('./db/mongoose')

// loading Models
const Task = require('./Models/Task')

// loading routers
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)



app.listen(port, () => console.log('Server Started at port ', port))
