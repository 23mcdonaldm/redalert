const { Router } = require('express');
const reportsController = require('../controllers/reportsController');
const { requireAdminAuth } = require('../middleware/authMiddleware');


const router = Router();

router.post('/declare', reportsController.declare);

router.get('/declare', requireAdminAuth, (req, res) => {
    res.render('declare', { user: res.locals.user });
})


module.exports = router;