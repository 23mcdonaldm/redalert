const express = require('express')
const authRoutes = require('./routes/authRoutes');
const mapRoutes = require('./routes/mapRoutes');
const cookieParser = require('cookie-parser');
const { requireAuth, checkUser , requireAdminAuth } = require('./middleware/authMiddleware');
const pool = require('./dbms/database');
require('dotenv').config();
const { setUserSchool } = require('./controllers/authController');

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


//logins and registrations
app.use(authRoutes);

app.use(mapRoutes);

/*
setRLS();
async function setRLS() {
    console.log("Setting RLS!");

    try {
        console.log("Attempting to fetch user token...");
        const tryToken = await fetch('http://localhost:3000/getUserTok', { //TODO need to fix before publishing
            method: 'GET',
            credentials: 'include' // Include cookies in fetch request
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));

        console.log("tryToken: " + tryToken);

        const userResult = await tryToken.json();
        console.log("userResult: " + userResult);

        const user_uid = userResult.user_uid;
        console.log("user_uid: " + user_uid);

        const user = { user_uid };
        await setUserSchool(user);
        let rlsQuery = `SET ROLE school_role`;
        await pool.query(rlsQuery);
    } catch (err) {
        console.log("set blank...");
        let insertBlankSchooQuery = `SET myapp.current_school_uid = '00000000-0000-0000-0000-000000000000'`;
        await pool.query(insertBlankSchooQuery);
    }
    
}
    */
//setting RLS policies
//let rlsQuery = `SET ROLE school_role`;
//await pool.query(rlsQuery);
/*
const setRLS = async (req, res) => {
    console.log("Setting RLS!");

    const token = req.cookies.jwt; // Access token from cookies

    if (token) {
        try {
            // Verify the token
            const decodedToken = await new Promise((resolve, reject) => {
                jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(decoded);
                });
            });

            const user_uid = decodedToken.user_uid;

            // Fetch school coordinates using the user_uid
            const result = await fetch(`http://localhost:3000/createToken`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_uid })
            });

            if (!result.ok) {
                throw new Error(`Failed to fetch school coordinates: ${result.statusText}`);
            }

            const schoolCoordinates = await result.json();
            console.log("School Coordinates:", schoolCoordinates);

            // You can continue your logic here, such as setting roles or handling school data

        } catch (err) {
            console.error("Error while setting RLS:", err);
            return res.status(403).json({ error: 'Token invalid or fetching data failed' });
        }
    } else {
        console.log("No token available");
        return res.status(401).json({ error: 'No token available' });
    }
};

setRLS();
/*
    try {
        console.log("Attempting to fetch user token...");

        // Fetch user token from cookies
        const response = await fetch('http://localhost:3000/getUserTok', {
            method: 'GET',
            credentials: 'include',  // Include cookies in fetch request
            httpOnly: true,
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user token');
        }

        const userResult = await response.json();

        if (userResult && userResult.user_uid) {
            console.log("User authenticated, setting school...");

            // Set user's current school in the session
            await setUserSchool({ user_uid: userResult.user_uid });

            // Only enforce the RLS role AFTER authentication
            const rlsQuery = `SET ROLE school_role`;
            await pool.query(rlsQuery);
            console.log("RLS enforced for school_role");
        } else {
            console.log("No authenticated user found, skipping RLS");
        }

    } catch (err) {
        console.log("User not authenticated, setting blank school...");
        // Set default school UID when no user is found, but don't enforce the role
        const insertBlankSchoolQuery = `SET myapp.current_school_uid = '00000000-0000-0000-0000-000000000000'`;
        await pool.query(insertBlankSchoolQuery);

        // Skipping the RLS role setting to allow login functionality
        console.log("Skipping RLS enforcement");
    }
}
*/

//doesn't match any above routes, 404s
app.use((req, res) => {
    res.status(404).render('404');
})

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
}).on('error', (err) => {
    console.error('Failed to start the server:', err);
});
