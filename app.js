const express = require('express')
const authRoutes = require('./routes/authRoutes');
const mapRoutes = require('./routes/mapRoutes');
const discRoutes = require('./routes/discRoutes');
const randomRoutes = require('./routes/randomRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser , requireAdminAuth } = require('./middleware/authMiddleware');
const pool = require('./dbms/database');
require('dotenv').config();

const app = express();

//midlewares
app.use(express.static("public"));
//takes in any json data with request, passes into javascript object, attaches to req object
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.locals.title = "Red Alert";
app.use(express.urlencoded({ extended: true }));

app.get('*', checkUser);

app.get('/', (req, res) => {
    res.render('layout');
})


app.use(randomRoutes);

//logins and registrations
app.use(authRoutes);

app.use(mapRoutes);

app.use(discRoutes);

//doesn't match any above routes, 404s
app.use((req, res) => {
    res.status(404).render('404');
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
}).on('error', (err) => {
    console.error('Failed to start the server:', err);
});