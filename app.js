const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const mapRoutes = require('./routes/mapRoutes');
const discRoutes = require('./routes/discRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const cookieParser = require('cookie-parser');
const path = require('path');
const { requireAuth, checkUser , requireAdminAuth } = require('./middleware/authMiddleware');
const pool = require('./dbms/database');
require('dotenv').config();


//setting up socket.io and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);



//midlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use('/utils', express.static(path.join(__dirname, 'utils')));
//app.use(socketMiddleware(io));
//takes in any json data with request, passes into javascript object, attaches to req object
app.use(express.json());
app.use(cookieParser());
app.set('io', io);
app.set('view engine', 'ejs');
app.locals.title = "Red Alert";
app.use(express.urlencoded({ extended: true }));


const schoolSockets = {};
const userSockets = {};
//setting up sockets
io.on("connection", (socket) => {
    console.log("socket connected: " + socket.id);
    

    socket.on('login', (socket_user) => {
        const roomName = `${socket_user.school_uid}-${socket_user.user_type}`;
        if(!schoolSockets[socket_user.school_uid]) {
            schoolSockets[socket_user.school_uid] = [];
        }
        
        if (!schoolSockets[socket_user.school_uid].includes(roomName)) {
            schoolSockets[socket_user.school_uid].push(roomName);
        }
        //sets the user's socket
        userSockets[socket_user.user_uid] = socket.id;
        //joins socket to specific room
        socket.join(roomName);
        console.log(`User ${socket_user.user_uid} with socket ${socket.id} joined room ${roomName}`);
    })
    // Handle disconnect
    socket.on("disconnect", () => {
        console.log("socket disconnected: " + socket.id);
    });
});

//check if user logged in on all pages
app.get('*', checkUser);

//landing page, for now
app.get('/', (req, res) => {
    res.render('landingPage');
})



//logins and registrations
app.use(authRoutes);
//map and admin map
app.use(mapRoutes);
//discussion page
app.use(discRoutes);
//reporting page
app.use(reportsRoutes);

//doesn't match any above routes, 404s
app.use((req, res) => {
    res.status(404).render('404');
})

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
}).on('error', (err) => {
    console.error('Failed to start the server:', err);
});

module.exports = { io };