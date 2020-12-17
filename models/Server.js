const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    serverName: String,
    serverId: String,
    serverYtPlaylist: String,
    certificationMessageId: String,
    certificationChannelId: String,
    welcomeMessageChannelId: String,
    welcomeText: String,
    memberCountStatsChannelId: String,
    roleIds: [String],
    defaultMemberRoleId: String,
    defaultTempGamerRoleId: String,
    autoChannelIds: [String],
    primeRoleId: String,
    vipRoleId: String
});

module.exports = mongoose.model("Server", userSchema);