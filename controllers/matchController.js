const PersonalInfo = require("../models/PersonalInfo");

exports.findMatches = async (req, res, next) => {
    const sharedSecretMap = new Map();
    const users = await PersonalInfo.find();
    console.log('Total users = ', users.length);

    users.map((user) => {

        user.crushes.map((crush) => {
            if (!sharedSecretMap.has(crush)) {
                sharedSecretMap.set(crush);
                sharedSecretMap[crush] = [];
            }
            sharedSecretMap[crush].push(user.email);
        });
    })
    const totalPairs = Object.keys(sharedSecretMap).length;
    for (var i = 0; i < totalPairs; i++) {
        const key = Object.keys(sharedSecretMap)[i];
        if (sharedSecretMap[key].length > 1) {
            console.log(sharedSecretMap[key]);
            await PersonalInfo.findOneAndUpdate(
                {email: sharedSecretMap[key][0]}, 
                {$push: {matches: sharedSecretMap[key][1]}}
            );
            await PersonalInfo.findOneAndUpdate(
                {email: sharedSecretMap[key][1]}, 
                {$push: {matches: sharedSecretMap[key][0]}}
            );
        }
        console.log('Processed ', i + 1, ' of ', totalPairs, ' pairs.');
    }
    res.send({ message: 'Found all matches' });
};

exports.clearMatches = async (req, res, next) => {
    const users = await PersonalInfo.find();
    for(var i = 0; i < users.length; i++){
        const user = users[i];
        await PersonalInfo.findOneAndUpdate({email: user.email}, {matches: []});
        console.log('Matches cleared: ', i + 1, ' of ', users.length);
    }

    res.send({message: 'Cleared all matches'});
};

exports.getMatches = async (req, res, next) => {
    const user = await PersonalInfo.findOne({ email: req.email });
    res.send({ matches: user.matches });
};