const { generateFakeProfile } = require("../_helpers.js");
module.exports = async function handler(req, res) { res.json(generateFakeProfile()); };
