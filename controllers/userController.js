const shuffleArray = require('shuffle-array');
const PersonalInfo = require('../models/PersonalInfo');
const UserProfile = require('../models/UserProfile');
const BlockedUserList = require('../models/BlockedUserList');

exports.removeUserFromDB = async(req, res, next) => {
    const res1 = await UserProfile.deleteOne({email: req.params.email});
    const res2 = await PersonalInfo.deleteOne({email: req.params.email});

    if(res1.acknowledged && res2.acknowledged){
        res.json({
            success: true,
            userProfileResponse: res1,
            personalInfoResponse: res2,
            message: 'Removed user from database!'
        });
    }else{
        res.json({
            success: false,
            userProfileResponse: res1,
            personalInfoResponse: res2,
            message: 'User not found in the database!'
        });
    }
};

exports.createUserProfile = async (req, res, next) => {
    var userProfile = req.body;
    userProfile.email = req.email;
    if(req.imageUrl){
        userProfile.profilePicUrl = req.imageUrl;
    }else{
        delete userProfile.imageUrl
    }

    const interests = new Set(userProfile.interests);
    userProfile.interests = Array.from(interests);

    const user = await UserProfile.findOne({email: req.email});
    if(user){
        const resp = await UserProfile.findOneAndUpdate({
            email: req.email}, userProfile, {new: true, runValidators: true});

        return res.json({
            success: true,
            newUserProfile: resp
        });
    }
    const newUserProfile = await UserProfile.create(userProfile);

    res.json({
        success: true,
        newUserProfile
    });
};

exports.getUserProfile = async (req, res, next) => {
    const userProfile = await UserProfile.findOne({ email: req.params.email });
    res.json({
        success: true,
        userProfile: userProfile
    });
};

exports.getUserProfilePages = async (req, res, next) => {
    const {name, ...filters} = req.query;
    const newFilters = {name: {$regex: name, $options: 'i'}, ...filters};
    
    let userProfiles = (await UserProfile.find(newFilters))
        .reverse().filter(profile => profile.email !== req.email);

    const user = await BlockedUserList.findOne({email: req.email});
    if(user){
        userProfiles = userProfiles.filter(
            profile => user.blockedUsers.includes(profile.email) === false
        );
    }

    const shuffledUserProfiles = shuffleArray(userProfiles);

    const startIndex = req.params.pageNumber * 10;
    const newUserProfiles = shuffledUserProfiles.slice(startIndex, startIndex + 10);

    res.json({
        success: true,
        totalCount: newUserProfiles.length, 
        users: newUserProfiles
    });
};

exports.updateUserProfile = async (req, res, next) => {
    const profileChanges = req.body;
    if (req.imageUrl) {
        profileChanges.profilePicUrl = req.imageUrl;
    }
    await UserProfile.findOneAndUpdate({ email: req.email }, profileChanges, {runValidators: true});
    const user = await UserProfile.findOne({ email: req.email });
    res.json({
        success: true,
        message: "Profile updated successfully", 
        profilePicUrl:  user.profilePicUrl
    });
};

exports.postPersonalInfo = async (req, res, next) => {
    var info = req.body;
    info.email = req.email;

    const user = await PersonalInfo.findOne({email: req.email});
    if(user){
        const resp = await PersonalInfo.findOneAndUpdate({email: req.email}, info, 
            {new: true, runValidators: true});
        return res.json({
            success: true,
            personalInfo: resp,
            message: 'Data uploaded successfully'
        });
    }

    const resp2 = await PersonalInfo.create(info);
    res.json({
        success: true,
        personalInfo: resp2,
        message: 'Data uploaded successfully'
    });
};

exports.getPersonalInfo = async (req, res, next) => {
    const user = await PersonalInfo.findOne({ email: req.email });
    res.json({
        success: true,
        personalInfo: user
    });
};