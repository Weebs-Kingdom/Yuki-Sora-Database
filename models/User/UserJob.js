const mongoose = require("mongoose");
const Job = require("./Job");

const userSchema = new mongoose.Schema({
    jobXP: Number,
    jobLevel: Number,
    jobPosition: String,
    job: Job
});

module.exports = mongoose.model("UserJob", userSchema);