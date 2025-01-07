const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const moment = require('moment');

// Mark Attendance
router.post('/mark', async (req, res) => {
  try {
    const { internId, date, hours, dayTask } = req.body;

    // Check if date is in the future
    const today = moment().startOf('day');
    const attendanceDate = moment(date).startOf('day');

    if (attendanceDate.isAfter(today)) {
      return res.status(400).json({ message: 'Cannot mark attendance for a future date' });
    }

    // Check if attendance for the date already exists
    const existingAttendance = await Attendance.findOne({ internId, date });
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this date' });
    }

    const attendance = new Attendance({
      internId,
      date,
      hours,
      dayTask,
    });

    await attendance.save();
    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking attendance' });
  }
});

// Get Attendance for Intern
router.get('/:internId', async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({ internId: req.params.internId });
    res.status(200).json(attendanceRecords);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

module.exports = router;
