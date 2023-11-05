const PersonalInfo = require("../models/PersonalInfo");

exports.filterUsers = async(req, res, next) => {
    const users = await PersonalInfo.find(req.query);
    res.json({filteredUsers: users});
};