const mongoose = require("mongoose");
const Attack = require("./Attack");

const userSchema = new mongoose.Schema({
    name: String,
    imageUrl: String,
    baseHP: Number,
    maxHp: Number,
    evolveLvl: Number,
    shown: Boolean,
    evolves: [Monster],
    attacks: [Attack]
});

module.exports = mongoose.model("Monster", userSchema);