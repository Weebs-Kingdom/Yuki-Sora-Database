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
const AMcon = require("../models/Monster/AttackMonsterCon");

//middleware
const verify = require("../middleware/verifyApiToken");
const UserJob = require("../models/User/UserJob");

//API Token creator
router.post("/apiToken", async (req, res) => {
    const pw = req.body.pw;
    const pww = process.env.SECRET_API_PW;

    //if there is no pw
    //disabled!
    if (!pww)
    return res.status(401).json({ status: "401", message: "HAHAHA nope!" });

    if (pw == pww) {
        var nToken = "";
        while (true) {
            nToken = makeToken(100);
            const tToken = await ApiToken.findOne({token: nToken});
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
        res.status(200).json({status: 200, data: nToken});
    } else {
        res.status(401).json({status: "401", message: "HAHAHA nope!"});
    }
});

router.post("/giveMonsterToUser", verify, async (req, res) => {
    var user = await getUser(req.body);

    if (!user)
        return res.status(200).json({status: 400, message: "User not found!"});

    if (await (await UserMonster.find({user: user._id})).length >= user.maxMonsters)
        return res.status(200).json({status: 400, message: "Not enough space!"});

    var mnster = await Monster.findById(req.body.monster);
    if (!mnster) return res.status(200).json({status: 400, message: "Monster not found"});

    var umnster = new UserMonster({
        rootMonster: mnster._id,
        level: mnster.initialLevel,
        hp: mnster.baseHp,
        maxHp: mnster.baseHp,
        user: user._id,
        dv: getRandomInt(1, 15)
    });


    var u = undefined;
    try {
        u = await umnster.save();
        await testMonster(u);
        u = await umnster.save();
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new user!",
            error: err,
        });
    }

    return res.status(200).json({status: 200, message: "Added monster", data: mnster});
});

router.post("/cleanup", async (req, res) => {
    res.status(200).json({status: 200, message: await cleanUp()});
});

router.post("/getAttacksByUserMonster", verify, async (req, res) => {
    const monster = req.body.monster;
    const mnste = await UserMonster.findById(monster);
    if (!mnste) return res.status(200).json({status: 400, message: "Monster not found!"});
    const mnster = await Monster.findById(mnste.rootMonster);

    var attacks = await getAttacksByMonster(mnster, mnste.level);

    res.status(200).json({status: 200, data: attacks, message: "Fetched attacks from monster"});
});

router.post("/selectAttack", verify, async (req, res) => {
    const monster = req.body.monster;
    const slot = req.body.slot;
    const attack = req.body.attack;

    const at = await Attack.findById(attack);
    var mn = await UserMonster.findById(monster);

    if (!at || !mn) return res.status(200).json({status: 400, message: "Monster or attack not found!"});

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

    res.status(200).json({status: 200, message: "Updated!"});
});

router.post("/getAttacks", verify, async (req, res) => {
    const monster = req.body.monster;
    const mnster = await Monster.findById(monster);
    if (!mnster) return res.status(200).json({status: 400, message: "Monster not found!"});

    var attacks = [];

    var lwerEvs = await Monster.find({evolves: {$contains: mnster._id}}).sort({name: 1});
    lwerEvs.push(mnster);

    for (let i = 0; i < lwerEvs.length; i++) {
        const atts = lwerEvs[i].attacks;
        for (let j = 0; j < atts.length; j++) {
            attacks.push(await Attack.findById(atts[j]));
        }
    }

    res.status(200).json({status: 200, data: attacks, message: "Fetched attacks from monster"});
});

router.post("/createFight", verify, async (req, res) => {
    const user = await getUser(req.body);
    if (!user)
        return res.status(200).json({status: 400, message: "User not found!"});

    const t = await AiMonster.findOne({user: user._id});
    if (t)
        await t.remove();

    var mnsters = await Monster.find();
    shuffle(mnsters);
    const mnster = mnsters[0];

    const level = getRandomInt(mnster.initialLevel, mnster.initialLevel + 10);
    const dv = getRandomInt(0, 15);
    const maxHp = mnster.baseHp + (level * ((((dv * level) / 100) + 10) / (((dv) / 100) + 10))) + (mnster.baseHp / 100 * 80 * (level / 100 * 50));

    const newAi = new AiMonster({
        rootMonster: mnster._id,
        level: level,
        dv: dv,
        hp: maxHp,
        maxHp: maxHp,
        user: user._id
    });

    newAi.maxHp = maxHp;
    newAi.hp = maxHp;

    const sAi = await newAi.save();
    res.status(200).json({status: 200, data: sAi, message: "Created ai monster"});
});

router.post("/giveRandomItem", verify, async (req, res) => {
    const user = await getUser(req.body);
    if (!user)
        return res.status(200).json({status: 400, message: "User not found!"});

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
            return res.status(200).json({status: 400, message: "No Item for rarity found!"});

        giveUserItem(1, dItem, user);
        its.push(dItem);
    }

    res.status(200).json({status: 200, data: its, message: "Created ai monster"});
});

router.post("/userRandomMonster", verify, async (req, res) => {
    var user = await getUser(req.body);
    var rar = 0;
    if (req.body.rarity)
        rar = stringToRarityInt(req.body.rarity)

    if (!user)
        return res.status(200).json({status: 400, message: "User not found!"});

    if (await (await UserMonster.find({user: user._id})).length >= user.maxMonsters)
        return res.status(200).json({status: 400, message: "Not enough space!"});

    var mnsters = await Monster.find({});
    mnsters = shuffle(mnsters);
    var mnster = undefined;
    for (let i = 0; i < mnsters.length; i++) {
        var element = mnsters[i];
        if (stringToRarityInt(element.rarity) >= rar && element.shown) {
            mnster = element;
            break;
        }
    }
    if (!mnster)
        return res.status(200).json({status: 400, message: "No monster with rarityy found!"});

    var umnster = new UserMonster({
        rootMonster: mnster._id,
        level: mnster.initialLevel,
        hp: mnster.baseHp,
        maxHp: mnster.baseHp,
        user: user._id,
        dv: getRandomInt(1, 15)
    });


    var u = undefined;
    try {
        u = await umnster.save();
        await testMonster(u);
        u = await umnster.save();
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new user!",
            error: err,
        });
    }

    return res.status(200).json({status: 200, message: "Added monster", data: mnster});
});

router.post("/healMonster", verify, async (req, res) => {
    const mn = req.body.mid;
    var monster = await UserMonster.findById(mn);
    if (!monster)
        return res.status(200).json({status: 400, message: "Monster not found!"});

    monster.hp = monster.maxHp;

    monster = await monster.save();

    return res.status(200).json({status: 200, message: "healed monster", data: monster});
});

//every fight step, just calculation
router.post("/fight", verify, async (req, res) => {
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
            .json({status: 400, message: "Request is missing arguments"});

    var monster1 = undefined;
    var monster2 = undefined;

    if (isAi1) {
        monster1 = await AiMonster.findOne({user: user._id});
    } else {
        monster1 = await UserMonster.findById(m1);
    }

    if (isAi2) {
        monster2 = await AiMonster.findOne({user: user._id});
    } else {
        monster2 = await UserMonster.findById(m2);
    }

    if (!monster1 || !monster2)
        return res.status(200).json({status: 400, message: "Monster not found! AII"});

    var attack = undefined;
    if (isAi1) {
        const mroot = await Monster.findById(monster1.rootMonster);
        if (!mroot)
            return res.status(200).json({status: 400, message: "Monster not found! AI"});
        var atts = await getAttacksByMonster(mroot, monster1.level);
        if (atts.length <= 0) {
            return res.status(200).json({status: 400, message: "AI has no attacks!"});
        }
        shuffle(atts);
        attack = atts[0];
    } else {
        if (!slot)
            return res.status(200).json({status: 400, message: "No attack used!"});
        switch (slot) {
            case "a1":
                if (monster1.usage[0] <= 0) return res.status(200).json({
                    status: 400,
                    message: "No attack usage left!"
                });
                attack = monster1.a1;
                monster1.usage[0] -= 1;
                break;

            case "a2":
                if (monster1.usage[1] <= 0) return res.status(200).json({
                    status: 400,
                    message: "No attack usage left!"
                });
                attack = monster1.a2;
                monster1.usage[1] -= 1;
                break;

            case "a3":
                if (monster1.usage[2] <= 0) return res.status(200).json({
                    status: 400,
                    message: "No attack usage left!"
                });
                attack = monster1.a3;
                monster1.usage[2] -= 1;
                break;

            case "a4":
                if (monster1.usage[3] <= 0) return res.status(200).json({
                    status: 400,
                    message: "No attack usage left!"
                });
                attack = monster1.a4;
                monster1.usage[3] -= 1;
                break;
        }
    }

    attack = await Attack.findById(attack);
    const dmg = calcDmg(attack, monster1, monster2);

    monster2.hp -= dmg;
    const sMonster = await monster2.save();

    res.status(200).json({status: 200, monster1: monster1, monster2: sMonster, attack: attack, dmg: dmg});
});

router.post("/getServer", verify, async (req, res) => {
    const server = await getServer(req.body);

    if (!server)
        return res.status(200).json({status: 400, message: "Server not found!"});
    //maybe to this in more specific json text yk...
    res.status(200).json({status: 200, data: server});
});

router.post("/xpOnMonster", verify, async (req, res) => {
    var monster = await UserMonster.findById(req.body.mid);
    monster.xp += req.body.xp;
    await testMonster(monster);
    monster = await monster.save();

    res.status(200).json({status: 200, data: monster});
});

router.post("/getUser", verify, async (req, res) => {
    const user = await getUser(req.body);

    if (!user)
        return res.status(200).json({status: 400, message: "User not found!"});
    //maybe to this in more specific json text yk...
    res.status(200).json({status: 200, data: user});
});

router.get("/getUser", verify, async (req, res) => {
    const user = await User.find();

    var usrs = [];

    for (let i = 0; i < user.length; i++) {
        if (user[i].edit) {
            usrs.push(user[i]);
            user[i].edit = false;
            await user[i].save();
        }
    }
    res.status(200).json({status: 200, data: usrs});
});

router.post("/getUserInventory", verify, async (req, res) => {
    const user = await getUser(req.body);
    if (!user)
        return res.status(200).json({status: 400, message: "User not found!"});
    var inventory = await ItemUserCon.find({user: user._id});
    var data = [];
    if (!inventory)
        return res
            .status(200)
            .json({status: 400, message: "Inventory not found!"});

    for (let i = 0; i < inventory.length; i++) {
        const it = await Item.findById(inventory[i].item);
        if (it) {
            var entry = {};
            entry.itemName = it.itemName;
            entry.item = it._id;
            entry.amount = inventory[i].amount;
            data.push(entry);
        }
    }

    res.status(200).json({status: 200, data: data});
});

router.post("/getUserMonsters", verify, async (req, res) => {
    const user = await getUser(req.body);
    if (!user)
        return res.status(200).json({status: 400, message: "User not found!"});
    var monsters = await UserMonster.find({user: user._id});
    if (!monsters)
        return res.status(200).json({status: 400, message: "Monster not found!"});
    res.status(200).json({status: 200, data: monsters});
});

router.post("/userItem", verify, async (req, res) => {
    const si = req.body.item;
    const amount = req.body.amount;
    var item = await Item.findById(si);
    if (!item)
        return res.status(200).json({status: 400, message: "item not found!"});
    var user = await getUser(req.body);
    if (!user)
        return res.status(200).json({status: 400, message: "User not found!"});
    savedItem = giveUserItem(amount, item, user)
    res.status(200).json({status: 200, _id: savedItem._id, message: "added/removed item to/from player"});
});

router.post("/work", verify, async (req, res) => {
    var user = await getUser(req.body);
    if (!user) return res
        .status(200)
        .json({status: 400, message: "User not found!"});

    var userJob;
    try {
        userJob = await UserJob.findById(user.job);
    } catch (err) {
        console.log("an error occured! " + err);
        return res
            .status(200)
            .json({status: 400, message: "User job not found!"});
    }

    const fourHours = 1000 * 60 * 60 * 4;
    const fourHoursAgo = Date.now() - fourHours;
    const twentyFourHours = 1000 * 60 * 60 * 24;
    const twentyFourHoursAgo = Date.now() - twentyFourHours;

    if (user.lastWorkTime > fourHoursAgo) {
        var seconds = Math.floor((user.lastWorkTime - (fourHoursAgo)) / 1000);
        var minutes = Math.floor(seconds / 60);
        var hours = Math.floor(minutes / 60);
        var days = Math.floor(hours / 24);

        hours = hours - (days * 24);
        minutes = minutes - (days * 24 * 60) - (hours * 60);
        seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

        const ts = hours + ":" + minutes + ":" + seconds;
        return res
            .status(200)
            .json({status: 400, message: "Can work in " + ts, data: ts});
    }

    if (user.lastWorkTime < twentyFourHoursAgo) {
        userJob.jobStreak = 0;
        await userJob.save();
    }

    var job;
    try {
        job = await Job.findById(userJob.job);
    } catch (err) {
        console.log("an error occured! " + err);
        return res
            .status(200)
            .json({status: 400, message: "Job not found!"});
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
            .json({status: 400, message: "Job document fail"});
    }

    if (userJob.jobStreak <= 2) {
    } else if (userJob.jobStreak < 10) {
        cAdd += 5;
    } else if (userJob.jobStreak < 15) {
        cAdd += 10;
    } else if (userJob.jobStreak < 30) {
        cAdd += 20;
    } else if (userJob.jobStreak < 50) {
        cAdd += 40;
    } else if (userJob.jobStreak < 100) {
        cAdd += 70
    } else if (userJob.jobStreak < 365) {
        cAdd += 100;
    } else if (userJob.jobStreak < 500) {
        cAdd += 200;
    }

    try {
        testJob(userJob);
        userJob.jobStreak += 1;
        userJob.jobXP += getRandomInt(1, 10);
        user.lastWorkTime = Date.now();
        user.coins += cAdd;
        user.edit = true;
        await user.save();
        await userJob.save();
    } catch (err) {
        console.log("an error occured! " + err);
        return res
            .status(200)
            .json({status: 400, message: "Database error!"});
    }
    res.status(200).json({status: 200, message: "Added coins!", data: cAdd});
});

router.post("/getUserJob", verify, async (req, res) => {
    const user = await getUser(req.body);
    if (!user) return res
        .status(200)
        .json({status: 400, message: "User not found!"});

    const jb = await UserJob.findById(user.job);
    if (!jb) return res
        .status(200)
        .json({status: 400, message: "User has no job"});

    const job = await Job.findById(jb.job);

    res.status(200).json({status: 200, job: job, uJob: jb, message: "got jobs"});
});

router.post("/userJob", verify, async (req, res) => {
    const job = req.body.job;
    var jjob;
    try {
        jjob = await Job.findById(job);
    } catch (e) {
        return res
            .status(200)
            .json({status: 400, message: "Job not found"});
    }
    var user = await getUser(req.body);
    if (!user) return res
        .status(200)
        .json({status: 400, message: "User not found!"});

    var jPos = req.body.jPos;
    if (jPos == "trainee") {
    } else if (jPos == "coworker") {
    } else if (jPos == "head" || jPos == "headofdepartment") {
        jPos = "headofdepartment";
    } else if (jPos == "manager") {
    } else {
        return res
            .status(200)
            .json({status: 400, message: "Invalid Job role!"});
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
        res.status(200).json({status: 200, _id: savedJob._id, message: "added job to user"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new user!",
            error: err,
        });
    }
});

router.delete("/userJob", verify, async (req, res) => {
    var user = await getUser(req.body);
    if (!user) return res
        .status(200)
        .json({status: 400, message: "User not found!"});

    try {
        const userJob = UserJob.findById(user.job);
        await userJob.remove();
    } catch (err) {
        console.log("an error occured! " + err);
    }
    try {
        user.job = undefined;
        await user.save();
        res.status(200).json({status: 200, message: "deleted!"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new user!",
            error: err,
        });
    }
});

router.delete("/userMonster", verify, async (req, res) => {
    const id = req.body.mid;
    await UserMonster.remove({_id: id});
    res.status(200).json({status: 200, message: "deleted!"});
});

router.post("/feedMonster", verify, async (req, res) => {
    var monster = await UserMonster.findById(req.body.mid);

    const a1 = await Attack.findById(monster.a1);
    const a2 = await Attack.findById(monster.a2);
    const a3 = await Attack.findById(monster.a3);
    const a4 = await Attack.findById(monster.a4);

    var a1i;
    var a2i;
    var a3i;
    var a4i;

    if (!a1)
        a1i = 0;
    else a1i = a1.maxUsage;
    if (!a2)
        a2i = 0;
    else a2i = a2.maxUsage;
    if (!a3)
        a3i = 0;
    else a3i = a3.maxUsage;
    if (!a4)
        a4i = 0;
    else a4i = a4.maxUsage;

    monster.usage = [a1i, a2i, a3i, a4i];
    await monster.save();
    res.status(200).json({status: 200, message: "feed!"});
});

router.post("/coins", verify, async (req, res) => {
    const coins = req.body.coins;
    var user = await getUser(req.body);
    if (!user) return res
        .status(200)
        .json({status: 400, message: "User not found!"});

    if (coins < 0) {
        if ((user.coins - coins) < 0) {
            return res
                .status(200)
                .json({status: 400, message: "Not enough money!"});
        }
    }

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
    res.status(200).json({status: 200, data: user, message: "add coins"});
});

router.post("/user", verify, async (req, res) => {
    try {
        const cUser = new User(req.body);
        const savedUser = await cUser.save();
        res.status(200).json({status: 200, _id: savedUser._id, message: "created user"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new user!",
            error: err,
        });
    }
});

router.get("/user", verify, async (req, res) => {
    try {
        const users = await User.find({}).sort({username: 1});
        res.status(200).json({status: 200, _id: users._id, message: "fatched all users", data: users});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while fatching users!",
            error: err,
        });
    }
});

router.patch("/user", verify, async (req, res) => {
    const user = await getUser(req.body);
    if (!user)
        return res.status(200).json({status: 400, message: "user does not exist"});

    try {
        const savedUser = await User.findOneAndUpdate({_id: user._id}, req.body.data);
        res.status(200).json({status: 200, _id: savedUser._id, message: "patched user"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while patching user!",
            error: err,
        });
    }
});

router.delete("/user", verify, async (req, res) => {
    try {
        const savedUser = await User.remove({_id: req.body._id});
        res.status(200).json({status: 200, message: "removed"});
    } catch (err) {
        console.log("an error occured! " + err);
        res
            .status(200)
            .json({status: 400, message: "error while deleting user!", error: err});
    }
});

router.post("/server", verify, async (req, res) => {
    try {
        const sServer = await getServer(req.body);
        if (sServer) {
            res.status(200).json({status: 400, message: "This server already exists!"});
        }
    } catch (e) {
        res.status(200).json({status: 400, message: "This server already exists!"});
    }

    try {
        const cServer = new DiscServer(req.body);
        const savedServer = await cServer.save();
        res.status(200).json({status: 200, _id: savedServer._id, message: "created server"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new server!",
            error: err,
        });
    }
});

router.patch("/server", verify, async (req, res) => {
    const ser = await getServer(req.body);
    if (!ser)
        return res.status(200).json({status: 400, message: "server does not exist"});
    try {
        const savedServer = await DiscServer.findOneAndUpdate({_id: ser._id}, req.body.data);
        res.status(200).json({status: 200, _id: savedServer._id, message: "patched server"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while patching server!",
            error: err,
        });
    }
});

router.delete("/server", verify, async (req, res) => {
    try {
        const savedServer = await DiscServer.remove({_id: req.body._id});
        res.status(200).json({status: 200, message: "removed"});
    } catch (err) {
        console.log("an error occured! " + err);
        res
            .status(200)
            .json({status: 400, message: "error while deleting server!", error: err});
    }
});

router.get("/job", verify, async (req, res) => {
    try {
        const jobs = await Job.find({}).sort({shortname: 1});
        res.status(200).json({status: 200, message: "fatched all jobs", data: jobs});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while fatching jobs!",
            error: err,
        });
    }
});

router.post("/job", verify, async (req, res) => {
    try {
        const cJob = new Job(req.body);
        const savedJob = await cJob.save();
        res.status(200).json({status: 200, _id: savedJob._id, message: "created job"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new job!",
            error: err,
        });
    }
});

router.patch("/job", verify, async (req, res) => {
    try {
        const savedJob = await Job.findOneAndUpdate({_id: req.body._id}, req.body.data);
        res.status(200).json({status: 200, _id: savedJob._id, message: "patched job"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while patching job!",
            error: err,
        });
    }
});

router.delete("/job", verify, async (req, res) => {
    try {
        const savedJob = await Job.remove({_id: req.body._id});
        res.status(200).json({status: 200, message: "removed"});
    } catch (err) {
        console.log("an error occured! " + err);
        res
            .status(200)
            .json({status: 400, message: "error while deleting job!", error: err});
    }
});

router.post("/monster", verify, async (req, res) => {
    try {
        const atts = req.body.attacks;
        delete req.body.attacks;

        const cMonster = new Monster(req.body);
        const savedMonster = await cMonster.save();

        for (const e of atts) {
            const at = new AMcon({
                attack: e.attack,
                level: e.level,
                monster: savedMonster._id
            });

            await at.save();
        }
        res.status(200).json({status: 200, _id: savedMonster._id, message: "created monster"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new monster!",
            error: err,
        });
    }
});

router.get("/monster", verify, async (req, res) => {
    try {
        var mnsters = [];
        var monsters = await Monster.find({}).sort({name: 1});
        for (var e of monsters) {
            var nats = await getAttacksByMonster(e, "all");
            e = e.toJSON();
            if(nats.length <= 0){
                delete e.attacks;
            } else {
                e.attacks = nats;
            }
            mnsters.push(e);
        }

        res.status(200).json({status: 200, _id: monsters._id, message: "fatched all monsters", data: mnsters});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while fatching monsters!",
            error: err,
        });
    }
});

router.patch("/monster", verify, async (req, res) => {
    try {
        const ats = req.body.data.attacks;
        const m = await Monster.findById(req.body._id);
        const mats = await getAttacksByMonster(m, "all");

        for (const e of ats) {
            var update = true;
            try {
                const t = await AMcon.findOne({monster: req.body.data._id, attack: e.attack});
                if (!t) {
                    update = false;
                    const at = new AMcon({
                        attack: e.attack,
                        level: e.level,
                        monster: req.body._id
                    });

                    await at.save();
                }
            } catch (e) {

            }

            if (update == true)
                await AMcon.findOneAndUpdate({monster: req.body.data._id, attack: e.attack}, e);
        }

        for (const e of mats) {
            var found = false;
            for (const ee of ats) {
                if(ee._id == e._id)
                    found = true;
            }
            if(found === false){
                var a = await AMcon.findOne({attack: e._id, monster: req.body._id});
                await a.remove();
            }
        }

        delete req.body.data.attacks;
        const savedMonster = await Monster.findOneAndUpdate({_id: req.body._id},
            req.body.data
        );
        res.status(200).json({status: 200, _id: savedMonster._id, message: "patched monster"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while patching new monster!",
            error: err,
        });
    }
});

router.delete("/monster", verify, async (req, res) => {
    try {
        await Monster.remove({_id: req.body._id});
        res.status(200).json({status: 200, message: "removed"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while deleting monster!",
            error: err,
        });
    }
});

router.get("/item", verify, async (req, res) => {
    try {
        const items = await Item.find({}).sort({itemName: 1});
        res.status(200).json({status: 200, message: "fatched all items", data: items});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while fatching items!",
            error: err,
        });
    }
});

router.post("/item", verify, async (req, res) => {
    try {
        const cItem = new Item(req.body);
        const savedItem = await cItem.save();
        res.status(200).json({status: 200, _id: savedItem._id, message: "created item"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new item!",
            error: err,
        });
    }
});

router.patch("/item", verify, async (req, res) => {
    try {
        const cItem = await Item.findOneAndUpdate({_id: req.body._id}, req.body.data);
        res.status(200).json({status: 200, _id: cItem._id, message: "patched item"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while patching item!",
            error: err,
        });
    }
});

router.delete("/item", verify, async (req, res) => {
    try {
        await Item.remove({_id: req.body._id});
        res.status(200).json({status: 200, message: "removed"});
    } catch (err) {
        console.log("an error occured! " + err);
        res
            .status(200)
            .json({status: 400, message: "error while deleting item!", error: err});
    }
});

router.post("/attack", verify, async (req, res) => {
    try {
        const cItem = new Attack(req.body);
        const savedAttack = await cItem.save();
        res.status(200).json({status: 200, _id: savedAttack._id, message: "created attack"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while creating new attack!",
            error: err,
        });
    }
});

router.get("/attack", verify, async (req, res) => {
    try {
        const attacks = await Attack.find({}).sort({attackName: 1});
        res.status(200).json({status: 200, message: "fatched all attacks", data: attacks});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while fatching attacks!",
            error: err,
        });
    }
});

router.patch("/attack", verify, async (req, res) => {
    try {
        const cItem = await Attack.findOneAndUpdate({_id: req.body._id}, req.body.data);
        res.status(200).json({status: 200, _id: cItem._id, message: "patched attack"});
    } catch (err) {
        console.log("an error occured! " + err);
        res.status(200).json({
            status: 400,
            message: "error while patching attack!",
            error: err,
        });
    }
});

router.delete("/attack", verify, async (req, res) => {
    try {
        await Attack.remove({_id: req.body._id});
        res.status(200).json({status: 200, message: "removed"});
    } catch (err) {
        console.log("an error occured! " + err);
        res
            .status(200)
            .json({status: 400, message: "error while deleting attack!", error: err});
    }
});

async function giveUserItem(amount, item, user) {

    //Test if storage place already exists
    var st = await ItemUserCon.findOne({item: item._id, user: user._id});
    if (st) {
        st.amount += amount;
        if (st.amount < 0)
            return res
                .status(200)
                .json({status: 400, message: "Can't have negative amount of items"});

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
                .json({status: 400, message: "Can't have negative amount of items"});

        if (amount == 0)
            return res
                .status(200)
                .json({status: 400, message: "Zero items will not be saved!"});

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

async function testMonster(monster) {
    const rootMnster = await Monster.findById(monster.rootMonster);
    const level = monster.level;
    const dv = monster.dv;

    var levelUpXp = level * 7 + ((dv / 5) * 10);

    const maxHp = rootMnster.baseHp + (level * ((((dv * level) / 100) + 10) / (((dv) / 100) + 10))) + (rootMnster.baseHp / 100 * 80 * (level / 100 * 50));
    const dif = maxHp - monster.maxHp;

    monster.maxHp = maxHp;
    monster.hp += dif;

    while (levelUpXp < monster.xp) {
        monster.xp -= levelUpXp;
        monster.level += 1;
        levelUpXp = level * 10 + ((dv / 100 * 50) * 10);
    }

    if (rootMnster.evolves && rootMnster.evolveLvl) {
        if (rootMnster.evolveLvl <= monster.level) {
            monster.rootMonster = rootMnster.evolves[getRandomInt(0, rootMnster.evolves.length - 1)];
            await testMonster(monster);
        }
    }
}

function testJob(ujob) {
    if (ujob.jobPosition == "trainee") {
        if (ujob.jobXP >= 50) {
            ujob.jobXP -= 50;
            ujob.jobLevel += 1;
        }
        if (ujob.level >= 10) {
            ujob.jobPosition = "coworker";
            ujob.jobXP = 0;
            ujob.jobLevel = 1;
        }
    } else if (ujob.jobPosition == "coworker") {
        if (ujob.jobXP >= 100) {
            ujob.jobLevel += 1;
            ujob.jobXP -= 100;
        }
        if (ujob.jobLevel >= 100) {
            ujob.jobPosition = "coworker";
            ujob.jobXP = 0;
            ujob.jobLevel = 1;
        }
    } else if (ujob.jobPosition == "headofdepartment") {
        if (ujob.jobXP >= 200) {
            ujob.jobLevel += 1;
            ujob.jobXP -= 200;
        }
        if (ujob.jobLevel >= 500) {
            ujob.jobPosition = "coworker";
            ujob.jobXP = 0;
            ujob.jobLevel = 1;
        }
    } else if (ujob.jobPosition == "manager") {
        if (ujob.jobXP >= 500) {
            ujob.jobLevel += 1;
            ujob.jobXP -= 500;
        }
    }
}

async function cleanUp() {
    var txt = "";
    //item user cons
    const itemUsrs = await ItemUserCon.find();
    for (const e of itemUsrs) {
        const i1 = await Item.findById(e.item);
        const usr = await User.findById(e.user);

        if (!usr || !i1) {
            txt += "[-] Storage " + e._id + "\n";
            await e.remove();
        }
    }


    //User monsters
    const userMnster = await UserMonster.find();
    for (const e of userMnster) {
        //If monster exist at all
        const m = await Monster.findById(e.rootMonster);
        const usr = await User.findById(e.user);
        if (!m || !usr) {
            await e.remove();
            txt += "[-] Monster " + e.name + "\n";
            continue;
        }

        //attacks up to date
        var update = {};

        var a1 = "a";
        var a2 = "a";
        var a3 = "a";
        var a4 = "a";

        if (e.a1 != null)
            a1 = await Attack.findById(e.a1);
        if (e.a2 != null)
            a2 = await Attack.findById(e.a2);
        if (e.a3 != null)
            a3 = await Attack.findById(e.a3);
        if (e.a4 != null)
            a4 = await Attack.findById(e.a4);

        if (!a1) {
            update.a1 = null;
            txt += "[-] atta1 " + e._id + " ";
        }

        if (!a2) {
            update.a2 = null;
            txt += "[-] atta2 " + e._id + " ";
        }

        if (!a3) {
            update.a3 = null;
            txt += "[-] atta3 " + e._id + " ";
        }

        if (!a4) {
            update.a4 = null;
            txt += "[-] atta4 " + e._id + " ";
        }

        if (!a1 || !a2 || !a3 || !a4) {
            await UserMonster.updateOne({_id: e._id}, {$set: update})
            txt += "\n";
        }
    }

    //Monsters
    const mnsters = await Monster.find();
    for (const e of mnsters) {
        var eupdate = [];
        for (const evs of e.evolves) {
            const m = await Monster.findById(evs);
            if (m)
                eupdate.push(evs);
        }

        if (eupdate.length != e.evolves.length) {
            txt += "[~] evs " + e.name + " ";
        }

        if ((eupdate.length != e.evolves.length)) {
            await Monster.updateOne({_id: e._id}, {$set: {evolves: eupdate}});
            txt += "\n";
        }
    }

    const cons = await AMcon.find();
    for (const e of cons) {
        const mnster = await Monster.findById(e.monster);
        const att = await Attack.findById(e.attack);

        if (!mnster || !att) {
            txt += "[-] AM Con" + "\n";
            await e.remove();
        }
    }

    return txt;
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
    return await User.findOne({userID: did});
}

async function getUserDidFromId(id) {
    return await User.findOne({_id: id}).userID;
}

async function getServerFromDID(did) {
    return await DiscServer.findOne({serverId: did});
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

async function getAttacksByMonster(mnster, level) {
    var attacks = [];

    var lwerEvs = await Monster.find({evolves: {$in: [mnster._id]}});
    lwerEvs.push(mnster);

    for (let i = 0; i < lwerEvs.length; i++) {
        const atts = await AMcon.find({monster: lwerEvs[i]._id});
        for (let j = 0; j < atts.length; j++) {
            if (level == "all" || atts[j].level <= level) {
                var attack = await Attack.findById(atts[j].attack);
                try {
                    attack = attack.toJSON();
                    attack.level = atts[j].level;
                    attacks.push(attack);
                } catch (e){

                }
            }
        }
    }
    return attacks;
}

function makeToken(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#/&%=?~*';
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

function thread() {
    setTimeout(() => async function () {
            await cleanUp();
            thread();
        },
        300);
}

function startThreads() {
    console.log("starting update threads");
    thread();
}

module.exports = router;
module.exports.startThreads = function () {
    startThreads()
};