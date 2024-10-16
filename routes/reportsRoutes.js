const { Router } = require('express');
const reportsController = require('../controllers/reportsController');
const { requireAdminAuth, requireAuth } = require('../middleware/authMiddleware');


const router = Router();

router.post('/report', reportsController.report);

router.get('/report', requireAuth, (req, res) => {
    res.render('report', { user: res.locals.user });
})


module.exports = router;