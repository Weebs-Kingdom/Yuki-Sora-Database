const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    jobXP: { type: Number, require: true },
    jobLevel: { type: Number, require: true },
    jobPosition: { type: String, require: true },
    job: { type: mongoose.Schema.Types.ObjectId, require: true }
});

module.exports = mongoose.model("UserJob", userSchema);