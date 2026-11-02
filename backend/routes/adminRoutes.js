const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// All admin routes strictly require valid token AND Admin role
router.use(verifyToken, requireAdmin);

router.get("/stats", adminController.getAdminStats);
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserDetails);
router.patch("/users/:id/status", adminController.updateUserStatus);
router.delete("/users/:id", adminController.deleteUser);

module.exports = router;
