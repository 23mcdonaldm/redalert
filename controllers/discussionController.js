const pool = require('../dbms/database');
const { v4: isUUID } = require('uuid');

module.exports.getDiscussionPosts = async (req, res) => {
    const sortMethod = req.body.currentSort;
    console.log(sortMethod);
    try {
        let getQuery = `SELECT * FROM discussion_post WHERE parent_post_uid = uuid_nil() ORDER BY ${sortMethod}`;
        const response = await pool.query(getQuery);
        const discussions = response.rows;
        res.status(200).json({discussions});
    } catch (err) {
        console.error("Couldn't get main posts: " + err);
        res.status(400);
    }
}

module.exports.getReplies = async (req, res) => {
    const main_post = req.body;
    try {
        let getQuery = `SELECT * FROM discussion_post WHERE parent_post_uid = '${main_post}'`;
        const response = await pool.query(getQuery);
        res.status(200).json({response});
    } catch (err) {
        console.error("Couldn't get replies to post: " + err);
    }
}

module.exports.getDiscussionByUUID = async function(uuid) {
    if (!isUUID(uuid)) {
        return { error: "Invalid UUID format." };
    }
    
    
    try {
        let getPostQuery = `SELECT * FROM public_discussion_post WHERE disc_uid = '${uuid}'`;
        const { rows } = await pool.query(getPostQuery);

        if (rows.length === 0) {
            return { message: "Discussion post not found. "};
        }
        return { post: rows[0] };
    } catch (err) {
        console.error("Couldn't find/get discussion post: " + err);
    }
}