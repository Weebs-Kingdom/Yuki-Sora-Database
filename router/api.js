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
    var monster1 = await UserMonster.findById(m1);
    if (monster1) return res.status(400).json({ status: 400, message: "Monster not found!" });
    monster1.hp = monster1.hp - dmg;
    monster1 = await monster1.save();
    res.status(200).json({ status: "200", data: [monster1] })
});

router.post("/getUserByDID", verify, async(req, res) => {
    const s = req.body.id;
    const user = await User.findOne({ userID: s });
    if (user) return res.status(400).json({ status: 400, message: "User not found!" });
    //maybe to this in more specific json text yk...
    res.status(200).json({ status: "200", data: [user] });
});

router.post("/getUserInventoryByDID", verify, async(req, res) => {
    const s = req.body.id;
    var inventory = await ItemUserCon.find({ user: { userID: s } });
    if (inventory) return res.status(400).json({ status: 400, message: "Inventory not found!" });
    var returningString = "{status: \"200\", data: [";
    var first = true;
    inventory.forEach(element => {
        if (!first)
            returningString += ",";
        else
            first = false;

        returningString += "{item: " + element.item + ", amount: " + element.amount + "}";
    });
    returningString += "]}";
    res.status(200).json(returningString);
});

router.post("/getUserMonstersByDID", verify, async(req, res) => {
    const s = req.body.id;
    var monsters = await UserMonster.find({ user: { userID: s } });
    if (monsters) return res.status(400).json({ status: 400, message: "Monster not found!" });
    var returningString = "{status: \"200\", data: [";
    var first = true;
    monsters.forEach(element => {
        if (!first)
            returningString += ",";
        else
            first = false;

        returningString += "{monster: " + element + "}";
    });
    returningString += "]}";
    res.status(200).json(returningString);
});

router.post("/newUser", verify, async(req, res) => {
    const cUser = new User(req.body);
    try {
        const savedUser = await cUser.save();
        res.status(200).json({ status: 200, message: savedUser._id });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({ status: 400, message: "error while creating new user!", error: err });
    }
});

router.post("/newMonster", verify, async(req, res) => {
    const cMonster = new Monster(req.body);
    try {
        const savedMonster = await cMonster.save();
        res.status(200).json({ status: 200, message: savedMonster._id });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({ status: 400, message: "error while creating new monster!", error: err });
    }
});

router.post("/newItem", verify, async(req, res) => {
    const cItem = new Item(req.body);
    try {
        const savedItem = await cMonster.save();
        res.status(200).json({ status: 200, message: savedItem._id });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({ status: 400, message: "error while creating new item!", error: err });
    }
});

module.exports = router;