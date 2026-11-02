const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

// Authentication Endpoints
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/admin-login", authController.adminLogin);
router.post("/logout", authController.logout);
router.get("/me", verifyToken, authController.getMe);

module.exports = router;
