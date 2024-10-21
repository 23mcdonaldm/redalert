const { Router } = require('express');
const authController = require('../controllers/authController');
const { requireAuth, checkUser , requireAdminAuth } = require('../middleware/authMiddleware');

const router = Router();

router.get('/register', authController.register_get);
router.post('/register', authController.register_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/check-username', authController.check_username);
router.get('/logout', authController.logout_get);
router.get('/getUserTok', authController.getUserTok);
router.get(`/fetchUserData/:user_uid`, authController.getUserData);
router.get('/dashboard', requireAuth, authController.dashboard_get); //can we add a check that if its an admin searching, redirects them to /dashboard???
router.get('/admin/dashboard', requireAdminAuth, authController.admin_dashboard_get);

module.exports = router;