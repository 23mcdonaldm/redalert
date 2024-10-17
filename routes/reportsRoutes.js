const { Router } = require('express');
const reportsController = require('../controllers/reportsController');
const { requireAdminAuth, requireAuth } = require('../middleware/authMiddleware');


const router = Router();

router.post('/report', reportsController.postReport);

router.get('/report', requireAuth, reportsController.getReport);


module.exports = router;