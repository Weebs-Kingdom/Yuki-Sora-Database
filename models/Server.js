const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    serverName: String,
    serverId: String,
    serverYtPlaylist: String,
    musicListenerId: String,
    workChannelId: String,
    shopChannelId: String,
    certificationMessageId: String,
    certificationChannelId: String,
    defaultMemberRoleId: String,
    defaultTempGamerRoleId: String,
    welcomeMessageChannelId: String,
    welcomeText: String,
    memberCountStatsChannelId: String,
    setupDone: Boolean,
    setupMode: Boolean,
    roleIds: [String],
    autoChannelIds: [String]
});

module.exports = mongoose.model("Server", userSchema);