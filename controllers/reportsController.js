const pool = require('../dbms/database');

module.exports.getReport = (req, res) => {
    res.render('report', { user: res.locals.user });
}

module.exports.postReport = async (req, res) => {
    let report = req.body;
    const posInput = 'Point(' + report.geom.lng + ' ' + report.geom.lat + ')';
    try {
        let insertQuery;
        if(report.location_type == "no_location_option") {
            insertQuery = `INSERT INTO report (event_uid, school_uid, timestamp, status, event_type, description, 
            verified, emergency, posting, privacy, person_uid) VALUES (uuid_generate_v4(), '${report.school_uid}', 
            NOW(), '${report.status}', '${report.event_type}', '${report.description}', '${report.verified}', '${report.emergency}', 
            '${report.posting_type}', '${report.privacy_type}', '${report.person_uid}')`;
        } else {
            insertQuery = `INSERT INTO report (event_uid, school_uid, timestamp, status, event_type, description, geom, 
            verified, emergency, posting, privacy, person_uid) VALUES (uuid_generate_v4(), '${report.school_uid}', 
            NOW(), '${report.status}', '${report.event_type}', '${report.description}', 
            ST_GeogFromText('${posInput}'), '${report.verified}', '${report.emergency}', '${report.posting_type}', 
            '${report.privacy_type}', '${report.person_uid}')`;
        }
        
        await pool.query(insertQuery);
        res.status(200).json({ message: 'Report logged successfully' });
    } catch (err) {
        console.error('Error logging report to database', err);
        res.status(500).json({ error: 'Failed to report emergency' });

    }
    
}