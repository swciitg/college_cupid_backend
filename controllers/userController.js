const shuffleArray = require('shuffle-array');
const PersonalInfo = require('../models/PersonalInfo');
const UserProfile = require('../models/UserProfile');
const BlockedUserList = require('../models/BlockedUserList');

function sortByPositions(positions, objects) {
    let max = Math.max(...positions);
    console.log(max)
    let objectMap = [];
  for (let i = 0; i < positions.length; i++) {
    if(objects.length > positions[i]){
        objectMap.push(objects[positions[i]]);
    }
  }
  if(max+1 >= objects.length){
      return objectMap;
  }
  let neww = [...objects.slice(max+1), ...objectMap];
  return neww;
}

exports.removeUserFromDB = async (req, res, next) => {
    const res1 = await UserProfile.deleteOne({ email: req.params.email });
    const res2 = await PersonalInfo.deleteOne({ email: req.params.email });

    if (res1.acknowledged && res2.acknowledged) {
        return res.json({
            success: true,
            userProfileResponse: res1,
            personalInfoResponse: res2,
            message: 'Removed user from database!'
        });
    } else {
        return res.json({
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
    if (req.imageUrl) {
        userProfile.profilePicUrl = req.imageUrl;
    } else {
        delete userProfile.imageUrl
    }

    const interests = new Set(userProfile.interests);
    userProfile.interests = Array.from(interests);

    const user = await UserProfile.findOne({ email: req.email });
    if (user) {
        const resp = await UserProfile.findOneAndUpdate({
            email: req.email
        }, userProfile, { new: true, runValidators: true });

        return res.json({
            success: true,
            newUserProfile: resp
        });
    }
    const newUserProfile = await UserProfile.create(userProfile);

    return res.json({
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
    const { name, ...filters } = req.query;
    const newFilters = { name: { $regex: name, $options: 'i' }, ...filters };

    let userProfiles = (await UserProfile.find(newFilters))
        .filter(profile => profile.email !== req.email);

    let currTime = new Date();
    currTime = currTime.getTime();
    let currUser = await UserProfile.findOne({email: req.email});

    if(currUser.shuffleOrder == undefined || currTime - currUser.lastShuffle >= 1800000){
        let positions = Array(userProfiles.length).fill(0).map((_, i) => i);
        const shuffledPositions = shuffleArray(positions);
        await UserProfile.findOneAndUpdate({
            email: req.email}, {lastShuffle : currTime, shuffleOrder: shuffledPositions}, 
            {runValidators: true});

        userProfiles = sortByPositions(shuffledPositions, userProfiles);
    }else{
        userProfiles = sortByPositions(currUser.shuffleOrder, userProfiles);
    }

    const user = await BlockedUserList.findOne({ email: req.email });
    if (user) {
        userProfiles = userProfiles.filter(
            profile => user.blockedUsers.includes(profile.email) === false
        );
    }

    const startIndex = req.params.pageNumber * 10;
    const newUserProfiles = userProfiles.slice(startIndex, startIndex + 10);

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
    await UserProfile.findOneAndUpdate({ email: req.email }, profileChanges, { runValidators: true });
    const user = await UserProfile.findOne({ email: req.email });
    res.json({
        success: true,
        message: "Profile updated successfully",
        profilePicUrl: user.profilePicUrl
    });
};

exports.postPersonalInfo = async (req, res, next) => {
    var info = req.body;
    info.email = req.email;

    const user = await PersonalInfo.findOne({ email: req.email });
    if (user) {
        const resp = await PersonalInfo.findOneAndUpdate({ email: req.email }, info,
            { new: true, runValidators: true });
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