const pool = require('../dbms/database');

//rendering map page
module.exports.map_get = (req, res) => {
    res.render('map');
}

//rendering administrator map page
module.exports.admin_map_get = (req, res) => {
    res.render('administratorMap');
}

//maps
module.exports.mapUserCoordinates = async (req, res) => {
    const { posInput, curr_user, status } = req.body;
    
    let insertQuery = `INSERT INTO geolocation (location_uid, student_uid, timestamp, geom, status) VALUES
                        (uuid_generate_v4(), '${curr_user.person_uid}', NOW(), ST_GeogFromText('${posInput}'), '${status}')`;

    try {
        await pool.query(insertQuery);
        res.status(200).json({ message: 'Location saved successfully' });

    } catch (err) {
        console.error('Error saving location to database', err);
        res.status(500).json({ error: 'Failed to save location' });
    }
}

module.exports.getUserList = async (req, res) => {
    
    try {
        const insertQuery = `SELECT * FROM geolocation`;
        const result = await pool.query(insertQuery);
        res.json(result.rows);
    } catch(err) {
        console.error("Error fetching user list: " + err);
        throw new Error('Couldnt get user list');
    }
}

module.exports.getUsersandLocations = async (req, res) => {
    
    try {
        const insertQuery = `SELECT g.location_uid, g.student_uid, g.timestamp, g.geom, g.status, 
                            p.person_uid, p.name, p.username, p.phone_number, p.email FROM public.geolocation g 
                            JOIN public.person p ON g.student_uid = p.person_uid`;
        const result = await pool.query(insertQuery);
        res.json(result.rows);
    } catch(err) {
        console.error("Error fetching user list: " + err);
        throw new Error('Couldnt get user list');
    }
}


module.exports.getSchoolCoordinates = async (req, res) => {
    const { school_uid } = req.body;
    try {
        const coordinateQuery = `SELECT ST_X(coordinates::geometry), ST_Y(coordinates::geometry) FROM school WHERE school_uid = '${school_uid}'`;
        const coordinates = await pool.query(coordinateQuery);
        res.status(200).json(coordinates.rows[0]);
    } catch (err) {
        console.log("couldnt get school coords: " + err);
        throw new Error("couldn't get school coordinates");
    }
    
}

module.exports.getLocationCoordinates = async (req, res) => {
    const { geom } = req.body;
    try {
        const coordinateQuery = `SELECT ST_X(geom::geometry), ST_Y(geom::geometry) FROM geolocation WHERE location_uid = '${geom}'`;
        const coordinates = await pool.query(coordinateQuery);
        res.status(200).json(coordinates);
    } catch (err) {
        throw new Error("couldn't get location coordinates");
    }
    
}