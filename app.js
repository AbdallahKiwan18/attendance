const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const userRoutes = require("./routes/userRoutes");

const path = require("path");
const app = express();
app.use(express.json());

// Use routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
