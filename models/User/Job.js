const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    earningTrainee: Number,
    earningCoworker: Number,
    earningHeadOfDepartment: Number,
    earningManager: Number,
    jobName: String,
    shortName: String,
    doing: String
});

module.exports = mongoose.model("Job", userSchema);