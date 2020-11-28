module.exports = async function(req, res, next) {
    const token = req.header("api-token");
    console.log("Token is " + token);
    next();
};