const { Router } = require('express');
const discussionController = require('../controllers/discussionController');

const router = Router();

router.post(`/getDiscussionPosts`, discussionController.getDiscussionPosts);

router.get('/discussion', (req, res) => {
    res.render('discussion');
})

module.exports = router;