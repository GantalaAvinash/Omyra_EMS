// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Intern = require('../models/Intern');
const Attendance = require('../models/Attendance');
const Holiday = require('../models/Holidays')
const MonthlyHours = require('../models/MonthlyHours');
const Task = require('../models/Task');
const TaskStatus = require('../models/TaskStatus');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { authenticateJWT } = require('../middleware/authMiddleware');
const moment = require('moment');
const sendMail = require('../utils/email');


// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token, role: admin.role, message: 'Admin login successful', admin });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// register
router.post("/create-admin", async (req, res) => {

  const { firstName, lastName, email, password, designation, phone } = req.body;
  console.log("Request body:", req.body);

  try {
    const emailExists = await Intern.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists as an intern." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      phone,
      designation,
      password: hashedPassword,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error creating admin", error });
  }
});

// Generate Attendance Report
router.get('/report', authenticateJWT, async (req, res) => {
  try {
    const interns = await Intern.find();
    const report = [];

    for (const intern of interns) {
      // Convert intern._id to a string for comparison
      const attendanceRecords = await Attendance.find({
        $or: [
          { internId: intern._id }, // If internId is ObjectId
          { internId: intern.internId } // If internId is a string (SOL2024002)
        ]
      });
      const attendanceMap = {};
      attendanceRecords.forEach(record => {
        const day = moment(record.date).format('MM-DD-YYYY');
        attendanceMap[day] = record.hours ? `${record.hours} hrs` : 'Absent';
      });


      const reportRow = {
        firstName: intern.firstName || "N/A",
        lastName: intern.lastName || "N/A",
        designation: intern.designation || "N/A",
        attendance: attendanceRecords,
      };

      report.push(reportRow);
    }

    res.status(200).json(report);
  } catch (err) {
    console.error('Error generating attendance report:', err);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Get Intern Details
router.get('/interns/:id', authenticateJWT,  async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    res.status(200).json(intern);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching intern details' });
  }
});

// View Working Hours and Attendance
router.get('/attendance/:internId', authenticateJWT, async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find({ internId: req.params.internId });
    res.status(200).json(attendanceRecords);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

// Create an Intern
// create a default password for the intern as internId and send it to the intern's email address
router.post('/intern/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dob,
      nationality,
      designation,
      currentAddress,
      education,
      experience
    } = req.body;

    // Check if the email already exists
    const existingIntern = await Intern.findOne({ email });
    if (existingIntern) {
      return res.status(400).json({ message: 'Intern with this email already exists' });
    }

    // Generate InternId: INT + CurrentYear + Incremented Number
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const lastIntern = await Intern.findOne().sort({ internId: -1 });
    let nextSequence = 1;

    if (lastIntern && lastIntern.internId) {
      const lastSequence = parseInt(lastIntern.internId.slice(-3), 10);
      nextSequence = lastSequence + 1;
    }

    const internId = `OM${currentMonth}${currentYear}${String(nextSequence).padStart(3, '0')}`;

    // Use internId as the password for simplicity
    const plainPassword = internId;

    // Hash the password before saving to the database
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Create a new intern document
    const intern = new Intern({
      firstName,
      lastName,
      email,
      phone,
      dob,
      nationality,
      designation,
      currentAddress,
      education,
      experience,
      internId,
      password: hashedPassword
    });

    await intern.save();

    // Include plain password in the response for display purposes
    res.status(201).json({
      message: 'Intern registered successfully',
      intern: {
        internId,
        firstName,
        lastName,
        email,
        plainPassword // Send plain password
      },
    });
  } catch (error) {
    console.error('Error registering intern:', error);
    res.status(500).json({ message: 'An error occurred during registration. Please try again.' });
  }
});




// Delete an Intern
router.delete('/interns/:id', authenticateJWT, async (req, res) => {
  try {
    const intern = await Intern.findByIdAndDelete(req.params.id);
    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    // Delete associated attendance records
    await Attendance.deleteMany({ internId: req.params.id });

    res.status(200).json({ message: 'Intern and related attendance data deleted successfully' });
  } catch (err) {
    console.error('Error deleting intern:', err);
    res.status(500).json({ message: 'Error deleting intern' });
  }
});

router.put('/interns/status/:id', authenticateJWT, async (req, res) => {
  try {
    const { status, email } = req.body;

    // Find the intern to get their email and other details
    const intern = await Intern.findById(req.params.id);

    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }

    // Send the email first
    const subject = 'Exciting News: Your Account Status Updated!';
    const text = `Dear ${intern.firstName},\n\nWe are delighted to share that your account status has been successfully updated to **${status}**. 🎉\n\nThis milestone brings new opportunities, and we're here to support you every step of the way. If you have any questions or need assistance, don't hesitate to reach out.\n\nWarm regards,\nThe OMYRA Technologies Team`;


    try {
      await sendMail({ to:email, subject, text });
    } catch (emailError) {
      console.error('Error sending email:', emailError.message);
      return res.status(500).json({ message: 'Failed to send email. Status not updated.' });
    }

    // Update the intern's status after the email is sent successfully
    intern.status = status;
    await intern.save();

    // Respond to the client
    res.status(200).json({ 
      message: 'Intern status updated successfully and email sent', 
      intern 
    });
  } catch (err) {
    console.error('Error updating intern status:', err.message);
    res.status(500).json({ message: 'Error updating intern status' });
  }
});




// Fetch All interns
router.get('/interns', authenticateJWT,  async (req, res) => {
  try {
    const interns = await Intern.find();
    res.status(200).json(interns);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching interns' });
  }
});

router.get('/attendance', authenticateJWT,  async (req, res) => {
  try {
    const attendance = await Attendance.find();
    res.status(200).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching attendance' });
  }
});

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admins' });
  }
});

// Update Intern Details
router.put('/interns/:id', authenticateJWT,  async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dob,
      nationality,
      designation,
      currentAddress,
      education,
      experience,
      internId,
    } = req.body;

    const intern = await Intern.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        phone,
        dob,
        nationality,
        designation,
        currentAddress,
        education,
        experience,
        internId,
       },
      { new: true }
    );

    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    res.status(200).json({ message: 'Intern details updated successfully', intern });
  } catch (err) {
    res.status(500).json({ message: 'Error updating intern details' });
  }
});

router.patch('/password/:id', authenticateJWT, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Fetch admin by ID
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password directly
    await Admin.updateOne({ _id: req.params.id }, { $set: { password: hashedPassword } });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    res.status(500).json({ message: 'Error updating password' });
  }
});

// Get All Holidays
router.get('/holidays', authenticateJWT, async (req, res) => {
  try {
    const holidays = await Holiday.find();
    res.status(200).json(holidays);
  } catch (err) {
    console.error('Error fetching holidays:', err);
    res.status(500).json({ message: 'Error fetching holidays' });
  }
});

// Add a New Holiday
router.post('/holidays', authenticateJWT, async (req, res) => {
  try {
    const { name, date } = req.body;
    const holiday = new Holiday({ name, date });
    await holiday.save();

    res.status(201).json({ message: 'Holiday added successfully', holiday });
  } catch (err) {
    console.error('Error adding holiday:', err);
    res.status(500).json({ message: 'Error adding holiday' });
  }
});

// Edit an Existing Holiday
router.patch('/holidays/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, date } = req.body;

    // Check for a conflicting holiday
    const conflictingHoliday = await Holiday.findOne({ date, _id: { $ne: req.params.id } });

    // If a conflicting holiday exists, override it by deleting or updating it
    if (conflictingHoliday) {
      await Holiday.findByIdAndDelete(conflictingHoliday._id); // Delete the conflicting holiday
    }

    // Proceed to update the requested holiday
    const holiday = await Holiday.findByIdAndUpdate(
      req.params.id,
      { $set: { name, date } },
      { new: true }
    );

    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });

    res.status(200).json({ message: 'Holiday updated successfully', holiday });
  } catch (err) {
    console.error('Error updating holiday:', err);
    res.status(500).json({ message: 'Error updating holiday' });
  }
});


// Delete a Holiday
router.delete('/holidays/:id', authenticateJWT, async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });

    res.status(200).json({ message: 'Holiday deleted successfully' });
  } catch (err) {
    console.error('Error deleting holiday:', err);
    res.status(500).json({ message: 'Error deleting holiday' });
  }
});

router.get('/working-hours', authenticateJWT, async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Both "month" and "year" query parameters are required' });
    }


    const override = await MonthlyHours.findOne({ month, year });
    if (override) {
      return res.status(200).json({ month, year, hours: override.hours });
    }

    // Default calculation
    const daysInMonth = new Date(year, month, 0).getDate();

    const holidays = await Holiday.find({
      date: {
        $gte: new Date(year, month - 1, 1),
        $lte: new Date(year, month - 1, daysInMonth),
      },
    });

    const totalWorkingDays = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((day) => {
      const date = new Date(year, month - 1, day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isHoliday = holidays.some((holiday) => holiday.date.toISOString().split('T')[0] === date.toISOString().split('T')[0]);
      return !isWeekend && !isHoliday;
    }).length;

    const totalHours = totalWorkingDays * 8;

    res.status(200).json({ month, year, hours: totalHours });
  } catch (err) {
    console.error('Error calculating working hours:', err.message, err.stack);
    res.status(500).json({ message: 'Error calculating working hours' });
  }
});



// Override Monthly Working Hours
router.put('/working-hours', authenticateJWT, async (req, res) => {
  try {
    const { month, year, hours } = req.body;
    if (!month || !year || !hours) {
      return res.status(400).json({ message: 'Month, year, and hours are required' });
    }

    const override = await MonthlyHours.findOneAndUpdate(
      { month, year },
      { hours },
      { new: true, upsert: true }
    );

    res.status(200).json({ message: 'Monthly working hours updated successfully', override });
  } catch (err) {
    console.error('Error overriding working hours:', err);
    res.status(500).json({ message: 'Error overriding working hours' });
  }
});

// Get All Monthly Working Hours
router.get('/working-hours', authenticateJWT, async (req, res) => {
  try {
    const monthlyHours = await MonthlyHours.find();
    res.status(200).json(monthlyHours);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching monthly working hours' });
  }
});



// Create a Daily Task
router.post('/tasks', authenticateJWT, async (req, res) => {
  try {
    const { designation, date, title, description } = req.body;
    const newTask = new Task({ designation, date, title, description });
    await newTask.save();

    res.status(201).json({ message: 'Task created successfully', task: newTask});
    
    // send email to the intern with the task details as per the designation
    const interns = await Intern.find({ designation });
    const subject = 'New Task Assigned';
    const text = `Dear Intern,\n\nA new task has been assigned to you.\n\nTitle: ${title}\nDescription: ${description}\n\nRegards,\nAdmin`;
    interns.forEach(intern => sendMail({to:intern.email, subject, text}));
  }
  catch (err) {
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Get Tasks by Designation
router.get('/tasks/designation/:designation', authenticateJWT, async (req, res) => {
  try {
    const tasks = await Task.find({ designation: req.params.designation });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Get Daily Task
router.get('/tasks/:date', authenticateJWT, async (req, res) => {
  try {
    const tasks = await Task.find({ date: req.params.date });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Get Daily Task by designation and date
router.get('/tasks/:designation/:date', authenticateJWT, async (req, res) => {
  try {
    const tasks = await Task.find({ designation: req.params.designation, date: req.params.date });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});


// Mark task as complete
router.put('/tasks/:taskId/:complete', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.taskId, { status: 'completed' }, { new: true });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Daily Task
router.put('/tasks/:id', authenticateJWT, async (req, res) => {
  try {
    const { designation, date, title, description } = req.body;
    const taskData = await Task.findByIdAndUpdate(
      req.params.id,
      { designation, date, title, description },
      { new: true }
    );

    if (!taskData) return res.status(404).json({ message: 'Task not found' });

    res.status(200).json({ message: 'Task updated successfully', taskData });
  } catch (err) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Delete Daily Task
router.delete('/tasks/:id', authenticateJWT, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Get All Tasks
router.get('/tasks', authenticateJWT, async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// get intern task status by internId
router.get('/intern/task-status/:internId', authenticateJWT, async (req, res) => {
  try {
    const taskStatus = await TaskStatus.find({ internId: req.params.internId });
    res.status(200).json(taskStatus);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching task status' });
  }
});

// post intern task status
router.post('/intern/task-status', authenticateJWT, async (req, res) => {
  try {
    const { internId, taskId, status, date } = req.body;
    const taskStatus = new TaskStatus({ internId, taskId, status, date });
    await taskStatus.save();

    res.status(201).json({ message: 'Task status created successfully', taskStatus });
  } catch (err) {
    res.status(500).json({ message: 'Error creating task status' });
  }
});

// update intern task status
router.put('/intern/task-status/:id', authenticateJWT, async (req, res) => {
  try {
    const { internId, taskId, status, date } = req.body;
    const taskStatus = await TaskStatus.findByIdAndUpdate(
      req.params.id,
      { internId, taskId, status, date },
      { new: true }
    );

    if (!taskStatus) return res.status(404).json({ message: 'Task status not found' });

    res.status(200).json({ message: 'Task status updated successfully', taskStatus });
  } catch (err) {
    res.status(500).json({ message: 'Error updating task status' });
  }
});


router.post('/send-email', authenticateJWT, async (req, res) => {
  const { subject, message, recipients } = req.body;

  if (!subject || !message || !recipients || recipients.length === 0) {
    return res.status(400).json({ message: 'Missing subject, message, or recipients.' });
  }

  try {
    const internEmails = await Intern.find({ _id: { $in: recipients } }).select('email');
    const emailAddresses = internEmails.map((intern) => intern.email);

    await sendMail({ to: emailAddresses, subject, text: message });

    res.status(200).json({ message: 'Emails sent successfully.' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ message: 'Failed to send emails.' });
  }
});






module.exports = router;
