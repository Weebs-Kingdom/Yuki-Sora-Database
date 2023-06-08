const router = require("express").Router();
const schedule = require('node-schedule');

const yukir = require('./yukiroute');

//Models
const User = require("../models/User/User");
const Item = require("../models/Items/Item");
const ItemUserCon = require("../models/Items/ItemUserCon");
const Attack = require("../models/Monster/Attack");
const UserMonster = require("../models/Monster/UserMonster");
const DiscServer = require("../models/Server/Server");
const AutoChannel = require("../models/Server/AutoChannel");
const Monster = require("../models/Monster/Monster");
const Job = require("../models/User/Job");
const ApiToken = require("../models/ApiToken");
const AiMonster = require("../models/Monster/AiMonster");
const AMcon = require("../models/Monster/AttackMonsterCon");
const Recipe = require("../models/Items/crafting/CraftingRecipe");
const Topic = require("../models/Topics/Topic");
const TCategory = require("../models/Topics/TCategory");
const RedeemCode = require("../models/Redeem/RedeemCode");
const RedeemUserCon = require("../models/Redeem/RedeemUserCon");
const TwitchUserCon = require("../models/User/UserTwitchConnection");
const UserJob = require("../models/User/UserJob");
const Vote = require("../models/Server/Vote/Vote");
const VoteElement = require("../models/Server/Vote/VoteElement");
const Task = require("../models/YukiTasks/Task");
const ServerUser = require("../models/User/ServerUser");

//middleware
const verify = require("../middleware/verifyApiToken");

const fetch = require('node-fetch');

router.use(yukir({route: "disc-server", module: DiscServer}));
router.use(yukir({route: "disc-user", module: User}));
router.use(yukir({route: "autochannel", module: AutoChannel}));
router.use(yukir({route: "user-twitch-con", module: TwitchUserCon}));
router.use(yukir({route: "vote", module: Vote}));
router.use(yukir({route: "vote-element", module: VoteElement}));
router.use(yukir({route: "job", module: Job}));
router.use(yukir({route: "user-job", module: UserJob}));
router.use(yukir({route: "yukiTask", module: Task}));
router.use(yukir({route: "server-user", module: ServerUser}));

router.get("/findTwitchUsersByServer", verify, async (req, res) => {
    const server = await DiscServer.findOne({_id: req.body.id});
    if(!server) return res.status(200).json({status: 400, message: "Server not found!", data: []});
    const su = await TwitchUserCon.find({server: server._id});
    var tww = su.toJSON();

    res.status(200).json({status: 200, message: "Found data!", data: tww});
});

router.post("/findServerUsersByUser", verify, async (req, res) => {
    const user = await getUser(req.body);
    if (!user) return res.status(200).json({status: 400, message: "User not found!", data: []});
    const su = await ServerUser.find({user: user._id});
    if (!su) return res.status(200).json({status: 400, message: "Server user not found!", data: []});
    var tww = su.toJSON();

    res.status(200).json({status: 200, message: "Found data!", data: tww});
});
router.post("/findServerUserByUserAServer", verify, async (req, res) => {
    const user = await getUser(req.body);
    if (!user) return res.status(200).json({status: 400, message: "User not found!", data: []});
    const server = await DiscServer.findOne({_id: req.body.server});
    if(!server) return res.status(200).json({status: 400, message: "Server not found!", data: []});
    const su = await ServerUser.findOne({user: user._id, server: server._id});
    if (!su) return res.status(200).json({status: 400, message: "Server user not found!", data: []});
    var tww = su.toJSON();

    res.status(200).json({status: 200, message: "Found data!", data: tww});
});

router.post("/findVoteElementsByVote", verify, async (req, res) => {
    const id = req.body.vote;
    if (!id) {
        return res.status(200).json({status: 404, message: "The data can't be found! The id is empty", data: []});
    }
    const data = await VoteElement.find({vote: id});

    if (!data)
        return res.status(200).json({status: 404, message: "The data can't be found!", data: []});
    else
        return res.status(200).json({status: 200, message: "Found data!", data: data});
});

router.post("/findVotesByChannel", verify, async (req, res) => {
    const id = req.body.serverId;
    const channelId = req.body.channelId;
    let server;

    if (id) {
        server = await DiscServer.findOne({_id: id});
    }
    let data;
    if (!id || !channelId) {
        return res.status(200).json({status: 404, message: "The data can't be found! The id is empty", data: []});
    }
    data = await Vote.find({server: server._id, channelId: channelId});

    if (!data)
        return res.status(200).json({status: 404, message: "The data can't be found!", data: []});
    else
        return res.status(200).json({status: 200, message: "Found data!", data: data});
});

router.post("/findVoteByMessage", verify, async (req, res) => {
    const id = req.body.serverId;
    const channelId = req.body.channelId;
    const messageId = req.body.messageId;
    let server;

    if (id) {
        server = await DiscServer.findOne({_id: id});
    }
    let data;
    if (!id || !channelId || !messageId) {
        return res.status(200).json({status: 404, message: "The data can't be found! The id is empty", data: []});
    }
    data = await Vote.findOne({server: server._id, channelId: channelId, messageId: messageId});

    if (!data)
        return res.status(200).json({status: 404, message: "The data can't be found!", data: []});
    else
        return res.status(200).json({status: 200, message: "Found data!", data: data});
});

router.post("/findAutoChannelByIds", verify, async (req, res) => {
    const id = req.body.serverId;
    const channelId = req.body.channelId;
    let server;
    if (id) {
        server = await DiscServer.findOne({guildId: id});
    }
    let data;
    if (server || channelId) {
        data = await AutoChannel.findOne({server: server._id, channelId: channelId});
    }

    if (!data)
        return res.status(200).json({status: 404, message: "The data can't be found!", data: []});
    else
        return res.status(200).json({status: 200, message: "Found data!", data: data});
});

router.post("/findAutoChannelsByGuildId", verify, async (req, res) => {
    const id = req.body.serverId;
    let server;
    if (id) {
        server = await DiscServer.findOne({guildId: id});
    }
    let data;
    if (server) {
        data = await AutoChannel.find({server: server._id});
    }

    if (!data)
        return res.status(200).json({status: 404, message: "The data can't be found!", data: []});
    else
        return res.status(200).json({status: 200, message: "Found data!", data: data});
});

router.post("/findServerById", verify, async (req, res) => {
    const id = req.body.id;
    let data;
    if (id) {
        data = await DiscServer.findOne({guildId: id});
    }

    if (!data)
        return res.status(200).json({status: 404, message: "The data can't be found!", data: []});
    else
        return res.status(200).json({status: 200, message: "Found data!", data: data});
});

router.post("/findUserById", verify, async (req, res) => {
    const id = req.body.id;
    let data;
    if (id) {
        data = await User.findOne({userID: id});
    }

    if (!data)
        return res.status(200).json({status: 404, message: "The data can't be found!", data: []});
    else
        return res.status(200).json({status: 200, message: "Found data!", data: data});
});

router.post("/findTwitchUserConByUser", verify, async (req, res) => {
    const user = await getUser(req.body);
    if (!user) return res.status(200).json({status: 400, message: "User not found!", data: []});
    const tw = await TwitchUserCon.findOne({user: user._id});
    if (!tw) return res.status(200).json({status: 400, message: "Con not found!", data: []});
    var tww = tw.toJSON();

    res.status(200).json({status: 200, message: "Found data!", data: tww});
});

async function getUser(body) {
    const s = body.user;
    const si = body.userid;
    var user;

    if (s) user = await getUserFromDID(s);
    if (si) user = await User.findById(si);

    return user;
}

async function getUserFromDID(did) {
    return await User.findOne({userID: did});
}

module.exports = router;