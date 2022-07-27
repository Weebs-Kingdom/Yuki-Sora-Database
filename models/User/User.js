const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, require: true },
    servers: [String],
    userID: { type: String, require: true },
    isBotAdmin: { type: Boolean, default: false },
    lang: { type: String, default: "en" },
    lastWorkTime: { type: Date },
    lastDungeonVisit: { type: Date },
    coins: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    maxMonsters: { type: Number, default: 10 },
    maxItems: { type: Number, default: 40 },
    job: { type: mongoose.Schema.Types.ObjectId },
    edit: Boolean,
    isBooster: {type: Boolean, default: false},
    boosterChannels: [String],
    numberLootBoxKeys: {type: Number, default: 1},
    energy: {type: Number, default: 40},
    maxEnergy: {type: Number, default: 40},
    craftingRecipes: [mongoose.Schema.Types.ObjectId]
});

module.exports = mongoose.model("User", userSchema);