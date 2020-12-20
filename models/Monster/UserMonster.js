const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    rootMonster: { type: mongoose.Schema.Types.ObjectId, require: true },
    a1: { type: mongoose.Schema.Types.ObjectId, default: null },
    a2: { type: mongoose.Schema.Types.ObjectId, default: null },
    a3: { type: mongoose.Schema.Types.ObjectId, default: null },
    a4: { type: mongoose.Schema.Types.ObjectId, default: null },
    usage: { type: [Number], default: [0, 0, 0, 0] },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    dv: { type: Number, require: true },
    hp: { type: Number, require: true },
    maxHp: { type: Number, require: true },
    evolveDirection: { type: String, default: null },
    user: { type: mongoose.Schema.Types.ObjectId, require: true },
    statusEffect: { type: String, require: true }
});

module.exports = mongoose.model("UserMonster", userSchema);