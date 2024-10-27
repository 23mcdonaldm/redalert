const pool = require('../dbms/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const maxAge = 3 * 24 * 60 * 60 //3 days (jwt is in seconds, cookie is in milliseconds)
/* creating a jwt token for user with 3 day expiration date, 
**
** user parameter represents an object with user_uid and user_type that will be input 
** calls setUserSchool, which sets app.current_school_id to user's school in psql
*/
const createToken = (user) => {
    const user_uid = user.user_uid;
    const user_type = user.user_type;
    const jwtSecret = process.env.JWT_SECRET;
    setUserSchool(user);
    return jwt.sign({ user_uid, user_type }, jwtSecret, {
        expiresIn: maxAge
    });
}

/* sets app.current_school_id to user's school in psql
** called from createToken(), lasts an entire session. question? does it still last when user leaves app but jwt not expired
** takes same user parameter as createToken()
*/
async function setUserSchool(user) {
    try {
        let schoolQuery = `SELECT school_uid FROM person WHERE person_uid = '${user.user_uid}'`;
        let result = await pool.query(schoolQuery);
        let schoolResult = result.rows[0].school_uid;
        let insertQuery = `SET app.current_school_id = '${schoolResult}'`;
        await pool.query(insertQuery);
    } catch (err) {
        console.error("Couldn't find user from school " + err);
    }
}

//rendering register page
module.exports.register_get = (req, res) => {
    res.render('register');
}

//rendering login page
module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.dashboard_get = (req, res) => {
    res.render('dashboard');
}

module.exports.admin_dashboard_get = (req, res) => {
    res.render('adminDashboard');
}


//user registering
module.exports.login_post = async (req, res) => {
    
    const user = {
        username: req.body.username,
        password: req.body.password,
    }

    try {
        const logged_in_user = await login(user);
        const user_token = createToken(logged_in_user);
        res.cookie('jwt', user_token, { maxAge: maxAge * 1000}); //TODO : add in secure requirement eventually
        const user_type = logged_in_user.user_type;
        const school_uid = logged_in_user.school_uid;
        const user_uid = logged_in_user.user_uid;
        res.status(200).json({ message: "User has logged in!", user_uid, school_uid, user_type });
    } catch (err) {
        console.error("Login Error: ", err);
        res.status(400).json({ message: "Error, " + err.message + ".", error: err.message });
    }
    
}

//checks user username and password and logs in
const login = async (user) => {
    try {
        
        let insertQuery = `SELECT * FROM person WHERE username='${user.username}'`;
        const result = await pool.query(insertQuery);
        
        if (result.rowCount > 0) {
            const auth = await bcrypt.compare(user.password, result.rows[0].pwhash);
            if (auth) {
                const user_uid = result.rows[0].person_uid;
                const user_type = result.rows[0].user_type;
                const school_uid = result.rows[0].school_uid;

                return { user_uid, user_type, school_uid };
            } else {
                throw new Error("incorrect password");
            }
            
        } else {
            throw new Error("incorrect username");
        }
    } catch (err) {
        throw new Error(err.message);
    }
    
    
}

//user registering
module.exports.register_post = async (req, res) => {

    try {  
        //hashes password inputted, adds into the user to be added to db
        const saltRounds = 10;
        const password = req.body.password;

        const salt = await bcrypt.genSalt(saltRounds);
        const pwhash = await bcrypt.hash(password, salt);
        
        let user = { 
            fullName: req.body.fullName, 
            user_type: req.body.user_type, 
            school_name: req.body.school_name,
            phone_number: req.body.phone_number,
            email: req.body.email, 
            username: req.body.username, 
            password: pwhash }
        
        
        //add additional parameters
        user = addUserSpecificAttributes(user, req);
        
        await registerUser(user, res);
        
        res.json({ message: "User has registered!" });
    } catch (err) {
        console.error("Registration Error: ", err);
        res.status(400).json({ message: "Error, Registration Failed." , error: err.message });
    }   
}

//adds user to db for registration, accounts for different user types 
async function registerUser(user, res) {
    try {
        let insertQuery;
        let values;
        switch(user.user_type) {
            case 'student':
                insertQuery = `INSERT INTO student(person_uid, name, username, pwhash, phone_number, email, student_id, user_type, school_uid) VALUES 
                                            (uuid_generate_v4(), '${user.fullName}', '${user.username}', '${user.password}', ${user.phone_number}, '${user.email}', ${user.student_id}, '${user.user_type}',
                                            (SELECT school_uid FROM school WHERE name = '${user.school_name}'))`;
                break;
    
            case 'guardian':
                console.log("user: ", user);
                console.log("child: ", user.affiliated_student_name);
                insertQuery = `INSERT INTO guardian(person_uid, name, username, pwhash, phone_number, email, child_uid, affiliation, user_type, school_uid) VALUES 
                                            (uuid_generate_v4(),' ${user.fullName}', '${user.username}', '${user.password}', '${user.phone_number}', '${user.email}', 
                                            (SELECT person_uid FROM student WHERE name = '${user.affiliated_student_name}'), '${user.affiliation}', '${user.user_type}',
                                            (SELECT school_uid FROM school WHERE name = '${user.school_name}'))`;
                break;
    
            case 'administrator':
                insertQuery = `INSERT INTO administrator(person_uid, name, username, pwhash, phone_number, email, position, user_type, school_uid) VALUES 
                                            (uuid_generate_v4(), '${user.fullName}', '${user.username}', '${user.password}', '${user.phone_number}', '${user.email}', '${user.position}', '${user.user_type}',
                                            (SELECT school_uid FROM school WHERE name = '${user.school_name}'))`
                break;

            default:
                throw new Error("Invalid user type");

        }
        await pool.query(insertQuery);

    } catch (err) {
        console.error("Error adding user to database:", err);
        throw new Error("Couldn't add user to database.");
    }
}

//adds specific attributes based off user_type, before updating database
function addUserSpecificAttributes(user, req) {
    try {
        switch(user.user_type) {
            case 'student':
                const { student_id } = req.body;
                user = { ...user, student_id };
                break;
    
            case 'guardian':
                const { affiliation, affiliated_student_name } = req.body;
                user = { ...user, affiliation, affiliated_student_name };
                break;
    
            case 'administrator':
                const { position } = req.body;
                user = { ...user, position}; 
                break;
        
        }
        return user;
    } catch {
        console.error("Error adding user-specific attributes:", err);
        throw new Error("Couldn't add additional fields.");
    }
    
    
}

//logs user out, resets jwt
module.exports.logout_get = async (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    await pool.query(`SET ROLE postgres`);
    await pool.query(`SET myapp.current_school_uid = '00000000-0000-0000-0000-000000000000'`);
    res.redirect('/');
}  

//checks username as user is inputting or when user tries to register to see if its available
module.exports.check_username = async (req, res) => {
    const { username } = req.query;

    try {
        const result = await pool.query(`SELECT 1 FROM person WHERE username = '${username}' LIMIT 1`);
        
        if(result.rowCount > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ exists: false });
    }
}

//backend
module.exports.getUserTok = (req, res) => {
    const token = req.cookies.jwt;

    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if(err) {
                return res.status(403).json({ error: 'Token invalid' });
            } else {
                res.json({ user_uid: decodedToken.user_uid, user_type: decodedToken.user_type });
            }
        });
    } else {
        return res.status(401).json({ error: 'No token available' });
    }
}


module.exports.getUserData = async (req, res) => {
    const { user_uid } = req.params;
    
    try {
        const result = await pool.query(`SELECT * FROM person WHERE person_uid = '${user_uid}'`);
        if( result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.log("couldnt get user data" + err);
        res.status(500).json({ error: 'Database query failed' });
    }
}

const getUserFromUsername = async function (username) {
    try {
        const result = await pool.query(`SELECT * FROM person WHERE person_uid = '${username}'`);
        if( result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.log("couldnt get user data" + err);
        res.status(500).json({ error: 'Database query failed' });
    }
}
