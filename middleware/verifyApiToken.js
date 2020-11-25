module.exports = async function(req, res, next) {
    const token = req.body.token;
    console.log("Token is " + token);
    next();
};