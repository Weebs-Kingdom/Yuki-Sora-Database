const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    jobXP: { type: Number, require: true, default: 0 },
    jobLevel: { type: Number, require: true, default: 1 },
    jobPosition: { type: String, require: true },
    jobStreak: { type: Number, require: true, default: 0 },
    job: { type: mongoose.Schema.Types.ObjectId, require: true }
});

module.exports = mongoose.model("UserJob", userSchema);