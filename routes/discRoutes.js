const { Router } = require('express');
const discussionController = require('../controllers/discussionController');

const router = Router();

router.post(`/getDiscussionPosts`, discussionController.getDiscussionPosts);

module.exports = router;