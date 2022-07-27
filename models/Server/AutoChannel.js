const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    server: mongoose.Schema.Types.ObjectId,
    channelId: String,
    autoChannelType: Number
});

module.exports = mongoose.model("AutoChannel", userSchema);