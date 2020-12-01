const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    token: {type: String, require: true}
});

module.exports = mongoose.model("ApiToken", userSchema);