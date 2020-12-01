const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, require: true },
    imageUrl: { type: String, require: true },
    baseHP: { type: Number, require: true },
    maxHp: { type: Number, require: true },
    evolveLvl: { type: Number, require: true },
    shown: { type: Boolean, require: true },
    evolves: { type: [mongoose.Schema.Types.ObjectId], require: true },
    attacks: { type: [mongoose.Schema.Types.ObjectId], require: true },
    aiMonster: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("Monster", userSchema);