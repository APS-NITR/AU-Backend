//error handler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message || err);
  
  // Set the response status code
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);

  // Send the error response
  res.json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;
