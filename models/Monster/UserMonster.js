const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    rootMonster: { type: mongoose.Schema.Types.ObjectId, require: true },
    a1: { type: mongoose.Schema.Types.ObjectId, require: true },
    a2: { type: mongoose.Schema.Types.ObjectId, require: true },
    a3: { type: mongoose.Schema.Types.ObjectId, require: true },
    a4: { type: mongoose.Schema.Types.ObjectId, require: true },
    level: { type: Number, require: true },
    xp: { type: Number, require: true },
    dv: { type: Number, require: true },
    baseHP: { type: Number, require: true },
    hp: { type: Number, require: true },
    maxHp: { type: Number, require: true },
    evolveDirection: { type: String, require: true },
    user: { type: mongoose.Schema.Types.ObjectId, require: true }
});

module.exports = mongoose.model("UserMonster", userSchema);