// Holiday Model
const mongoose = require('mongoose');

// Monthly Hours Override Model
const monthlyHoursSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  hours: { type: Number, required: true },
});

module.exports = mongoose.model('MonthlyHours', monthlyHoursSchema);