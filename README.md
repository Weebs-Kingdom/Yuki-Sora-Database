# Welcome to the Yuki-Sora suit!

Yuki-Sora is a Discordbot with a lot of features. Here you can see all the stuff you need to know about each module.

# Other Yuki Reposetorys

* [Yuki-Sora](https://github.com/Weebs-Kingdom/Yuki-Sora)
* [Homepage](https://github.com/Weebs-Kingdom/weebskingdom.com)
* [Music Slave](https://github.com/Weebs-Kingdom/Yuki-Sora-MusicSlave)
* [Lazy Team](https://github.com/MindCollaps/Lazy-Team)

# Yuki-Sora Wiki

* [Monsters](https://github.com/NeoMC2/Yuki-Sora/wiki/Monsters)
* [Items](https://github.com/NeoMC2/Yuki-Sora/wiki/Item)
* [Dungeon](https://github.com/MindCollaps/Yuki-Sora/wiki/Dungeon)
* [Commands](https://github.com/NeoMC2/Yuki-Sora/wiki/Commands)
* [Gif list](https://github.com/NeoMC2/Yuki-Sora/wiki/Gifs)

***

# Credits

## Main Developer

### [Noah Till (MindCollaps)](https://github.com/mindcollaps)

## Developer support

### Hanna (scnrjse)

Gif list, Language-Support, enhancements

### Dragon

Gif list, Monsters, enhancements

### Nameless

Illustration

### Kaito

Language-Support

### Edward Wolf (Pastelicious)

Monsters

### Karoline Fließ (Grand Goddess)

Monsters

# API Requests

## /api/yuki/item

> post, delete, patch, get

Req. Body

```json
{
    "itemName": "String",
    "itemRarity": "String",
    "itemImageURL": "String",
    "itemDescription": "String",
    "isitemCookable": "Boolean",
    "cooksInto": "mongoose.Schema.Types.ObjectId"
}
```

Res. Body:

```json
{
    "status": 200,
    "message": "",
    "_id": "saved item"
}
```

## /api/yuki/monster

> post, delete, patch, get

Req. Body

```json
{
    "name": "String",
    "imageUrl": "String",
    "baseHP": "Number",
    "maxHp": "Number",
    "evolveLvl": "Number",
    "shown": "Boolean",
    "evolves": ["mongoose.Schema.Types.ObjectId"],
    "attacks": ["mongoose.Schema.Types.ObjectId"]
}
```

Res. Body:

```json
{
    "status": 200,
    "message": "",
    "_id": "saved item"
}
```

## /api/yuki/attack

> post, delete, patch, get

Req. Body

```json
{
    "baseDmg": "Number",
    "attackName": "String",
    "level": "Number",
    "maxUsage": "Number",
    "statuseffect": "String"
}
```

Res. Body:

```json
{
    "status": 200,
    "message": "",
    "_id": "saved item"
}
```

## /api/yuki/job

> post, delete, patch, get

Req. Body

```json
{
    "earningTrainee": "Number",
    "earningCoworker": "Number",
    "earningHeadOfDepartment": "Number",
    "earningManager": "Number",
    "jobName": "String",
    "shortName": "String",
    "doing": "String"
}
```

Res. Body:

```json
{
    "status": 200,
    "message": "",
    "_id": "saved item"
}
```

## /api/yuki/server

> post, delete, patch

Req. Body

```json
{
    "serverName": "String",
    "serverId": "String",
    "serverYtPlaylist": "String",
    "musicListenerId": "String",
    "workChannelId": "String",
    "shopChannelId": "String",
    "certificationMessageId": "String",
    "certificationChannelId": "String",
    "defaultMemberRoleId": "String",
    "defaultTempGamerRoleId": "String",
    "welcomeMessageChannelId": "String",
    "welcomeText": "String",
    "memberCountStatsChannelId": "String",
    "setupDone": "Boolean",
    "setupMode": "Boolean",
    "roleIds": ["String"],
    "autoChannelIds": ["String"]
}
```

Res. Body:

```json
{
    "status": 200,
    "message": "",
    "_id": "saved item"
}
```

## /api/yuki/user

> post, delete, patch, get

Req. Body

```json
{
    "username": "String",
    "userID": "String",
    "ytplaylist": "String",
    "isBotAdmin": "Boolean",
    "certLevel": "String",
    "lang": "String",
    "lastWorkTime": "Date",
    "lastDungeonVisit": "Date",
    "coins": "Number",
    "xp": "Number",
    "level": "Number",
    "maxMonsters": "Number",
    "maxItems": "Number",
    "saidHallo": "Boolean",
    "job": "mongoose.Schema.Types.ObjectId"
}
```

Res. Body:

```json
{
    "status": 200,
    "message": "",
    "_id": "saved item"
}
```

## /api/yuki/userJob

> post, delete, patch

Req. Post Body

```json
{
    "id": "discordUserId",
    "job": "job id",
    "jPos": "trainee/coworker/headofdepartment/manager"
}
```

Req. Delete Body

```json
{
    "id": "discordUserId"
}
```

Res. Body:

```json
{
    "status": 200,
    "message": "",
    "_id": "saved item"
}
```

## /api/yuki/work

> post

Req. Post Body

```json
{
    "id": "discordUserId"
}
```

Res. Body:

```json
{
    "status": 200,
    "message": "",
    "data": "coins"
}
```

## /api/yuki/userItem

> post

Req. Post Body

```json
{
    "item": "item id",
    "amount": "Number",
    "id": "discordUserId"
}
```

Res. Body:

```json
{
    "status": 200,
    "message": "",
    "_id": "storageId"
}
```

## /api/yuki/getUserMonsters

> post

Req. Post Body

```json
{
    "id": "discordUserId"
}
```

Res. Body:

```json
{
    "status": 200,
    "data": ""
}
```

## /api/yuki/getUserInventory

> post

Req. Post Body

```json
{
    "id": "discordUserId"
}
```

Res. Body:

```json
{
    "status": 200,
    "data": ""
}
```

## /api/yuki/getUser

> post

Req. Post Body

```json
{
    "id": "discordUserId"
}
```

Res. Body:

```json
{
    "status": 200,
    "data": ""
}
```

## /api/yuki/fight

> post

Req. Post Body

```json
{
    "id": "discordUserId",
    "monster": "ID",
    "dmg": "Number"
}
```

Res. Body:

```json
{
    "status": 200,
    "data": ""
}
```

## /api/yuki/coins

> post

Req. Post Body

```json
{
    "id": "discordUserId",
    "coins": "Number"
}
```

Res. Body:

```json
{
    "status": 200,
    "data": ""
}
```
