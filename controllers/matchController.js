const PersonalInfo = require("../models/PersonalInfo");
const Reply = require("../models/Reply");

exports.findMatches = async (req, res, next) => {
    const oldUsers = await PersonalInfo.find();
    for(var i = 0; i < oldUsers.length; i++){
        const user = oldUsers[i];
        await PersonalInfo.findOneAndUpdate({email: user.email}, {matchedEmailList: []});
        console.log('Matches cleared: ', i + 1, ' of ', oldUsers.length);
    }

    console.log("Clear all old matches!");

    const sharedSecretMap = new Map();
    const users = await PersonalInfo.find();

    users.map((user) => {
        user.sharedSecretList.map((crush) => {
            if (!sharedSecretMap.has(crush)) {
                sharedSecretMap.set(crush);
                sharedSecretMap[crush] = [];
            }
            sharedSecretMap[crush].push(user.email);
        });
    });

    const totalPairs = Object.keys(sharedSecretMap).length;
    var totalMatches = 0;
    var allMatchedPairs = [];
    
    for (var i = 0; i < totalPairs; i++) {
        const key = Object.keys(sharedSecretMap)[i];

        if (sharedSecretMap[key].length > 1) {
            totalMatches++;
            allMatchedPairs.push({
                user1: sharedSecretMap[key][0],
                user2: sharedSecretMap[key][1]
            });

            await PersonalInfo.findOneAndUpdate(
                {email: sharedSecretMap[key][0]}, 
                {$push: {matchedEmailList: sharedSecretMap[key][1]}},
                {runValidators: true}
            );
            await PersonalInfo.findOneAndUpdate(
                {email: sharedSecretMap[key][1]}, 
                {$push: {matchedEmailList: sharedSecretMap[key][0]}},
                {runValidators: true}
            );
            await Reply.create({
                receiverEmail : sharedSecretMap[key][0] ,
                senderEmail :  sharedSecretMap[key][1], 
                replyContent : `You have a match` ,
                entityType : "MATCHES" , 
                entitySerial : 0
            })
            await Reply.create({
                receiverEmail : sharedSecretMap[key][1] ,
                senderEmail : sharedSecretMap[key][0] ,
                replyContent : `You have a match` ,
                entityType : "MATCHES" , 
                entitySerial : 0
            });
        }
        console.log('Processed ', i + 1, ' of ', totalPairs, ' pairs.');
    }
    res.json({
        success: true,
        totalMatches: totalMatches,
        matchedPairs: allMatchedPairs,
        message: 'Found all matches'
    });
};

exports.clearMatches = async (req, res, next) => {
    const users = await PersonalInfo.find();
    for(var i = 0; i < users.length; i++){
        const user = users[i];
        await PersonalInfo.findOneAndUpdate({email: user.email}, {matchedEmailList: []});
        console.log('Matches cleared: ', i + 1, ' of ', users.length);
    }

    res.json({
        success: true,
        message: 'Cleared all matches'
    });
};

exports.getMatches = async (req, res, next) => {
    const user = await PersonalInfo.findOne({ email: req.email });
    res.json({
        success: true,
        matches: user.matchedEmailList,
    });
};