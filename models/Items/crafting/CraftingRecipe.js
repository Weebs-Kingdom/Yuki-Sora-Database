const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    items: [mongoose.Schema.Types.ObjectId],
    itemCount: [Number],
    commonRecipe: Boolean,
    hammerPunches: Number,
    result: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model("CraftingRecipe", userSchema);