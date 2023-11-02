const PersonalInfo = require("../models/PersonalInfo");

exports.findMatches = async(req, res) => {
    try {
        const mac = new Map();
        const users = await PersonalInfo.find();
        console.log('Total users = ', users.length);
        
        users.map((user)=>{
        
            user.crushes.map((crush)=>{
                if(!mac.has(crush)){
                    mac.set(crush);
                    mac[crush]=[];
                }
                mac[crush].push(user.email);
            });
        })
        const totalPairs = Object.keys(mac).length;
        for(var i = 0; i < totalPairs; i++){
            const key = Object.keys(mac)[i];
            if(mac[key].length>1){
                console.log(mac[key]);
                await PersonalInfo.findOneAndUpdate({email: mac[key][0]},{$push: {matches:mac[key][1]}});
                await PersonalInfo.findOneAndUpdate({email :mac[key][1]},{$push: {matches:mac[key][0]}});
            }
            console.log('Processed ', i+1, ' of ', totalPairs, ' pairs.');
        }

        // Object.keys(mac).map(async(key)=>{
            
        // });
        res.send({message: 'Found all matches'});
    } catch (error) {
        res.send(error);
    }
};

exports.getMatches = async(req, res) => {
    try {
        const user = await PersonalInfo.findOne({email: req.email});
        res.send({matches: user.matches});
    } catch (error) {
        res.send(error);
    }
}