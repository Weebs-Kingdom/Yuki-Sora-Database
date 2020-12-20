const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, require: true },
    initialLevel: { type: Number, require: true },
    imageUrl: { type: String, require: true },
    baseHp: { type: Number, require: true },
    evolveLvl: { type: Number, require: true },
    shown: { type: Boolean, require: true, default: true },
    evolves: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    attacks: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    rarity: { type: String, default: "normal" },
    monsterType: { type: [String], require: true }
});

module.exports = mongoose.model("Monster", userSchema);