const express = require("express");
const multer = require("multer");
const User = require("../models/User");
const router = express.Router();
const jwt = require("jsonwebtoken");
const path = require("path");

// Set up Multer storage to store images locally
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define the folder to save the uploaded images
    cb(null, "uploads/image/");
  },
  filename: (req, file, cb) => {
    // Create a unique filename by adding the original name and timestamp
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Register route to handle user creation and image upload
router.post("/register", upload.single("image"), async (req, res) => {
  const { name, email, password } = req.body;
  const image = req.file; // The uploaded file

  if (!image) {
    return res.status(400).json({ error: "Profile image is required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email is already registered." });
    }
    const user = new User({
      name,
      email,
      password,
      image: image.path,
    });
    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to register user." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET, // Store your secret key in .env
      { expiresIn: "30d" } // Token expiration time
    );

    // Send the token to the client
    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
