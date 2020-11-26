const mongoose = require("mongoose");
const ItemUserCon = require("./ItemUserCon");

const userSchema = new mongoose.Schema({
    itemName: String,
    itemRarity: String,
    itemImageURL: String,
    itemDescription: String,
    isitemCookable: Boolean,
    cooksInto: Schema.Types.ObjectId
});

module.exports = mongoose.model("Item", userSchema);