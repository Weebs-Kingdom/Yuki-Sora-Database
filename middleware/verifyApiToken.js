var ApiToken = require('../models/ApiToken');

module.exports = async function(req, res, next) {
    const token = req.header("api-token");
    const apiToken = ApiToken.findOne({ token: token });
    if (!apiToken || apiToken.token != token) return res.status(401).json({ status: 401, message: "Access Denied! Invalid acces token!" });

    next();
};