const mongoose = require("mongoose");
const UserJob = require("./UserJob");

const userSchema = new mongoose.Schema({
    username: String,
    userID: String,
    ytplaylist: String,
    isBotAdmin: Boolean,
    certLevel: String,
    lang: String,
    lastWorkTime: Date,
    lastDungeonVisit: Date,
    coins: Number,
    xp: Number,
    level: Number,
    maxMonsters: Number,
    maxItems: Number,
    saidHallo: Boolean,
    job: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model("User", userSchema);