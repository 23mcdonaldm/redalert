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

module.exports.getSchoolCoordinates = async (req, res) => {
    const { school_id } = req.body;
    console.log("SCHOOL ID: " + school_id);
    try {
        const coordinateQuery = `SELECT ST_X(coordinates::geometry), ST_Y(coordinates::geometry) FROM school WHERE school_uid = '${school_id}'`;
        const coordinates = await pool.query(coordinateQuery);
        console.log("coordinates: " + coordinates);
        res.status(200).json(coordinates);
    } catch (err) {
        throw new Error("couldn't get school coordinates");
    }
    
}

module.exports.getLocationCoordinates = async (req, res) => {
    const { geom } = req.body;
    try {
        console.log("getting location");
        console.log(geom);
        const coordinateQuery = `SELECT ST_X(geom::geometry), ST_Y(geom::geometry) FROM geolocation WHERE location_uid = '${geom}'`;
        const coordinates = await pool.query(coordinateQuery);
        console.log("returning:");
        console.log(coordinates);
        res.status(200).json(coordinates);
    } catch (err) {
        throw new Error("couldn't get location coordinates");
    }
    
}