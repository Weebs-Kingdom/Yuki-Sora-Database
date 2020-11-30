const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    token: String
});

module.exports = mongoose.model("ApiToken", userSchema);