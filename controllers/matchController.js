const PersonalInfo = require("../models/PersonalInfo");

exports.findMatches = async(req, res) => {
    try {
        const mac = new Map();
        const users = await PersonalInfo.find();
        
        users.map((user)=>{
        
            user.crushes.map((crush)=>{
                if(!mac.has(crush)){
                    mac.set(crush);
                    mac[crush]=[];
                }
                mac[crush].push(user._id);
            });
        })

        Object.keys(mac).map(async(key)=>{
            if(mac[key].length>1){
                console.log(mac[key]);
                await PersonalInfo.findOneAndUpdate({_id:mac[key][0]},{$push:{matches:mac[key][1]}});
                await PersonalInfo.findOneAndUpdate({_id:mac[key][1]},{$push:{matches:mac[key][0]}});
            }
        });
        res.send({message: 'Found all matches'});
    } catch (error) {
        res.send(error);
    }
};

exports.getMatches = async(req, res) => {
    if(req.body == null)return res.send("invalid user");

    try {
        const user = await PersonalInfo.findOne({email: req.email});
        const matches=[];
        var i=0
        for (const match of user.matches) {
            i++;
            const user1 = await PersonalInfo.findOne({ _id: match });
            matches.push(user1);
        }
        res.send(matches);
    } catch (error) {
        res.send(error);
    }
}