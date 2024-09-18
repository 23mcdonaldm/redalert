const pool = require('../dbms/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



const maxAge = 3 * 24 * 60 * 60 //3 days (jwt is in seconds, cookie is in milliseconds)
const createToken = (user) => {
    const user_uid = user.user_uid;
    const user_type = user.user_type;
    const jwtSecret = process.env.JWT_SECRET;
    return jwt.sign({ user_uid, user_type }, jwtSecret, {
        expiresIn: maxAge
    });
}


//rendering register page
module.exports.register_get = (req, res) => {
    res.render('register');
}

//rendering login page
module.exports.login_get = (req, res) => {
    res.render('login');
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
        console.log(user_token);
        res.cookie('jwt', user_token, { maxAge: maxAge * 1000}); //add in secure requirement eventually
        res.status(200).json({ message: "User has logged in!" });
    } catch (err) {
        console.error("Login Error: ", err);
        res.status(400).json({ message: "Error, " + err.message + ".", error: err.message });
    }
    
}

const login = async (user) => {
    try {
        
        let insertQuery = `SELECT * FROM person WHERE username='${user.username}'`;
        const result = await pool.query(insertQuery);
        
        if (result.rowCount > 0) {
            const auth = await bcrypt.compare(user.password, result.rows[0].pwhash);
            if (auth) {
                const user_uid = result.rows[0].person_uid;
                const user_type = result.rows[0].user_type;
                return { user_uid, user_type };
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

//user logging in
module.exports.register_post = async (req, res) => {

    try {  
        const saltRounds = 10;
        const password = req.body.password;

    
        const salt = await bcrypt.genSalt(saltRounds);
        const pwhash = await bcrypt.hash(password, salt);
        //const hashpw = await bcrypt.hash(req.body.password, saltRounds);
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


async function registerUser(user, res) {
    try {
        let insertQuery;
        let values;
        switch(user.user_type) {
            case 'student':
                insertQuery = `INSERT INTO student(person_uid, name, username, pwhash, phone_number, email, student_id, user_type, school_uid) VALUES 
                                            (uuid_generate_v4(), '${user.fullName}', '${user.username}', '${user.password}', ${user.phone_number}, '${user.email}', ${user.student_id}, '${user.user_type}',
                                            (SELECT school_uid FROM school WHERE name = '${user.school_name}'))`;
                //values = [user.fullName, user.username, user.password, user.phone_number, user.email, user.student_id, user.school_name];
                break;
    
            case 'guardian':
                console.log("user: ", user);
                console.log("child: ", user.affiliated_student_name);
                insertQuery = `INSERT INTO guardian(person_uid, name, username, pwhash, phone_number, email, child_uid, affiliation, user_type, school_uid) VALUES 
                                            (uuid_generate_v4(),' ${user.fullName}', '${user.username}', '${user.password}', '${user.phone_number}', '${user.email}', 
                                            (SELECT person_uid FROM student WHERE name = '${user.affiliated_student_name}'), '${user.affiliation}', '${user.user_type}',
                                            (SELECT school_uid FROM school WHERE name = '${user.school_name}'))`;
                break;
    
            case 'admin':
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
    
            case 'admin':
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


module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}  

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






    /*
    if(user.user_type == 'student') {
        let insertQuery = `INSERT INTO student(person_uid, name, username, pwhash, phone_number, email, student_id, school_uid) VALUES 
                                        (uuid_generate_v4(), ${user.firstName}, ${user.username}, , 911, ${user.email}, ${user.id}, 
                                        (SELECT school_uid FROM school WHERE name = ${user.school}))`;
        client.query(insertQuery, (err, result) => {
            if(!err) {
                res.send("Student has registered!");
            } else {
                console.log(err);
            }
        })
    }

    else if(user.user_type == 'guardian') {
        let insertQuery = `INSERT INTO student(person_uid, name, username, pwhash, phone_number, email, child_uid, school_uid) VALUES 
                                        (uuid_generate_v4(), ${user.firstName}, ${user.username}, , 911, ${user.email}, , 
                                        (SELECT school_uid FROM school WHERE name = ${user.school}))`;
        client.query(insertQuery, (err, result) => {
            if(!err) {
                res.send("Guardian has registered!");
            } else {
                console.log(err);
            }
        })
    } else if(user.user_type == 'administrator') {
        let insertQuery = `INSERT INTO student(person_uid, name, username, pwhash, phone_number, email, child_uid, school_uid) VALUES 
                                        (uuid_generate_v4(), ${user.firstName}, ${user.username}, , 911, ${user.email}, , 
                                        (SELECT school_uid FROM school WHERE name = ${user.school}))`
        client.query(insertQuery, (err, result) => {
            if(!err) {
                res.send("Administrator has registered!");
            } else {
                console.log(err);
            }
        })
    }
    */

