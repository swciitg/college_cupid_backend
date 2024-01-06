const shuffleArray = require('shuffle-array');
const PersonalInfo = require('../models/PersonalInfo');
const UserProfile = require('../models/UserProfile');

exports.clearUsers = async (req, res, next) => {
    await PersonalInfo.deleteMany({});
    await UserProfile.deleteMany({});
    res.json({message: 'success'});    
};

exports.createUserProfile = async (req, res, next) => {
    var userProfile = req.body;
    userProfile.profilePicUrl = req.imageUrl;
    console.log(userProfile);

    const newUserProfile = await UserProfile.create(userProfile);

    res.json(newUserProfile);
};

exports.getUserProfile = async (req, res, next) => {
    const userProfile = await UserProfile.findOne({ email: req.params.email });
    res.json({userProfile: userProfile});
};

exports.getUserProfilePages = async (req, res, next) => {
    const {name, ...filters} = req.query;
    const newFilters = {name: {$regex: name, $options: 'i'}, ...filters};
    console.log(newFilters);
    const userProfiles = (await UserProfile.find(newFilters))
        .reverse().filter(profile => profile.email !== req.email);

    const shuffledUserProfiles = shuffleArray(userProfiles);

    const startIndex = req.params.pageNumber * 10;
    const newUserProfiles = shuffledUserProfiles.slice(startIndex, startIndex + 10);

    res.json({ totalCount: newUserProfiles.length, users: newUserProfiles });
};

exports.updateUserProfile = async (req, res, next) => {
    const profileChanges = req.body;
    if (req.imageUrl) {
        profileChanges.profilePicUrl = req.imageUrl;
    }
    await UserProfile.findOneAndUpdate({ email: req.email }, profileChanges);
    const user = await UserProfile.findOne({ email: req.email });
    res.json({ message: "Profile updated successfully", profilePicUrl:  user.profilePicUrl});
};

exports.postPersonalInfo = async (req, res, next) => {
    const myInfo = new PersonalInfo(req.body);
    await myInfo.save();
    res.json({ message: 'Data uploaded successfully' });
};

exports.getPersonalInfo = async (req, res, next) => {
    const user = await PersonalInfo.findOne({ email: req.email });
    res.json({ personalInfo: user });
};