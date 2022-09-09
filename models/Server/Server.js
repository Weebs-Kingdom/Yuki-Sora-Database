const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    serverName: String,
    serverId: String,
    certificationMessageId: String,
    certificationChannelId: String,
    welcomeMessageChannelId: String,
    statisticsCategoryId: String,
    defaultRoles: [String],
    defaultMemberRoleId: String,
    defaultTempGamerRoleId: String,
    autoChannelIds: [String],
    primeRoleId: String,
    vipRoleId: String,
    boosterRoleId: String,
    boosterCategoryId: String,
    dungeonQueueMessage: String,
    dungeonEmoji: String,
    dungeonChan: [String],
    dungeonChanRoles: [String],
    gamingChannels: [String],
    twitchNotifyChannelId: String
});

module.exports = mongoose.model("Server", userSchema);