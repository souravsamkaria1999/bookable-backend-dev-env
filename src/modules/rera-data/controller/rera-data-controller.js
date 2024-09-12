const express = require("express");
const router = express.Router();
const reraDataService = require('../service/rera-data-service')
//api route
router.route("/fetch/agent").get(reraDataService.get_stateWise_data);
router.route("/verify/agent").get(reraDataService.getAgentsDataByState_name_certificate_number);

module.exports = router;
