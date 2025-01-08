const express = require('express');
const router = express.Router();
const Intern = require('../models/Intern');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Register Intern
router.post('/register', async (req, res) => {
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
      message: 'Intern registered successfully, Wait for the admin to approve your account',
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

// Intern Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const intern = await Intern.findOne({ email });
    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    const isMatch = await bcrypt.compare(password, intern.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    //check if the intern is approved by the admin
    if (intern.status !== 'approved') {
      return res.status(401).json({ message: 'Your account is not approved by the admin' });
    }

    const token = jwt.sign({ id: intern._id, role: intern.role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token, message: 'Login successful', intern });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Fetch Intern Profile (Authenticated)
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id);
    if (!intern) return res.status(404).json({ message: 'Intern not found' });
    res.status(200).json(intern);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching intern profile' });
  }
});

// Update Intern Profile
router.put('/:id', authenticateJWT, async (req, res) => {
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

    const intern = await Intern.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, phone, dob, nationality, designation, currentAddress, education, experience },
      { new: true }
    );

    if (!intern) return res.status(404).json({ message: 'Intern not found' });

    res.status(200).json({ message: 'Intern details updated successfully', intern });
  } catch (err) {
    console.error('Error updating intern:', err);
    res.status(500).json({ message: 'Error updating intern details' });
  }
});

// Fetch All Interns
router.get('/interns', authenticateJWT, async (req, res) => {
  try {
    const interns = await Intern.find();
    res.status(200).json(interns);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching interns' });
  }
});

module.exports = router;
