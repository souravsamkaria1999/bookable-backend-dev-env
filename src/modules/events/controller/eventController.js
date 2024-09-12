const express = require("express");
const router = express.Router();

const eventService = require('../services/eventService');

router.post('/upload/event/image/url',eventService.uploadImageUrl);
router.patch('/update/event/publish/status',eventService.updateEventPublishStatus);
router.post('/buy/now',eventService.buyNow);

module.exports = router;