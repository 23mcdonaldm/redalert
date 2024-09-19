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