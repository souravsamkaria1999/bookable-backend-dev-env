const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const path = require("path");
const multer = require('multer')
const upload = multer({})
const paymentService = require('../src/modules/payment/services/paymentService');
app.post('/webhook',express.raw({type: 'application/json'}),paymentService.stripeWebhhok)
app.use(express.json());

const reraDataService = require("../src/modules/rera-data/service/rera-data-service");
const inspectionRoute = require("./modules/inspection/controller/inspectionController");
const router = require("./modules/real-estate/controller/realEstateController");
const reraDataRouter = require("../src/modules/rera-data/controller/rera-data-controller");
const eventRouter = require("./modules/events/controller/eventController");
const AwsClient = require("./sharedMethod/s3-bucket")

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./modules/rera-data/views"));
app.use(
  "/rera/real-estate",
  express.static(path.join(__dirname, "./modules/rera-data/public"))
);

// ####### route #########
app.get("/rera/real-estate", reraDataService.getLandingPage);
app.get("/rera/real-estate/register", reraDataService.getRegisterPage);
app.get("/rera/real-estate/login", reraDataService.getLoginPage);
app.get("/rera/real-estate/agentInfo", reraDataService.getAgentInfo);
app.use("/api/estate", router);
app.use("/inspection", inspectionRoute);
app.use("/api/rera", reraDataRouter);
app.use("/events",eventRouter)
app.post('/file/upload',upload.single('file'),AwsClient.fileUpload)


module.exports = app;
