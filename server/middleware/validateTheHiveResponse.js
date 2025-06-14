//validateTheHiveResponse.js
const validateTheHiveResponse = (req, res, next) => {
    res.on('finish', () => {
      if (!res.get('Content-Type').includes('application/json')) {
        console.error('Invalid response content type:', res.get('Content-Type'));
      }
    });
    next();
  };
  
  module.exports = validateTheHiveResponse;