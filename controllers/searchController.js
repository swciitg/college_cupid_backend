const PersonalInfo = require("../models/PersonalInfo");

exports.filterUsers = async(req, res) => {
    try{
        const users = await PersonalInfo.find(req.query);
        res.send({filteredUsers: users});
    }catch(err){
        res.send(err.message);
    }
};