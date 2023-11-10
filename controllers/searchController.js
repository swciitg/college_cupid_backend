const UserProfile = require("../models/UserProfile");

exports.filterUsers = async(req, res, next) => {
    const users = await UserProfile.find(req.query);
    res.json({filteredUsers: users});
};

exports.searchUsers = async(req, res, next) => {
    const users = await UserProfile.find({name: {$regex: req.query.name, $options: 'i'}});
    res.json({users: users});
}