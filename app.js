const express = require('express')
const app = express()

app.set('view engine', 'ejs')
app.locals.title = "Red Alert"

app.get('/', (req, res) => {
    console.log('Here')
    console.log(app.locals.title)
    res.render("index", { text: 'World' })
    
})

const userRouter = require('./routes/users')

app.use('/users', userRouter)




app.listen(3000)