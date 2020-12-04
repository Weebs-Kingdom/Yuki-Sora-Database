const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    itemName: { type: String, require: true },
    itemRarity: { type: String, require: true },
    itemImageURL: { type: String, require: true },
    itemDescription: { type: String, require: true },
    itemType: { type: String, require: true },
    itemCanFound: { type: Boolean, default: false },
    isitemCookable: { type: Boolean, require: true },
    cooksInto: { type: mongoose.Schema.Types.ObjectId, require: true }
});

module.exports = mongoose.model("Item", userSchema);