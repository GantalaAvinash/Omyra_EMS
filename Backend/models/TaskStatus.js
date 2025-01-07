// Intern Task Status
const mongoose = require('mongoose');

const taskStatusSchema = new mongoose.Schema({
    internId: { type: mongoose.Schema.Types.String, ref: 'Intern', required: true },
    taskId: { type: mongoose.Schema.Types.String, ref: 'Task', required: true },
    status: { type: String, required: true },
    date: { type: Date, required: true },
    });

module.exports = mongoose.model('TaskStatus', taskStatusSchema);

