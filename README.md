# Yuki-Sora-Database
# API Requests
## /api/yuki/item
> post, delete, patch 

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
    "message: "",
    "_id": "saved item"
}
```

## /api/yuki/monster
> post, delete, patch

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
    "message: "",
    "_id": "saved item"
}
```

## /api/yuki/job
> post, delete, patch

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
    "message: "",
    "_id": "saved item"
}
```

## /api/yuki/job
> post, delete, patch

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
    "message: "",
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
    "message: "",
    "_id": "saved item"
}
```

## /api/yuki/user
> post, delete, patch

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
    "message: "",
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
    "message: "",
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
    "message: "",
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
    "message: "",
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
