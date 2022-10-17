const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    vote: mongoose.Schema.Types.ObjectId,
    roleId: String,
    description: String,
    emote: String,
    index: Number,
    votes: Number
});

module.exports = mongoose.model("VoteElement", userSchema);