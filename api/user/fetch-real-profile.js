const { generateFakeProfile } = require("../../lib/helpers.js");
module.exports = async function handler(req, res) { res.json(generateFakeProfile()); };
