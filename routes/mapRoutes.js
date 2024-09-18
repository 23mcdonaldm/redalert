const { Router } = require('express');
const mapController = require('../controllers/mapController');

const router = Router();

router.get('/map', mapController.map_get);




module.exports = router;