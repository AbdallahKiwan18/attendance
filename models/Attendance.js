const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  signIn: {
    date: Date,
  },
  signOut: {
    date: Date,
  },
  totalHoursWorked: Number, // Total hours worked in decimal format
});

module.exports = mongoose.model("Attendance", attendanceSchema);
