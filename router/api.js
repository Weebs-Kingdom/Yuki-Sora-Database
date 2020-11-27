const router = require("express").Router();

//Models
const User = require("../models/User/User");
const Item = require("../models/Items/Item");
const ItemUserCon = require("../models/Items/ItemUserCon");
const Attack = require("../models/Monster/Attack");
const Monter = require("../models/Monster/Monster");
const UserMonster = require("../models/Monster/UserMonster");
const Server = require("../models/Server");
const Monster = require("../models/Monster/Monster");
const Job = require("../models/User/Job");

//middleware
const verify = require("../middleware/verifyApiToken");
const UserJob = require("../models/User/UserJob");

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
    const user = await getUser(req.body);

    if (!user)
        return res.status(400).json({ status: 400, message: "User not found!" });
    //maybe to this in more specific json text yk...
    res.status(200).json({ status: "200", data: user });
});

router.post("/getUserInventory", verify, async(req, res) => {
    const user = await getUser(req.body);
    if (!user)
        return res.status(400).json({ status: 400, message: "User not found!" });
    var inventory = await ItemUserCon.find({ user: user._id });
    if (!inventory)
        return res
            .status(400)
            .json({ status: 400, message: "Inventory not found!" });
    res.status(200).json({ status: 200, data: inventory });
});

router.post("/getUserMonsters", verify, async(req, res) => {
    const user = await getUser(req.body);
    if (!user)
        return res.status(400).json({ status: 400, message: "User not found!" });
    var monsters = await UserMonster.find({ user: user._id });
    if (!monsters)
        return res.status(400).json({ status: 400, message: "Monster not found!" });
    res.status(200).json({ status: 200, data: monsters });
});

router.post("/userItem", verify, async(req, res) => {
    const si = req.body.item;
    const amount = req.body.amount;
    var item;
    var user;
    try {
        item = await Item.findById(si);
    } catch (err) {
        return res.status(400).json({ status: 400, message: "Item not found!" });
    }
    user = await getUser(req.body);
    if (!user)
        return res.status(400).json({ status: 400, message: "User not found!" });
    if (!item)
        return res.status(400).json({ status: 400, message: "Item not found!" });

    //Test if storage place already exists
    var st = await ItemUserCon.findOne({ itemKY: item._id, userKY: user._id });
    if (st) {
        st.amount += amount;
        if (st.amount < 0)
            return res
                .status(400)
                .json({ status: 400, message: "Can't have negative amount of items" });

        if (st.amount == 0) {
            st.remove();
            res.status(200).json({ status: 200, message: "removed record, its empty" });
        }

        try {
            const storage = await st.save();
            res.status(200).json({ status: 200, _id: storage._id, message: "add storage" });
        } catch (err) {
            console.log("an error occured! " + err);
            res.status(400).json({
                status: 400,
                message: "error while creating new user!",
                error: err,
            });
        }
    } else {
        if (amount < 0)
            return res
                .status(400)
                .json({ status: 400, message: "Can't have negative amount of items" });

        if (amount == 0)
            return res
                .status(400)
                .json({ status: 400, message: "Zero items will not be saved!" });

        const storage = new ItemUserCon({
            item: item._id,
            user: user._id,
            amount: amount,
        });

        try {
            const savedItem = await storage.save();
            res.status(200).json({ status: 200, _id: savedItem._id, message: "added/removed item to/from player" });
        } catch (err) {
            console.log("an error occured! " + err);
            res.status(400).json({
                status: 400,
                message: "error while creating new user!",
                error: err,
            });
        }
    }
});

router.post("/work", verify, async(req, res) => {
    var user = await getUser(req.body);
    if (!user) return res
        .status(400)
        .json({ status: 400, message: "User not found!" });

    var userJob;
    try {
        userJob = await UserJob.findById(user.job);
    } catch (err) {
        console.log("an error occured! " + err);
        return res
            .status(400)
            .json({ status: 400, message: "User job not found!" });
    }

    var ONE_HOUR = 60 * 60 * 1000;
    var time = ((new Date) - user.lastWorkTime);
    if (time < ONE_HOUR) {
        return res
            .status(400)
            .json({ status: 400, message: "Can work in" + time * 1000, data: time * 1000 });
    }

    var job;
    try {
        job = await Job.findById(userJob.job);
    } catch (err) {
        console.log("an error occured! " + err);
        return res
            .status(400)
            .json({ status: 400, message: "Job not found!" });
    }
    var cAdd;
    if (userJob.jobPosition == "trainee") {
        cAdd = job.earningTrainee;
    } else if (userJob.jobPosition == "coworker") {
        cAdd = job.earningCoworker;
    } else if (userJob.jobPosition == "headofdepartment") {
        cAdd = job.earningHeadOfDepartment;
    } else if (userJob.jobPosition == "manager") {
        cAdd = job.earningManager;
    } else {
        return res
            .status(400)
            .json({ status: 400, message: "Job document fail" });
    }
    try {
        user.coins += cAdd;
        await user.save();
    } catch (err) {
        console.log("an error occured! " + err);
        return res
            .status(400)
            .json({ status: 400, message: "Database error!" });
    }
    res.status(200).json({ status: 200, message: "Added coins!", data: cAdd });
});

router.post("/userJob", verify, async(req, res) => {
    const job = req.body.job;
    var jjob;
    try {
        jjob = await Job.findById(job);
    } catch (e) {
        return res
            .status(400)
            .json({ status: 400, message: "Job not found" });
    }
    var user = await getUser(req.body);
    if (!user) return res
        .status(400)
        .json({ status: 400, message: "User not found!" });

    var jPos = req.body.jPos;
    if (jPos == "trainee") {} else if (jPos == "coworker") {} else if (jPos == "head" || jPos == "headofdepartment") {
        jPos = "headofdepartment";
    } else if (jPos == "manager") {} else {
        return res
            .status(400)
            .json({ status: 400, message: "Invalid Job role!" });
    }

    const uJob = new UserJob({
        job: job,
        jobLevel: 1,
        jobXP: 0,
        jobPosition: jPos
    });
    try {
        const savedJob = await uJob.save();
        user.job = savedJob._id;
        await user.save();
        res.status(200).json({ status: 200, _id: savedJob._id, message: "added job to user" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while creating new user!",
            error: err,
        });
    }
});

router.delete("/userJob", verify, async(req, res) => {
    var user = await getUser(req.body);
    if (!user) return res
        .status(400)
        .json({ status: 400, message: "User not found!" });

    try {
        const userJob = UserJob.findById(user.job);
        await userJob.remove();
    } catch (err) {
        console.log("an error occured! " + err);
    }
    try {
        user.job = undefined;
        await user.save();
        res.status(200).json({ status: 200, message: "deleted!" });
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
            message: "error while patching user!",
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

router.post("/server", verify, async(req, res) => {
    const cServer = new Server(req.body);
    try {
        const savedServer = await cServer.save();
        res.status(200).json({ status: 200, _id: savedServer._id, message: "created server" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while creating new server!",
            error: err,
        });
    }
});

router.patch("/server", verify, async(req, res) => {
    try {
        const savedServer = await Server.update({ _id: req.body._id }, req.body.data);
        res.status(200).json({ status: 200, _id: savedServer._id, message: "patched server" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while patching server!",
            error: err,
        });
    }
});

router.delete("/server", verify, async(req, res) => {
    try {
        const savedServer = await Server.remove({ _id: req.body._id });
        res.status(200).json({ status: 200, message: "removed" });
    } catch (err) {
        console.log("an error occured! " + err);
        res
            .status(400)
            .json({ status: 400, message: "error while deleting server!", error: err });
    }
});

router.post("/job", verify, async(req, res) => {
    const cJob = new Job(req.body);
    try {
        const savedJob = await cJob.save();
        res.status(200).json({ status: 200, _id: savedJob._id, message: "created job" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while creating new job!",
            error: err,
        });
    }
});

router.patch("/job", verify, async(req, res) => {
    try {
        const savedJob = await Job.update({ _id: req.body._id }, req.body.data);
        res.status(200).json({ status: 200, _id: savedJob._id, message: "patched job" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(400).json({
            status: 400,
            message: "error while patching job!",
            error: err,
        });
    }
});

router.delete("/job", verify, async(req, res) => {
    try {
        const savedJob = await Job.remove({ _id: req.body._id });
        res.status(200).json({ status: 200, message: "removed" });
    } catch (err) {
        console.log("an error occured! " + err);
        res
            .status(400)
            .json({ status: 400, message: "error while deleting job!", error: err });
    }
});

router.post("/monster", verify, async(req, res) => {
    const cMonster = new Monster(req.body);
    try {
        const savedMonster = await cMonster.save();
        res.status(200).json({ status: 200, _id: savedMonster._id, message: "created monster" });
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
        res.status(200).json({ status: 200, _id: savedMonster._id, message: "patched monster" });
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
        res.status(200).json({ status: 200, _id: savedItem._id, message: "created item" });
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
        res.status(200).json({ status: 200, _id: savedItem._id, message: "patched item" });
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

    if (s) user = await getUserFromDID(s);
    if (si) user = await User.findById(si);

    return user;
}

module.exports = router;