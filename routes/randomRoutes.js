const { Router } = require('express');
const { requireAdminAuth } = require('../middleware/authMiddleware');


const router = Router();

router.get('/discussion', (req, res) => {
    res.render('discussion');
})

router.get('/declare', requireAdminAuth, (req, res) => {
    res.render('declare');
})


module.exports = router;