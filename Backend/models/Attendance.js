// models/Attendance.js
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    internId: { type: mongoose.Schema.Types.String, ref: 'Intern', required: true },
    date: { type: Date, required: true },
    hours: { type: Number },
    dayTask: { type: String },
  });
  
module.exports = mongoose.model('Attendance', attendanceSchema);