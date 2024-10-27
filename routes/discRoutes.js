const { Router } = require('express');
const discussionController = require('../controllers/discussionController');
const api = require('../utils/api.js');
const { requireAuth, checkUser , requireAdminAuth } = require('../middleware/authMiddleware');

const BASE_URL = 'http://localhost:3000';
const router = Router();

router.post(`/getDiscussionPosts`, discussionController.getDiscussionPosts);

router.get('/discussion', requireAuth, (req, res) => {
    res.render('discussion');
})

router.post(`/getComments`, discussionController.getComments);

router.get('/discussion/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    try {
        const discussion = await (discussionController.getDiscussionByUUID(uuid));
        const discussion_post = discussion.post;
        const user = await api.fetchUserData(discussion_post.person_uid);
        console.log(discussion_post);
        console.log(user);
        if (!discussion.post) {
            return res.status(404).render('404');
        }
        const disc_uid = discussion_post.disc_uid;
        const comments = await fetch (`${BASE_URL}/getComments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ disc_uid })
        });
        const disc_comments = await comments.json();
        console.log(disc_comments.comments);
        res.render('discussionPost', { discussion_post, user, disc_comments });
    } catch (err) {
        console.error('Error fetching discussion:', err);
        res.status(500).send('Internal Server Error');
    }
})

router.post('/postComment', discussionController.postComment);


module.exports = router;