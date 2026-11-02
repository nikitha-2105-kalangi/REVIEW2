const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const { verifyToken } = require("../middleware/authMiddleware");

// All application routes require authentication
router.use(verifyToken);

router.get("/", applicationController.getAllApplications);
router.get("/dashboard-stats", applicationController.getDashboardStats);
router.get("/interviews", applicationController.getInterviews);
router.get("/statistics", applicationController.getStatistics);
router.get("/:id", applicationController.getApplicationById);
router.post("/", applicationController.createApplication);
router.put("/:id", applicationController.updateApplication);
router.delete("/:id", applicationController.deleteApplication);

module.exports = router;
