const express = require("express");
const Attendance = require("../models/Attendance");
const authenticate = require("../middleware/authMiddleware"); // Import the authentication middleware
const router = express.Router();

router.post("/signin", authenticate, async (req, res) => {
  const { userId } = req.body;

  try {
    const attendance = new Attendance({
      userId,
      signIn: {
        date: new Date(),
      },
    });
    await attendance.save();
    res.status(200).json({ message: "Sign-in recorded successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to record sign-in." });
  }
});

router.post("/signout", authenticate, async (req, res) => {
  const { userId } = req.body;

  try {
    const today = new Date().setHours(0, 0, 0, 0); // Start of the day
    const attendance = await Attendance.findOne({
      userId,
      "signIn.date": { $gte: today },
    });

    if (!attendance) {
      return res
        .status(404)
        .json({ error: "Sign-in record not found for today." });
    }

    // Set sign-out time and location
    attendance.signOut = {
      date: new Date(),
    };

    // Calculate total hours worked
    const signInTime = new Date(attendance.signIn.date);
    const signOutTime = new Date(attendance.signOut.date);
    const totalHours = (signOutTime - signInTime) / (1000 * 60 * 60); // Convert milliseconds to hours

    attendance.totalHoursWorked = Math.round(totalHours * 10) / 10;

    await attendance.save();
    res.status(200).json({
      message: "Sign-out recorded successfully with total hours worked!",
      totalHours,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to record sign-out." });
  }
});

router.get("/get-all-attendance", authenticate, async (req, res) => {
  try {
    // Fetch all attendance records
    const attendanceRecords = await Attendance.find(
      {},
      { __v: false }
    ).populate("userId", "name email"); // Populate user info (name, email)

    if (attendanceRecords.length === 0) {
      return res.status(404).json({ error: "No attendance records found" });
    }

    // Return the attendance records
    res.status(200).json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
});
module.exports = router;
