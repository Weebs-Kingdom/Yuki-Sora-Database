const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, require: true },
    userID: { type: String, require: true },
    ytplaylist: { type: String, require: true },
    isBotAdmin: { type: Boolean, require: true },
    certLevel: { type: String, require: true },
    lang: { type: String, require: true },
    lastWorkTime: { type: Date, require: true },
    lastDungeonVisit: { type: Date, require: true },
    coins: { type: Number, require: true },
    xp: { type: Number, require: true },
    level: { type: Number, require: true },
    maxMonsters: { type: Number, require: true },
    maxItems: { type: Number, require: true },
    saidHallo: { type: Boolean, require: true },
    job: { type: mongoose.Schema.Types.ObjectId, require: true }
});

module.exports = mongoose.model("User", userSchema);