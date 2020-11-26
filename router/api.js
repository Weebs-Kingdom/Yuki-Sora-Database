const router = require("express").Router();
const User = require("../models/User/User");
const Item = require("../models/Items/Item");
const ItemUserCon = require("../models/Items/ItemUserCon");
const Attack = require("../models/Monster/Attack");
const Monter = require("../models/Monster/Monster");
const UserMonster = require("../models/Monster/UserMonster");
const Serverd = require("../models/Server");
const Monster = require("../models/Monster/Monster");
const verify = require("../middleware/verifyApiToken");

//create ai monster usw.
router.post("/createFight", verify, async(req, res) => {
    res.status(200).json({ message: "test looolz UWU OWO :P" });
});

//every fight step, just calculation
router.post("/fight", verify, async(req, res) => {
    const m1 = req.body.monster;
    const dmg = req.body.dmg;

    if (!m1 || !dmg)
        return res
            .status(400)
            .json({ status: 400, message: "Request is mssing arguments" });

    var monster1 = await UserMonster.findById(m1);
    if (!monster1)
        return res.status(400).json({ status: 400, message: "Monster not found!" });
    monster1.hp = monster1.hp - dmg;
    monster1 = await monster1.save();
    res.status(200).json({ status: "200", data: [monster1] });
});

router.post("/getUser", verify, async(req, res) => {
    const user = getUser(req.body);

    if (!user)
        return res.status(400).json({ status: 400, message: "User not found!" });
    //maybe to this in more specific json text yk...
    res.status(200).json({ status: "200", data: user });
});

router.post("/getUserInventoryByDID", verify, async(req, res) => {
    const user = getUser(req.body);
    if (!user)
        return res.status(400).json({ status: 400, message: "User not found!" });
    var inventory = await ItemUserCon.find({ user: user._id });
    if (!inventory)
        return res
            .status(400)
            .json({ status: 400, message: "Inventory not found!" });
    var returningString = '{status: "200", data: [';
    var first = true;
    inventory.forEach((element) => {
        if (!first) returningString += ",";
        else first = false;

        returningString +=
            "{item: " + element.item + ", amount: " + element.amount + "}";
    });
    returningString += "]}";
    res.status(200).json(returningString);
});

router.post("/getUserMonstersByDID", verify, async(req, res) => {
    const user = getUser(req.body);
    if (!user)
        return res.status(400).json({ status: 400, message: "User not found!" });
    var monsters = await UserMonster.find({ user: user._id });
    if (!monsters)
        return res.status(400).json({ status: 400, message: "Monster not found!" });
    var returningString = '{status: "200", data: [';
    var first = true;
    monsters.forEach((element) => {
        if (!first) returningString += ",";
        else first = false;

        returningString += "{monster: " + element + "}";
    });
    returningString += "]}";
    res.status(200).json(returningString);
});

router.post("/userItem", verify, async(req, res) => {
    const si = req.body.item;
    const amount = req.body.amount;
    const item = Item.findById(si);
    const user = getUser(req.body);
    if (!user)
        return res.status(400).json({ status: 400, message: "User not found!" });
    if (!item)
        return res.status(400).json({ status: 400, message: "Item not found!" });

    const storage = new ItemUserCon({
        itemKY: si._id,
        userKY: user._id,
        amount: amount
    });

    try {
        const savedItem = await storage.save();
        res.status(200).json({ status: 200, message: savedItem._id });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while creating new user!",
            error: err,
        });
    }
});

router.post("/user", verify, async(req, res) => {
    const cUser = new User(req.body);
    try {
        const savedUser = await cUser.save();
        res.status(200).json({ status: 200, message: savedUser._id });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while creating new user!",
            error: err,
        });
    }
});

router.patch("/user", verify, async(req, res) => {
    try {
        const savedUser = await User.update({ _id: req.body._id }, req.body.data);
        res.status(200).json({ status: 200, message: savedUser._id });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while patching new user!",
            error: err,
        });
    }
});

router.delete("/user", verify, async(req, res) => {
    try {
        const savedUser = await User.remove({ _id: req.body._id });
        res.status(200).json({ status: 200, message: "removed" });
    } catch (err) {
        console.log("an error occured! " + err);
        res
            .status(400)
            .json({ status: 400, message: "error while deleting user!", error: err });
    }
});

router.post("/monster", verify, async(req, res) => {
    const cMonster = new Monster(req.body);
    try {
        const savedMonster = await cMonster.save();
        res.status(200).json({ status: 200, message: savedMonster._id });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while creating new monster!",
            error: err,
        });
    }
});

router.patch("/monster", verify, async(req, res) => {
    try {
        const savedMonster = await Monster.update({ _id: req.body._id },
            req.body.data
        );
        res.status(200).json({ status: 200, message: savedMonster._id });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while patching new monster!",
            error: err,
        });
    }
});

router.delete("/monster", verify, async(req, res) => {
    try {
        const savedMonster = await Monster.remove({ _id: req.body._id });
        res.status(200).json({ status: 200, message: "removed" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while deleting monster!",
            error: err,
        });
    }
});

router.post("/item", verify, async(req, res) => {
    const cItem = new Item(req.body);
    try {
        const savedItem = await cItem.save();
        res.status(200).json({ status: 200, message: savedItem._id });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while creating new item!",
            error: err,
        });
    }
});

router.patch("/item", verify, async(req, res) => {
    try {
        const cItem = await Item.update({ _id: req.body._id }, req.body.data);
        res.status(200).json({ status: 200, message: savedItem._id });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while patching new item!",
            error: err,
        });
    }
});

router.delete("/item", verify, async(req, res) => {
    try {
        const cItem = await Item.remove({ _id: req.body._id });
        res.status(200).json({ status: 200, message: "removed" });
    } catch (err) {
        console.log("an error occured! " + err);
        res
            .status(400)
            .json({ status: 400, message: "error while deleting item!", error: err });
    }
});

async function getUserFromDID(did) {
    return await User.findOne({ userID: did });
}

async function getUserDidFromId(id) {
    return await User.findOne({ _id: id }).userID;
}

async function getUser(body) {
    const s = body.id;
    const si = body._id;
    var user;

    if (s) user = getUserFromDID(s);
    if (si) user = await User.findById(si);

    return user;
}

module.exports = router;