const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       
    pass: process.env.EMAIL_PASSWORD    
  }
});

transporter.verify((err, success) => {
  if (err) {
    console.error('Email transporter failed:', err);
  } else {
    console.log('Email transporter ready');
  }
});

module.exports = transporter;
