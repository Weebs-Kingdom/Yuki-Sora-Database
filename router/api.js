const router = require("express").Router();

//Models
const User = require("../models/User/User");
const Item = require("../models/Items/Item");
const ItemUserCon = require("../models/Items/ItemUserCon");
const Attack = require("../models/Monster/Attack");
const UserMonster = require("../models/Monster/UserMonster");
const DiscServer = require("../models/Server");
const Monster = require("../models/Monster/Monster");
const Job = require("../models/User/Job");
const ApiToken = require("../models/ApiToken");
const AiMonster = require("../models/Monster/AiMonster");

//middleware
const verify = require("../middleware/verifyApiToken");
const UserJob = require("../models/User/UserJob");

//API Token creator
router.post("/apiToken", async(req, res) => {
    const pw = req.body.pw;
    const pww = process.env.SECRET_API_PW;

    //if there is no pw
    //disabled!
    //if (!pww)
    return res.status(401).json({ status: "401", message: "HAHAHA nope!" });

    if (pw == pww) {
        var nToken = "";
        while (true) {
            nToken = makeToken(100);
            const tToken = await ApiToken.findOne({ token: nToken });
            if (!tToken)
                break;
        }

        const sToken = new ApiToken({
            token: nToken
        });

        try {
            const savedToken = await sToken.save();
        } catch (err) {
            console.log("an error occured! " + err);
            res.status(200).json({
                status: 400,
                message: "error while creating token!",
                error: err,
            });
        }
        res.status(200).json({ status: 200, data: nToken });
    } else {
        res.status(401).json({ status: "401", message: "HAHAHA nope!" });
    }
});

router.post("/getAttacksByUserMonster", verify, async(req, res) => {
    const monster = req.body.monster;
    const mnste = await UserMonster.findById(monster);
    if (!mnste) return res.status(200).json({ status: 400, message: "Monster not found!" });
    const mnster = await Monster.findById(mnste.rootMonster);

    var attacks = [];

    var lwerEvs = await Monster.find({ evolves: { $in: [mnster._id] } });
    lwerEvs.push(mnster);

    for (let i = 0; i < lwerEvs.length; i++) {
        const atts = lwerEvs[i].attacks;
        for (let j = 0; j < atts.length; j++) {
            const att = await Attack.findById(atts[j]);
            if (att.level <= mnste.level)
                attacks.push(att);
        }
    }

    res.status(200).json({ status: 200, data: attacks, message: "Fetched attacks from monster" });
});

router.post("/selectAttack", verify, async(req, res) => {
    const monster = req.body.monster;
    const slot = req.body.slot;
    const attack = req.body.attack;

    const at = await Attack.findById(attack);
    var mn = await UserMonster.findById(monster);

    if (!at || !mn) return res.status(200).json({ status: 400, message: "Monster or attack not found!" });

    switch (slot) {
        case "a1":
            mn.a1 = at._id;
            mn.usage[0] = at.maxUsage;
            break

        case "a2":
            mn.a2 = at._id;
            mn.usage[1] = at.maxUsage;
            break;

        case "a3":
            mn.a3 = at._id;
            mn.usage[2] = at.maxUsage;
            break;

        case "a4":
            mn.a4 = at._id;
            mn.usage[3] = at.maxUsage;
            break;
    }

    await mn.save();

    res.status(200).json({ status: 200, message: "Updated!" });
});

router.post("/getAttacks", verify, async(req, res) => {
    const monster = req.body.monster;
    const mnster = await Monster.findById(monster);
    if (!mnster) return res.status(200).json({ status: 400, message: "Monster not found!" });

    var attacks = [];

    var lwerEvs = await Monster.find({ evolves: { $contains: mnster._id } });
    lwerEvs.push(mnster);

    for (let i = 0; i < lwerEvs.length; i++) {
        const atts = lwerEvs[i].attacks;
        for (let j = 0; j < atts.length; j++) {
            attacks.push(await Attack.findById(atts[j]));
        }
    }

    res.status(200).json({ status: 200, data: attacks, message: "Fetched attacks from monster" });
});

router.post("/createFight", verify, async(req, res) => {
    const user = await getUser(req.body);
    if (!user)
        return res.status(200).json({ status: 400, message: "User not found!" });

    const t = await AiMonster.findOne({ user: user._id });
    if (t)
        await t.remove();

    var mnsters = await Monster.find();
    shuffle(mnsters);
    const mnster = mnsters[0];

    const newAi = new AiMonster({
        rootMonster: mnster._id,
        level: getRandomInt(mnster.initialLevel, mnster.initialLevel + 10),
        dv: getRandomInt(0, 15),
        hp: mnster.baseHp,
        maxHp: mnster.baseHp,
        user: user._id
    });

    const sAi = await newAi.save();
    res.status(200).json({ status: 200, data: sAi, message: "Created ai monster" });
});

router.post("/giveRandomItem", verify, async(req, res) => {
    const user = await getUser(req.body);
    if (!user)
        return res.status(200).json({ status: 400, message: "User not found!" });

    const amount = req.body.amount;
    var rar = req.body.rarity;
    if (!rar)
        rar = 0;
    else
        rar = stringToRarityInt(rar);

    var its = [];

    for (let i = 0; i < amount; i++) {
        const dItem = await getRandomItem(rar);
        if (!dItem)
            return res.status(200).json({ status: 400, message: "No Item for rarity found!" });

        giveUserItem(1, dItem, user);
        its.push(dItem);
    }

    res.status(200).json({ status: 200, data: its, message: "Created ai monster" });
});

router.post("/userRandomMonster", verify, async(req, res) => {
    var user = await getUser(req.body);
    var rar = 0;
    if (req.body.rarity)
        rar = stringToRarityInt(req.body.rarity)

    if (!user)
        return res.status(200).json({ status: 400, message: "User not found!" });

    var mnsters = await Monster.find({});
    mnsters = shuffle(mnsters);
    var mnster = undefined;
    for (let i = 0; i < mnsters.length; i++) {
        var element = mnsters[i];
        if (stringToRarityInt(element.rarity) >= rar) {
            mnster = element;
            break;
        }
    }
    if (!mnster)
        return res.status(200).json({ status: 400, message: "No monster with rarityy found!" });

    var umnster = new UserMonster({
        rootMonster: mnster._id,
        hp: mnster.baseHp,
        maxHp: mnster.baseHp,
        user: user._id,
        dv: getRandomInt(0, 15)
    });

    var u = undefined;
    try {
        u = await umnster.save();
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new user!",
            error: err,
        });
    }

    return res.status(200).json({ status: 200, message: "Added monster", data: mnster });
});

//every fight step, just calculation
router.post("/fight", verify, async(req, res) => {
    const user = await getUser(req.body);
    const m1 = req.body.monster1;
    const m2 = req.body.monster2;
    const isAi1 = req.body.ai1;
    const isAi2 = req.body.ai2;
    const attck = req.body.attack;
    const slot = req.body.slot;

    if (!user)
        return res
            .status(200)
            .json({ status: 400, message: "Request is missing arguments" });

    var monster1 = undefined;
    var monster2 = undefined;

    if (isAi1) {
        monster1 = await AiMonster.findOne({ user: user._id });
    } else {
        monster1 = await UserMonster.findById(m1);
    }

    if (isAi2) {
        monster2 = await AiMonster.findOne({ user: user._id });
    } else {
        monster2 = await UserMonster.findById(m2);
    }

    if (!monster1 || !monster2)
        return res.status(200).json({ status: 400, message: "Monster not found! AII" });

    var attack = undefined;
    if (isAi1) {
        const mroot = await Monster.findById(monster1.rootMonster);
        if (!mroot)
            return res.status(200).json({ status: 400, message: "Monster not found! AI" });
        var atts = mroot.attacks;
        shuffle(atts);
        attack = atts[0];
    } else {
        if (!slot)
            return res.status(200).json({ status: 400, message: "No attack used!" });
        switch (slot) {
            case "a1":
                if (monster1.usage[0] <= 0) return res.status(200).json({ status: 400, message: "No attack usage left!" });
                attack = monster1.a1;
                monster1.usage[0] -= 1;
                break;

            case "a2":
                if (monster1.usage[1] <= 0) return res.status(200).json({ status: 400, message: "No attack usage left!" });
                attack = monster1.a2;
                monster1.usage[1] -= 1;
                break;

            case "a3":
                if (monster1.usage[2] <= 0) return res.status(200).json({ status: 400, message: "No attack usage left!" });
                attack = monster1.a3;
                monster1.usage[2] -= 1;
                break;

            case "a4":
                if (monster1.usage[3] <= 0) return res.status(200).json({ status: 400, message: "No attack usage left!" });
                attack = monster1.a4;
                monster1.usage[3] -= 1;
                break;
        }
    }

    attack = await Attack.findById(attack);
    const dmg = calcDmg(attack, monster1, monster2);

    monster2.hp = monster2.hp - dmg;
    const sMonster = await monster2.save();

    res.status(200).json({ status: 200, monster1: monster1, monster2: sMonster, attack: attack, dmg: dmg });
});

router.post("/getServer", verify, async(req, res) => {
    const server = await getServer(req.body);

    if (!server)
        return res.status(200).json({ status: 400, message: "Server not found!" });
    //maybe to this in more specific json text yk...
    res.status(200).json({ status: 200, data: server });
});

router.post("/getUser", verify, async(req, res) => {
    const user = await getUser(req.body);

    if (!user)
        return res.status(200).json({ status: 400, message: "User not found!" });
    //maybe to this in more specific json text yk...
    res.status(200).json({ status: 200, data: user });
});

router.get("/getUser", verify, async(req, res) => {
    const user = await User.find();

    var usrs = [];

    for (let i = 0; i < user.length; i++) {
        if (user[i].edit) {
            usrs.push(user[i]);
            user[i].edit = false;
            await user[i].save();
        }
    }
    res.status(200).json({ status: 200, data: usrs });
});

router.post("/getUserInventory", verify, async(req, res) => {
    const user = await getUser(req.body);
    if (!user)
        return res.status(200).json({ status: 400, message: "User not found!" });
    var inventory = await ItemUserCon.find({ user: user._id });
    if (!inventory)
        return res
            .status(200)
            .json({ status: 400, message: "Inventory not found!" });

    for (let i = 0; i < inventory.length; i++) {
        var iv = inventory[i];
        const it = await Item.findById(inventory[i].item);
        iv['itemName'] = it.itemName;
        delete iv['user'];
        inventory[i] = iv;
    }

    res.status(200).json({ status: 200, data: inventory });
});

router.post("/getUserMonsters", verify, async(req, res) => {
    const user = await getUser(req.body);
    if (!user)
        return res.status(200).json({ status: 400, message: "User not found!" });
    var monsters = await UserMonster.find({ user: user._id });
    if (!monsters)
        return res.status(200).json({ status: 400, message: "Monster not found!" });
    res.status(200).json({ status: 200, data: monsters });
});

router.post("/userItem", verify, async(req, res) => {
    const si = req.body.item;
    const amount = req.body.amount;
    var item = await Item.findById(si);
    if (!item)
        return res.status(200).json({ status: 400, message: "item not found!" });
    var user = await getUser(req.body);
    if (!user)
        return res.status(200).json({ status: 400, message: "User not found!" });
    savedItem = giveUserItem(amount, item, user)
    res.status(200).json({ status: 200, _id: savedItem._id, message: "added/removed item to/from player" });
});

router.post("/work", verify, async(req, res) => {
    var user = await getUser(req.body);
    if (!user) return res
        .status(200)
        .json({ status: 400, message: "User not found!" });

    var userJob;
    try {
        userJob = await UserJob.findById(user.job);
    } catch (err) {
        console.log("an error occured! " + err);
        return res
            .status(200)
            .json({ status: 400, message: "User job not found!" });
    }

    const fourHours = 1000 * 60 * 60 * 4;
    const fourHoursAgo = Date.now() - fourHours;
    const in24Hours = Date.now() + (1000 * 60 * 60 * 24);

    if (user.lastWorkTime > fourHoursAgo) {
        var seconds = Math.floor((user.lastWorkTime - (fourHoursAgo)) / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);

        hours = hours - (days * 24);
        minutes = minutes - (days * 24 * 60) - (hours * 60);
        seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

        const ts = hours + ":" + minutes + ":" + seconds;

        if (user.lastWorkTime > in24Hours) {
            userJob.jobStreak = 0;
            await userJob.save();
        }
        return res
            .status(200)
            .json({ status: 400, message: "Can work in " + ts, data: ts });
    }

    var job;
    try {
        job = await Job.findById(userJob.job);
    } catch (err) {
        console.log("an error occured! " + err);
        return res
            .status(200)
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
            .status(200)
            .json({ status: 400, message: "Job document fail" });
    }

    if (userJob.jobStreak <= 2) {} else if (userJob.jobStreak < 10) {
        cAdd += 5;
    } else if (userJob.jobStreak < 15) {
        cAdd += 10;
    } else if (userJob.jobStreak < 30) {
        cAdd += 20;
    } else if (userJob.jobStreak < 50) {
        cAdd += 50;
    } else if (userJob.jobStreak < 100) {
        cAdd += 100
    } else if (userJob.jobStreak < 365) {
        cAdd += 300;
    } else if (userJob.jobStreak < 500) {
        cAdd += 500;
    }

    try {
        testJob(userJob);
        userJob.jobStreak += 1;
        userJob.xp += getRandomInt(1, 10);
        user.lastWorkTime = Date.now();
        user.coins += cAdd;
        user.edit = true;
        await user.save();
        await userJob.save();
    } catch (err) {
        console.log("an error occured! " + err);
        return res
            .status(200)
            .json({ status: 400, message: "Database error!" });
    }
    res.status(200).json({ status: 200, message: "Added coins!", data: cAdd });
});

router.post("/getUserJob", verify, async(req, res) => {
    const user = await getUser(req.body);
    if (!user) return res
        .status(200)
        .json({ status: 400, message: "User not found!" });

    const jb = await UserJob.findById(user.job);
    if (!jb) return res
        .status(200)
        .json({ status: 400, message: "User has no job" });

    const job = await Job.findById(jb.job);

    res.status(200).json({ status: 200, job: job, uJob: jb, message: "got jobs" });
});

router.post("/userJob", verify, async(req, res) => {
    const job = req.body.job;
    var jjob;
    try {
        jjob = await Job.findById(job);
    } catch (e) {
        return res
            .status(200)
            .json({ status: 400, message: "Job not found" });
    }
    var user = await getUser(req.body);
    if (!user) return res
        .status(200)
        .json({ status: 400, message: "User not found!" });

    var jPos = req.body.jPos;
    if (jPos == "trainee") {} else if (jPos == "coworker") {} else if (jPos == "head" || jPos == "headofdepartment") {
        jPos = "headofdepartment";
    } else if (jPos == "manager") {} else {
        return res
            .status(200)
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
        res.status(200).json({
            status: 400,
            message: "error while creating new user!",
            error: err,
        });
    }
});

router.delete("/userJob", verify, async(req, res) => {
    var user = await getUser(req.body);
    if (!user) return res
        .status(200)
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
        res.status(200).json({
            status: 400,
            message: "error while creating new user!",
            error: err,
        });
    }
});

router.delete("/userMonster", verify, async(req, res) => {
    const id = req.body.mid;
    await UserMonster.remove({ _id: id });
    res.status(200).json({ status: 200, message: "deleted!" });
});

router.post("/feedMonster", verify, async(req, res) => {
    var monster = await UserMonster.findById(req.body.mid);

    const a1 = await Attack.findById(monster.a1);
    const a2 = await Attack.findById(monster.a2);
    const a3 = await Attack.findById(monster.a3);
    const a4 = await Attack.findById(monster.a4);

    var a1i = a1.maxUsage;
    var a2i = a2.maxUsage;
    var a3i = a3.maxUsage;
    var a4i = a4.maxUsage;

    if (!a1)
        a1i = 0;
    if (!a2)
        a2i = 0;
    if (!a3)
        a3i = 0;
    if (!a4)
        a4i = 0;

    monster.usage = [a1i, a2i, a3i, a4i];
    await monster.save();
    res.status(200).json({ status: 200, message: "deleted!" });
});

router.post("/coins", verify, async(req, res) => {
    const coins = req.body.coins;
    var user = await getUser(req.body);
    if (!user) return res
        .status(200)
        .json({ status: 400, message: "User not found!" });

    user.coins += coins;
    user.edit = true;
    try {
        await user.save();
    } catch (e) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating adding coins to user!",
            error: err,
        });
    }
    res.status(200).json({ status: 200, data: user, message: "add coins" });
});

router.post("/user", verify, async(req, res) => {
    try {
        const cUser = new User(req.body);
        const savedUser = await cUser.save();
        res.status(200).json({ status: 200, _id: savedUser._id, message: "created user" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new user!",
            error: err,
        });
    }
});

router.get("/user", verify, async(req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ status: 200, _id: users._id, message: "fatched all users", data: users });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while fatching users!",
            error: err,
        });
    }
});

router.patch("/user", verify, async(req, res) => {
    const user = await getUser(req.body);
    if (!user)
        return res.status(200).json({ status: 400, message: "user does not exist" });

    try {
        const savedUser = await User.findOneAndUpdate({ _id: user._id }, req.body.data);
        res.status(200).json({ status: 200, _id: savedUser._id, message: "patched user" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
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
            .status(200)
            .json({ status: 400, message: "error while deleting user!", error: err });
    }
});

router.post("/server", verify, async(req, res) => {
    try {
        const sServer = await getServer(req.body);
        if (sServer) {
            res.status(200).json({ status: 400, message: "This server already exists!" });
        }
    } catch (e) {
        res.status(200).json({ status: 400, message: "This server already exists!" });
    }

    try {
        const cServer = new DiscServer(req.body);
        const savedServer = await cServer.save();
        res.status(200).json({ status: 200, _id: savedServer._id, message: "created server" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new server!",
            error: err,
        });
    }
});

router.patch("/server", verify, async(req, res) => {
    const ser = await getServer(req.body);
    if (!ser)
        return res.status(200).json({ status: 400, message: "server does not exist" });
    try {
        const savedServer = await DiscServer.findOneAndUpdate({ _id: ser._id }, req.body.data);
        res.status(200).json({ status: 200, _id: savedServer._id, message: "patched server" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while patching server!",
            error: err,
        });
    }
});

router.delete("/server", verify, async(req, res) => {
    try {
        const savedServer = await DiscServer.remove({ _id: req.body._id });
        res.status(200).json({ status: 200, message: "removed" });
    } catch (err) {
        console.log("an error occured! " + err);
        res
            .status(200)
            .json({ status: 400, message: "error while deleting server!", error: err });
    }
});

router.get("/job", verify, async(req, res) => {
    try {
        const jobs = await Job.find({});
        res.status(200).json({ status: 200, message: "fatched all jobs", data: jobs });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while fatching jobs!",
            error: err,
        });
    }
});

router.post("/job", verify, async(req, res) => {
    try {
        const cJob = new Job(req.body);
        const savedJob = await cJob.save();
        res.status(200).json({ status: 200, _id: savedJob._id, message: "created job" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new job!",
            error: err,
        });
    }
});

router.patch("/job", verify, async(req, res) => {
    try {
        const savedJob = await Job.findOneAndUpdate({ _id: req.body._id }, req.body.data);
        res.status(200).json({ status: 200, _id: savedJob._id, message: "patched job" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
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
            .status(200)
            .json({ status: 400, message: "error while deleting job!", error: err });
    }
});

router.post("/monster", verify, async(req, res) => {
    try {
        const cMonster = new Monster(req.body);
        const savedMonster = await cMonster.save();
        res.status(200).json({ status: 200, _id: savedMonster._id, message: "created monster" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new monster!",
            error: err,
        });
    }
});

router.get("/monster", verify, async(req, res) => {
    try {
        const monsters = await Monster.find({});
        res.status(200).json({ status: 200, _id: monsters._id, message: "fatched all monsters", data: monsters });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while fatching monsters!",
            error: err,
        });
    }
});

router.patch("/monster", verify, async(req, res) => {
    try {
        const savedMonster = await Monster.findOneAndUpdate({ _id: req.body._id },
            req.body.data
        );
        res.status(200).json({ status: 200, _id: savedMonster._id, message: "patched monster" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
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
        res.status(200).json({
            status: 400,
            message: "error while deleting monster!",
            error: err,
        });
    }
});

router.get("/item", verify, async(req, res) => {
    try {
        const items = await Item.find({});
        res.status(200).json({ status: 200, _id: items._id, message: "fatched all items", data: items });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while fatching items!",
            error: err,
        });
    }
});

router.post("/item", verify, async(req, res) => {
    try {
        const cItem = new Item(req.body);
        const savedItem = await cItem.save();
        res.status(200).json({ status: 200, _id: savedItem._id, message: "created item" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new item!",
            error: err,
        });
    }
});

router.patch("/item", verify, async(req, res) => {
    try {
        const cItem = await Item.findOneAndUpdate({ _id: req.body._id }, req.body.data);
        res.status(200).json({ status: 200, _id: savedItem._id, message: "patched item" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while patching item!",
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
            .status(200)
            .json({ status: 400, message: "error while deleting item!", error: err });
    }
});

router.post("/attack", verify, async(req, res) => {
    try {
        const cItem = new Attack(req.body);
        const savedAttack = await cItem.save();
        res.status(200).json({ status: 200, _id: savedAttack._id, message: "created attack" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new attack!",
            error: err,
        });
    }
});

router.get("/attack", verify, async(req, res) => {
    try {
        const attacks = await Attack.find({});
        res.status(200).json({ status: 200, _id: attacks._id, message: "fatched all attacks", data: attacks });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while fatching attacks!",
            error: err,
        });
    }
});

router.patch("/attack", verify, async(req, res) => {
    try {
        const cItem = await Attack.findOneAndUpdate({ _id: req.body._id }, req.body.data);
        res.status(200).json({ status: 200, _id: savedItem._id, message: "patched attack" });
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while patching attack!",
            error: err,
        });
    }
});

router.delete("/attack", verify, async(req, res) => {
    try {
        const cItem = await Attack.remove({ _id: req.body._id });
        res.status(200).json({ status: 200, message: "removed" });
    } catch (err) {
        console.log("an error occured! " + err);
        res
            .status(200)
            .json({ status: 400, message: "error while deleting attack!", error: err });
    }
});

async function giveUserItem(amount, item, user) {

    //Test if storage place already exists
    var st = await ItemUserCon.findOne({ itemKY: item._id, userKY: user._id });
    if (st) {
        st.amount += amount;
        if (st.amount < 0)
            return res
                .status(200)
                .json({ status: 400, message: "Can't have negative amount of items" });

        if (st.amount == 0) {
            st.remove();
        }

        try {
            const storage = await st.save();
        } catch (err) {
            console.log("an error occured! " + err);
            res.status(200).json({
                status: 400,
                message: "error while creating new user!",
                error: err,
            });
        }
    } else {
        if (amount < 0)
            return res
                .status(200)
                .json({ status: 400, message: "Can't have negative amount of items" });

        if (amount == 0)
            return res
                .status(200)
                .json({ status: 400, message: "Zero items will not be saved!" });

        const storage = new ItemUserCon({
            item: item._id,
            user: user._id,
            amount: amount,
        });

        try {
            const savedItem = await storage.save();
            return savedItem;
        } catch (err) {
            console.log("an error occured! " + err);
            res.status(200).json({
                status: 400,
                message: "error while creating new user!",
                error: err,
            });
        }
    }
}

function testJob(ujob) {
    if (ujob.jobPosition == "trainee") {
        if (ujob.xp > 50) {
            ujob.level += 1;
        }
        if (ujob.level > 10) {
            ujob.jobPosition = "coworker";
            ujob.xp = 0;
            ujob.level = 1;
        }
    } else if (ujob.jobPosition == "coworker") {
        if (ujob.xp > 100) {
            ujob.level += 1;
        }
        if (ujob.level > 100) {
            ujob.jobPosition = "coworker";
            ujob.xp = 0;
            ujob.level = 1;
        }
    } else if (ujob.jobPosition == "headofdepartment") {
        if (ujob.xp > 200) {
            ujob.level += 1;
        }
        if (ujob.level > 500) {
            ujob.jobPosition = "coworker";
            ujob.xp = 0;
            ujob.level = 1;
        }
    } else if (ujob.jobPosition == "manager") {
        if (ujob.xp > 500) {
            ujob.level += 1;
        }
    }
}

async function getRandomItem(minRarity) {
    var items = await Item.find();
    shuffle(items);
    for (let i = 0; i < items.length; i++) {
        if (stringToRarityInt(items[i].itemRarity) >= minRarity) {
            return items[i];
        }
    }
}

function calcDmg(attack, monster, monster1) {
    var baseDmg = attack.baseDmg;
    var lvl = monster.level;
    var stab = calcStab(monster, monster1);
    var efficiency = calcEfficiency(monster, monster1);
    var dmg = (((lvl * (1 / 3)) + 2) + baseDmg) * efficiency * stab;

    return dmg;
}

function calcStab(monster, monster1) {
    return 1;
}

function calcEfficiency(monster, monster1) {
    return 1;
}

async function getUserFromDID(did) {
    return await User.findOne({ userID: did });
}

async function getUserDidFromId(id) {
    return await User.findOne({ _id: id }).userID;
}

async function getServerFromDID(did) {
    return await DiscServer.findOne({ serverId: did });
}

async function getUser(body) {
    const s = body.id;
    const si = body._id;
    var user;

    if (s) user = await getUserFromDID(s);
    if (si) user = await User.findById(si);

    return user;
}

async function getServer(body) {
    const s = body.sid;
    const si = body.s_id;
    var server;

    if (s) server = await getServerFromDID(s);
    if (si) server = await DiscServer.findById(si);

    return server;
}

function makeToken(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#/&%§=?~*';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function stringToRarityInt(strin) {
    switch (strin) {
        case "normal":
            return 0;

        case "epic":
            return 1;

        case "legendary":
            return 2;

        case "mystic":
            return 3;

        default:
            return 0;
    }
}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = router;