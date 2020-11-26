module.exports = async function(req, res, next) {
    const token = req.header.token;
    console.log("Token is " + token);
    next();
};