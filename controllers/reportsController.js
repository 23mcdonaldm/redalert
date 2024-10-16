const pool = require('../dbms/database');


module.exports.report = async (req, res) => {
    let report = req.body;
    console.log("report: " + JSON.stringify(report));
    const posInput = 'Point(' + report.geom.lng + ' ' + report.geom.lat + ')';
    console.log(posInput);
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