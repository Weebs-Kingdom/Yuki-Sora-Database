const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    imageUrl: String,
    baseHP: Number,
    maxHp: Number,
    evolveLvl: Number,
    shown: Boolean,
    evolves: [mongoose.Schema.Types.ObjectId],
    attacks: [mongoose.Schema.Types.ObjectId],
    aiMonster: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Monster", userSchema);