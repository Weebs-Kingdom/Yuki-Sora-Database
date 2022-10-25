const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    earningTrainee: {type: Number, require: true},
    earningCoworker: {type: Number, require: true},
    earningHeadOfDepartment: {type: Number, require: true},
    earningManager: {type: Number, require: true},
    jobName: {type: String, require: true},
    shortName: {type: String, require: true},
    doing: {type: String, require: true}
});

module.exports = mongoose.model("Job", userSchema);