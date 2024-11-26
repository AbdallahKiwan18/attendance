const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import the User model
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Set up multer for file uploads (profile image)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/image"); // Directory where images will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save with a unique name
  },
});
const upload = multer({ storage });

// Update user profile route
router.put("/profile", upload.single("image"), async (req, res) => {
  try {
    // Get the JWT token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token is required" });
    }

    // Verify the token and get the user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update profile fields (name, email, profile image)
    const { name, email } = req.body;

    // If a new profile image is uploaded, update the profileImage field
    let image = user.image; // Keep the existing profile image if not updating

    if (req.file) {
      // Update profileImage with the new image path
      image = `http://localhost:3000/uploads/image/${req.file.filename}`;
    }

    // Update the user data
    user.name = name || user.name;
    user.email = email || user.email;
    user.image = image;

    // Save the updated user data
    await user.save();

    // Return the updated profile data
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

module.exports = router;

// Get user profile route
router.get("/profile", async (req, res) => {
  try {
    // Check if JWT token is provided in the Authorization header
    const token = req.headers.authorization?.split(" ")[1]; // Get the token from "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: "Token is required" });
    }

    // Verify the token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; // Extract userId from the token

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user profile data (excluding sensitive information like password)
    const { name, email, image } = user;
    res.status(200).json({
      name,
      email,
      image, // Optional: include the profile image URL or path
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});

module.exports = router;
