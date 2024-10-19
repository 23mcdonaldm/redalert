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

module.exports.getComments = async (req, res) => {
    const main_post = req.body.disc_uid;
    console.log(main_post);
    try {
        let getQuery = `SELECT * FROM discussion_post WHERE parent_post_uid = '${main_post}'`;
        const response = await pool.query(getQuery);  
        if (response.rows.length > 0) {
            // If there are comments, send them back with a 200 status
            res.status(200).json({ comments: response.rows });
        } else {
            // If no comments, send a different message or empty array
            res.status(200).json({ comments: [], message: "No comments yet" });
        }
    } catch (err) {
        console.error("Couldn't get comments to post: " + err);
    }
}

module.exports.postComment = async (req, res) => {
    const { commentText, disc_uid, person_uid } = req.body;
    console.log("parent post: " + disc_uid);
    try {
        let insertCommentQuery = `INSERT INTO discussion_post (post_uid, parent_post_uid, subject, timestamp, description, likes, dislikes, verified, person_uid, school_uid) 
                                                    VALUES (uuid_generate_v4(), '${disc_uid}', 'comment', NOW(), '${commentText}', 0, 0, False, '${person_uid}', 
                                                    (SELECT school_uid FROM person WHERE person_uid = '${person_uid}'))`;
        const result = await pool.query(insertCommentQuery);
        res.status(201).json({ message: 'Comment posted successfully', comment: result.rows[0] });
    } catch (err) {
        console.error('Error posting comment:', err);
        res.status(500).json({ message: 'Failed to post the comment' });
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

