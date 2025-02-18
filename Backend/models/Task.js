// Display Daily Task to Interns what they have to do on that day
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    designation: { type: String, enum: ['Frontend', 'Backend', 'MERN', 'MEAN', 'Salesforce', 'Cloud', 'Design', 'Sale', 'Marketing'], },
    internId: { type: String, required: true },
    date: { type: Date, required: true },
    title: { type: String, required: true },
    description : { type: String, required: true },
    });

module.exports = mongoose.model('Task', taskSchema);