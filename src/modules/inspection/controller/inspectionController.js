const express = require("express");
const router = express.Router();

const inspectionService = require("../services/inspectionService");

//api route
router.get("/test", inspectionService.runTest);
router.post("/user/register", inspectionService.register);
router.post("/user/login", inspectionService.login);
router.post("/create-inspection/", inspectionService.setInspectionTimings);
router.post("/edit/inspection/add-slot", inspectionService.addSlot);
router.get("/edit/inspection/delete-slot/", inspectionService.deleteSlot);
router.get("/fetch/inspection-slot/", inspectionService.getInspectionTimings);
router.post("/book/inspection-slot/", inspectionService.inspectionBooking);
router.get("/list-clients", inspectionService.listClients);
router.post("/ban-clients", inspectionService.banClients);

module.exports = router;
