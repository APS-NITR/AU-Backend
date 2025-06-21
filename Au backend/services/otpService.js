//otp 
const OTP = require('../models/OTP');

exports.storeOTP = async (email, otp, teamId) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  await OTP.findOneAndUpdate(
    { email },
    { otp, expiresAt, teamId },
    { upsert: true, new: true }
  );
};

exports.verifyOTP = async (email, otp) => {
  const record = await OTP.findOne({ email });

  if (!record || record.otp !== otp) return false;

  if (Date.now() > record.expiresAt) {
    await OTP.deleteOne({ email }); // expire it
    return false;
  }

  await OTP.deleteOne({ email }); // OTP is valid; now delete
  return true;
};

