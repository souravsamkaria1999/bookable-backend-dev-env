const express = require("express");
const router = express.Router();

// imported function from services
const realEstateService = require("../services/realEstateService");

// middleware function for params
router.param("id", (req, res, next, val) => {
  next();
});

/*********another way of using middleware**********/
// define a middle ware function name middleware/any into separte module and import that to use here
// router.param('id',middleware)

// using services function on api call

router.post("/register", realEstateService.realEstateUserRegister);
router.post("/login", realEstateService.realEstateUserLogin);
router.get("/get/property-category", realEstateService.fetchPropertyCategories);
router.get("/get/property-type", realEstateService.fetchPropertyTypes);
router.get("/get/property-amenities", realEstateService.fetchPropertyAmenities);
router.get("/get/property-bhkTypes", realEstateService.fetchBhkType);
router.get("/get/property-furnishing-type", realEstateService.fetchFurnishingType);
router.get("/get/property-listing-type", realEstateService.fetchListingType);
router.get("/get/property-maintenance-type", realEstateService.fetchMaintenanceType);
// router.post("/fill/propertyDetails", realEstateService.enterPropertyDetails);
// router.get("/propertyDetails/:id?", realEstateService.getProperty);
// router.post("/edit/propertyDetails/:id", realEstateService.editPropertyDetails);
// router.delete("/delete/propertyDetails/:id",realEstateService.deletePropertyDetails);
module.exports = router;
