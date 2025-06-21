const Team = require('../models/Team');
const transporter = require('../config/email');
const generateOTP = require('../utils/generateOTP');
const OTP = require('../models/OTP');
const otpService = require('../services/otpService');
const emailService = require('../services/emailService');

exports.createTeam = async (req, res) => {
  try {
    const { teamName, leader, members, contact } = req.body;

    // Basic validation
    if (!teamName || !leader || !members || members.length !== 2 || !contact) {
      return res.status(400).json({ message: 'All required fields must be provided with 2 members.' });
    }

    // Check duplicate email within members
    const allEmails = [leader.email, ...members.map(m => m.email)];
    const uniqueEmails = new Set(allEmails);
    if (uniqueEmails.size !== 3) {
      return res.status(400).json({ message: 'All emails (leader and members) must be unique.' });
    }

    // Check if team with same name already exists
    const existingTeam = await Team.findOne({ teamName });
    if (existingTeam) {
      return res.status(409).json({ message: 'Team name already exists. Try another.' });
    }

    // Create team with pending verification
    const team = await Team.create({
      teamName,
      contact,
      leader: { ...leader, isVerified: true }, // leader is always verified
      members: members.map(m => ({ ...m, isVerified: false })),
      isVerified: false,
      paymentStatus: 'pending'
    });

    // Send verification emails to both members
    for (const member of team.members) {
      const otp = generateOTP();
      await otpService.storeOTP(member.email, otp, team._id);
      await emailService.sendOTP(member.email, otp, team.teamName);
    }

    res.status(201).json({ message: 'Team created successfully. OTPs sent to team members.' });
  } catch (err) {
    console.error('Create team error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.verifyMember = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP or email.' });
    }

    // Find team by ID
    const team = await Team.findById(otpRecord.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    // Verify member
    const memberIndex = team.members.findIndex(m => m.email === email);
    if (memberIndex === -1) {
      return res.status(404).json({ message: 'Member not found in team.' });
    }

    team.members[memberIndex].isVerified = true;
    
    // Check if all members are verified
    const allVerified = team.members.every(m => m.isVerified);
    if (allVerified) {
      team.isVerified = true;
      team.paymentStatus = 'pending'; // Set payment status to pending after verification
      await team.save();
      return res.status(200).json({ message: 'All members verified. Team is now active.' });
    }

    await team.save();
    
    res.status(200).json({ message: 'Member verified successfully.' });
  } catch (err) {
    console.error('Verify member error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTeamDetails = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Validate teamId
    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required.' });
    }

    // Find team by ID
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    res.status(200).json(team);
  } catch (err) {
    console.error('Get team details error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find().select('-__v'); // Exclude __v field
    res.status(200).json(teams);
  } catch (err) {
    console.error('Get all teams error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Validate teamId
    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required.' });
    }

    // Find and delete team
    const team = await Team.findByIdAndDelete(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    res.status(200).json({ message: 'Team deleted successfully.' });
  } catch (err) {
    console.error('Delete team error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { teamName, contact } = req.body;

    // Validate input
    if (!teamId || !teamName || !contact) {
      return res.status(400).json({ message: 'Team ID, name, and contact are required.' });
    }

    // Find and update team
    const team = await Team.findByIdAndUpdate(
      teamId,
      { teamName, contact },
      { new: true, runValidators: true }
    );

    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    res.status(200).json(team);
  } catch (err) {
    console.error('Update team error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    // Find team by member email
    const team = await Team.findOne({ 'members.email': email });
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this member.' });
    }

    // Generate new OTP
    const otp = generateOTP();
    await otpService.storeOTP(email, otp, team._id);
    
    // Send OTP email
    await emailService.sendOTP(email, otp, team.teamName);

    res.status(200).json({ message: 'OTP resent successfully.' });
  } catch (err) {
    console.error('Resend OTP error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getTeamByLeader = async (req, res) => {
  try {
    const { leaderEmail } = req.params;

    // Validate input
    if (!leaderEmail) {
      return res.status(400).json({ message: 'Leader email is required.' });
    }

    // Find team by leader email
    const team = await Team.findOne({ 'leader.email': leaderEmail });
    if (!team) {
      return res.status(404).json({ message: 'Team not found for this leader.' });
    }

    res.status(200).json(team);
  } catch (err) {
    console.error('Get team by leader error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getTeamsByMember = async (req, res) => {
  try {
    const { memberEmail } = req.params;

    // Validate input
    if (!memberEmail) {
      return res.status(400).json({ message: 'Member email is required.' });
    }

    // Find teams by member email
    const teams = await Team.find({ 'members.email': memberEmail });
    if (teams.length === 0) {
      return res.status(404).json({ message: 'No teams found for this member.' });
    }

    res.status(200).json(teams);
  } catch (err) {
    console.error('Get teams by member error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPendingTeams = async (req, res) => {
  try {
    const teams = await Team.find({ isVerified: false, paymentStatus: 'pending' });
    res.status(200).json(teams);
  } catch (err) {
    console.error('Get pending teams error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getVerifiedTeams = async (req, res) => {
  try {
    const teams = await Team.find({ isVerified: true });
    res.status(200).json(teams);
  } catch (err) {
    console.error('Get verified teams error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUnverifiedTeams = async (req, res) => {
  try {
    const teams = await Team.find({ isVerified: false });
    res.status(200).json(teams);
  } catch (err) {
    console.error('Get unverified teams error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Validate teamId
    if (!teamId) {
      return res.status(400).json({ message: 'Team ID is required.' });
    }

    // Find team by ID
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found.' });
    }

    res.status(200).json(team);
  } catch (err) {
    console.error('Get team by ID error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getTeamsByContact = async (req, res) => {
  try {
    const { contact } = req.params;

    // Validate contact
    if (!contact) {
      return res.status(400).json({ message: 'Contact is required.' });
    }

    // Find teams by contact
    const teams = await Team.find({ contact });
    if (teams.length === 0) {
      return res.status(404).json({ message: 'No teams found for this contact.' });
    }

    res.status(200).json(teams);
  } catch (err) {
    console.error('Get teams by contact error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getTeamsByPaymentStatus = async (req, res) => {
  try {
    const { status } = req.params;

    // Validate status
    if (!status) {
      return res.status(400).json({ message: 'Payment status is required.' });
    }

    // Find teams by payment status
    const teams = await Team.find({ paymentStatus: status });
    if (teams.length === 0) {
      return res.status(404).json({ message: `No teams found with payment status: ${status}.` });
    }

    res.status(200).json(teams);
  } catch (err) {
    console.error('Get teams by payment status error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTeamsByVerificationStatus = async (req, res) => {
  try {
    const { status } = req.params;

    // Validate status
    if (!status) {
      return res.status(400).json({ message: 'Verification status is required.' });
    }

    // Find teams by verification status
    const isVerified = status === 'true';
    const teams = await Team.find({ isVerified });
    if (teams.length === 0) {
      return res.status(404).json({ message: `No teams found with verification status: ${status}.` });
    }

    res.status(200).json(teams);
  } catch (err) {
    console.error('Get teams by verification status error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getTeamsByLeaderEmail = async (req, res) => {
  try {
    const { leaderEmail } = req.params;

    // Validate leaderEmail
    if (!leaderEmail) {
      return res.status(400).json({ message: 'Leader email is required.' });
    }

    // Find teams by leader email
    const teams = await Team.find({ 'leader.email': leaderEmail });
    if (teams.length === 0) {
      return res.status(404).json({ message: 'No teams found for this leader.' });
    }

    res.status(200).json(teams);
  } catch (err) {
    console.error('Get teams by leader email error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTeamsByMemberEmail = async (req, res) => {
  try {
    const { memberEmail } = req.params;

    // Validate memberEmail
    if (!memberEmail) {
      return res.status(400).json({ message: 'Member email is required.' });
    }

    // Find teams by member email
    const teams = await Team.find({ 'members.email': memberEmail });
    if (teams.length === 0) {
      return res.status(404).json({ message: 'No teams found for this member.' });
    }

    res.status(200).json(teams);
  } catch (err) {
    console.error('Get teams by member email error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

