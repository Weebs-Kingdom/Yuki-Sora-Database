const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId},
    twitchChannelId: {type: String},
    servers: {type: [String]}
});

module.exports = mongoose.model("TwitchUser", userSchema);