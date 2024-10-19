const { Router } = require('express');
const mapController = require('../controllers/mapController');
const { requireAuth, checkUser , requireAdminAuth } = require('../middleware/authMiddleware');
const router = Router();

router.get('/map', requireAuth, (req, res) => mapController.map_get(req, res));
router.post('/mapUserCoordinates', mapController.mapUserCoordinates);
router.get('/map/administrator', requireAdminAuth, (req, res) => mapController.admin_map_get(req, res));
router.get('/getUserList', mapController.getUserList);
router.post('/getSchoolCoordinates', mapController.getSchoolCoordinates); 
router.post('/getLocationCoordinates', mapController.getLocationCoordinates);
router.get('/getUsersandLocations', mapController.getUsersandLocations)


module.exports = router;