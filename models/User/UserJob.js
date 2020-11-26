const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    jobXP: Number,
    jobLevel: Number,
    jobPosition: String,
    job: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model("UserJob", userSchema);