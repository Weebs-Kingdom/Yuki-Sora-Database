const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId},
    twitchChannelId: String,
    servers: [String]
});

module.exports = mongoose.model("TwitchUser", userSchema);