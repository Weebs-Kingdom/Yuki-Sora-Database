const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId},
    server: {type: mongoose.Schema.Types.ObjectId},
    xp: {type: Number, default: 0},
    level: {type: Number, default: 0},
    isBooster: {type: Boolean, default: false},
    boosterChannels: [String],
    isMember: {type: Boolean, default: false},
    isTempMember: {type: Boolean, default: false},
    dateBecomeTempMember: {type: Date},
    dateBecomeMember: {type: Date},
    saidHello: {type: Boolean, default: false}
});

module.exports = mongoose.model("ServerUser", userSchema);