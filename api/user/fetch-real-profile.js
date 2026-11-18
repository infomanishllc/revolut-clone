const { generateFakeProfile } = require("../helpers.js");
module.exports = async function handler(req, res) { res.json(generateFakeProfile()); };
