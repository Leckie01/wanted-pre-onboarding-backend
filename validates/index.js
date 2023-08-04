const { validationResult } = require("express-validator");

const validateParameters = (req, res) => {
  const validResult = validationResult(req);

  if (!validResult.isEmpty()) {
    return res.status(400).json({ errors: validResult.array() });
  }
};

module.exports = validateParameters;
