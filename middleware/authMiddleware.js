

const pool = require('../dbms/database');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    //if exists
    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if(err) {
                console.log(err.message);
                res.redirect('/login');
            } else {
                next();
            }
        })
    } else {
        
        res.redirect('/login');
    }
}

const requireAdminAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    //if exists
    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
            if(err) {
                console.error(err);
                res.redirect('/login');
            } else if (decodedToken.user_type != "administrator") {
                console.error("Do not have administrator privilege: " + err);
                res.redirect('/');
            } else {
                next();
            }
        })
    } else {
        res.redirect('/login');
    }
}



//front end, passed from middleware to the views rendered
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt
    if(token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if(err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            } else {
                let insertQuery = `SELECT * FROM person WHERE person_uid = '${decodedToken.user_uid}'`;
                let user = await pool.query(insertQuery);
                res.locals.user = user.rows[0];
                
                if (res.locals.user) {
                    const userId = res.locals.user.person_uid;
    
                    await pool.query('BEGIN');
    
                    // Check the current role
                    const currentUserResult = await pool.query(`SELECT current_user;`);
                    const currentUser = currentUserResult.rows[0].current_user;
    
                    if (currentUser !== 'school_role') {
                        await pool.query(`SET ROLE school_role`);
                    }
    
                    await pool.query(`SET myapp.current_school_uid = '${user.rows[0].school_uid}'`);
    
                    await pool.query('COMMIT');
                }
                

                next();
            }
        })
    } else {
        res.locals.user = null;
        next();
    }
}



module.exports = { requireAuth , checkUser , requireAdminAuth };