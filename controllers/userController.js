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

exports.getAllUserProfiles = async (req, res, next) => {
    const userProfiles = await UserProfile.find();
    console.log(userProfiles);

    res.json({ users: userProfiles });
};

exports.getUserProfilesPages = async (req, res, next) => {
    const userProfiles = (await UserProfile.find(req.query)).reverse();
    const newUserProfiles = userProfiles.filter(profile => profile.email !== req.email);

    const startIndex = req.params.pageNumber * 10;

    res.json({ totalCount: userProfiles.length - 1, users: newUserProfiles.slice(startIndex, startIndex + 10) });
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