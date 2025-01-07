// models/Admin.js
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    designation: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default:"admin", required: true },
    dateOfCreation: { type: Date, default: Date.now },
});
  
module.exports = mongoose.model('Admin', adminSchema);