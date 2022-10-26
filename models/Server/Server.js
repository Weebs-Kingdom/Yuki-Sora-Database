const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    guildName: String,
    guildId: String,
    patchNotesChannelId: String,
    certificationMessageId: String,
    certificationChannelId: String,
    welcomeMessageChannelId: String,
    statisticsCategoryId: String,
    defaultRoles: [String],
    defaultMemberRoleId: String,
    defaultTempMemberRoleId: String,
    primeRoleId: String,
    vipRoleId: String,
    boosterRoleId: String,
    boosterCategoryId: String,
    dungeonQueueMessage: String,
    dungeonEmoji: String,
    dungeonChan: [String],
    dungeonChanRoles: [String],
    twitchNotifyChannelId: String
});

module.exports = mongoose.model("Server", userSchema);