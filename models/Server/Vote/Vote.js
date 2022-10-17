const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    server: mongoose.Schema.Types.ObjectId,
    channelId: String,
    voteType: Number,
    voteTitle: String,
    index: Number,
    messageId: String,
    voteColor: String
});

module.exports = mongoose.model("Vote", userSchema);