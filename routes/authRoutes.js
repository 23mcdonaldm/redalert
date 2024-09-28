const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get('/register', authController.register_get);
router.post('/register', authController.register_post);
router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/check-username', authController.check_username);
router.get('/logout', authController.logout_get);
router.get('/getUserTok', authController.getUserTok);
router.post(`/fetchUserData`, authController.getUserData);
//router.get('/createToken', authController.createToken);

module.exports = router;