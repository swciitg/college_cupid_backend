const UserProfile = require("../models/UserProfile");

exports.filterUsers = async(req, res, next) => {
    const users = await UserProfile.find(req.query);
    res.json({filteredUsers: users});
};

exports.searchUsers = async(req, res, next) => {
    const users = await UserProfile.find({name: {$regex: req.query.name, $options: 'i'}});
    res.json({users: users});
}

exports.searchUsersPaginated = async(req, res, next) => {
    const users = await UserProfile.find({name: {$regex: req.query.name, $options: 'i'}});

    const newUserProfiles = users.filter(profile => profile.email !== req.email);

    const startIndex = req.query.pageNumber * 10;

    res.json({ users: newUserProfiles.slice(startIndex, startIndex + 10) });
}