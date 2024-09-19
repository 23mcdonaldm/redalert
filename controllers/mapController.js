const pool = require('../dbms/database');

module.exports.map_get = (req, res) => {
    res.render('map');
}

module.exports.admin_map_get = (req, res) => {
    res.render('administratorMap');
}

module.exports.mapUserCoordinates = async (req, res) => {
    console.log('beginning inputting coordinates...');
    const { posInput, curr_user, status } = req.body;
    
    console.log("curr_user: " + curr_user.person_uid);
    console.log(status);
    
    console.log(posInput);
    let insertQuery = `INSERT INTO geolocation (location_uid, student_uid, timestamp, geom, status) VALUES
                        (uuid_generate_v4(), '${curr_user.person_uid}', NOW(), ST_GeogFromText('${posInput}'), '${status}')`;

    try {
        await pool.query(insertQuery);
        console.log('query entered');
        res.status(200).json({ message: 'Location saved successfully' });

    } catch (err) {
        console.error('Error saving location to database', err);
        res.status(500).json({ error: 'Failed to save location' });
    }
}


