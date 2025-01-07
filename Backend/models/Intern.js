const e = require('express');
const mongoose = require('mongoose');

const internSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  nationality: { type: String, required: true },
  internId: { type: String, required: true, unique: true },
  // designation (Frontend, Backend, MERN, MEAN, Saleforce, Cloud, Design)
  designation: { type: String, enum: ['Frontend', 'Backend', 'MERN', 'MEAN', 'Salesforce', 'Cloud', 'Design', 'Sale', 'Marketing'], required: true },
  currentAddress: { type: String, required: true },
  dateOfJoining: { type: Date, default: Date.now },
  profileUpdated: { type: Boolean, default: false },
  password: { type: String},
  role: { type: String, default: "intern" },
  //education details (array of objects), degree, duration, institute, grade
  education: [
    {
      degree: { type: String, required: true },
      duration: { type: String, required: true },
      institute: { type: String, required: true },
      grade: { type: String, required: true },
    }
  ],
  //if any experience details (array of objects), company, duration, role
  experience: [
    {
      company: { type: String, required: true },
      duration: { type: String, required: true },
      role: { type: String, required: true },
    }
  ],
});

module.exports = mongoose.model('Intern', internSchema);
