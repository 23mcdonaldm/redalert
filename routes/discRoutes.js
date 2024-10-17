const { Router } = require('express');
const discussionController = require('../controllers/discussionController');
const api = require('../utils/api.js');


const router = Router();

router.post(`/getDiscussionPosts`, discussionController.getDiscussionPosts);

router.get('/discussion', (req, res) => {
    res.render('discussion');
})

router.get('/discussion/:uuid', async (req, res) => {
    const uuid = req.params.uuid;
    try {
        const discussion = await (discussionController.getDiscussionByUUID(uuid));
        const discussion_post = discussion.post;
        const user = await api.fetchUserData(discussion_post.person_uid);
        if (!discussion.post) {
            return res.status(404).render('404');
          }
        res.render('discussionPost', { discussion_post, user });
    } catch (err) {
        console.error('Error fetching discussion:', err);
        res.status(500).send('Internal Server Error');
    }
})



module.exports = router;