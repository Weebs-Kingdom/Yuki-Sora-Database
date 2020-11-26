const mongoose = require("mongoose");
const Attack = require("./Attack");

const userSchema = new mongoose.Schema({
    name: String,
    imageUrl: String,
    baseHP: Number,
    maxHp: Number,
    evolveLvl: Number,
    shown: Boolean,
    evolves: [Schema.Types.ObjectId],
    attacks: [Schema.Types.ObjectId]
});

module.exports = mongoose.model("Monster", userSchema);