const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, require: true },
    userID: { type: String, require: true },
    ytplaylist: { type: String, require: true },
    isBotAdmin: { type: Boolean, default: false },
    certLevel: { type: String, require: true },
    lang: { type: String, default: "en" },
    lastWorkTime: { type: Date },
    lastDungeonVisit: { type: Date },
    coins: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    maxMonsters: { type: Number, default: 10 },
    maxItems: { type: Number, default: 40 },
    job: { type: mongoose.Schema.Types.ObjectId }
});

module.exports = mongoose.model("User", userSchema);