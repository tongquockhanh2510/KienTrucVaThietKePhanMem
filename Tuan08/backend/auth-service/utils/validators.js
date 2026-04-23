// Validation functions

const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateUsername = (username) => {
  return username && username.length >= 3 && username.length <= 30;
};

const validateRegisterInput = (username, email, password) => {
  const errors = [];

  if (!validateUsername(username)) {
    errors.push('Username must be between 3 and 30 characters');
  }

  if (!validateEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateRegisterInput
};
