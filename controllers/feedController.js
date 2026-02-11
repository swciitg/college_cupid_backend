const BlockedUserList = require("../models/BlockedUserList.js");
const DeactivatedUsers = require("../models/DeactivatedUsers.js");
// const PersonalInfo = require("../models/PersonalInfo.js");
const UserProfile = require("../models/UserProfile.js");
const { GuestEmails } = require("../shared/constants.js");
const { calculateMatchingScore, cumulateMatchingFactors, shuffleProfiles, paginateCombined } = require("../utils/feedAlgorithm.js");

async function cleanUserProfiles(userProfiles , email) {
    const blockedUsers = await BlockedUserList.findOne({ 
        email
    });

    const deactivatedUsers = await DeactivatedUsers.find();
    const deactivatedEmailSet = new Set(
        deactivatedUsers.map(u => u.email)
    );
    
    const guestEmailSet = new Set(GuestEmails);

    // here we removed the profiles which the user has already liked previously
    // const currUserInfo = await PersonalInfo.findOne({ email });

    // if(currUserInfo.sharedSecretList.length === 0) {
    //     return userProfiles;
    // }

    // const likedInfos = await PersonalInfo.find(
    //     {
    //         receivedLikesSecrets: { // this won't work as receivedLikedSecrets will not be used now
    //             $in: currUserInfo.sharedSecretList
    //         }
    //     }
    // );

    // const alreadyLikedEmails = new Set(likedInfos.map(i => i.email));

    userProfiles = userProfiles.filter(
        profile => !blockedUsers?.blockedUsers.includes(profile.email) && 
                   !deactivatedEmailSet.has(profile.email) && 
                   !guestEmailSet.has(profile.email) &&
                   !profile.email.endsWith("@alumni.iitg.ac.in")
                //    !alreadyLikedEmails.has(profile.email)
    );

    return userProfiles;
}



exports.getFeed = async(req, res) => {
    const {name , ...filters} = req.query;
    const newFilters = { name: { $regex: name, $options: "i" }, ...filters };

    const currUser = await UserProfile.findOne({ 
        email: req.email 
    });

    if (!currUser 
        ||  !currUser.personalityType
    ) {
        return res     
        .json({ 
            success: false, 
            message: "User personalityType not found" 
        });
    }

    const currUserScoreFactors = cumulateMatchingFactors(currUser);

    let userProfiles = await UserProfile.find({
        ...newFilters , 
        email : {
            $ne : req.email
        } 
    });

    userProfiles = await cleanUserProfiles(
        userProfiles,
        req.email
    );

    const morePreferredGenderUser = [];
    const lessPreferredGenderUser = [];

    userProfiles.forEach(otherUser => {
        const otherUserScoreFactors = cumulateMatchingFactors(otherUser);
        const scoredProfile =  {
            score : calculateMatchingScore(currUserScoreFactors , otherUserScoreFactors) , 
            ...(otherUser.toObject())
        };

        if(
            (
                currUser.gender !== otherUser.gender 
                && currUser.gender.toLowerCase() !== "non-binary"
            ) || ( 
                currUser.gender.toLowerCase() === "non-binary"
                && otherUser.gender.toLowerCase() === currUser.gender.toLowerCase()
            )
        ) {
            morePreferredGenderUser.push(scoredProfile);
        } else {
            lessPreferredGenderUser.push(scoredProfile);
        }
    });

    shuffleProfiles(morePreferredGenderUser);
    shuffleProfiles(lessPreferredGenderUser);

    const pageNumber = parseInt(req.params.pageNumber, 10) || 0;
    const pageSize = 10;
    const startIndex = pageNumber * pageSize;

    const paginatedUsers = paginateCombined(
        morePreferredGenderUser , 
        lessPreferredGenderUser ,
        startIndex ,
        pageSize
    );

    shuffleProfiles(paginatedUsers);

    return res.json({
        success : true,
        users : paginatedUsers
    });
}



/** 
exports.getFeed = async (req, res) => {
    const { name, ...filters } = req.query;
    const newFilters = { name: { $regex: name, $options: "i" }, ...filters };

    // let { lastFetchTimestamps } = req.params;
    // if(!lastFetchTimestamps) {
    //     return res.json({
    //         success : true ,
    //         message : "Timestamps of last fetch not found"
    //     })
    // }

    // lastFetchTimestamps = new Date(lastFetchTimestamps);

    const currUser = await UserProfile.findOne({ 
        email: req.email 
    });

    if (!currUser 
        // ||  !currUser.personalityType
    ) {
        return res     
        .json({ 
            success: false, 
            message: "User personalityType not found" 
        });
    }
    
    const currUserScoreFactors = cumulateMatchingFactors(currUser);

    let userProfiles = await UserProfile.find({
        ...newFilters , 
        email : {
            $ne : req.email
        } 
    });

    userProfiles = await cleanUserProfiles(
        userProfiles,
        req.email
    );

    const existingUsersProfilesWithScore = [];
    const newUsersProfilesWithScore = [];

    userProfiles.forEach(otherUser => {
        const otherUserScoreFactors = cumulateMatchingFactors(otherUser);
        const scoredProfile =  {
            email : otherUser.email ,
            score : calculateMatchingScore(currUserScoreFactors , otherUserScoreFactors) , 
            user : otherUser
        };

        // if(otherUser.createdAt < lastFetchTimestamps) {
            existingUsersProfilesWithScore.push(scoredProfile);
        // } else {
        //     newUsersProfilesWithScore.push(scoredProfile);
        // }
    });

    
    existingUsersProfilesWithScore.sort((a, b) => b.score - a.score);
    newUsersProfilesWithScore.sort((a, b) => b.score - a.score);

    const pageNumber = parseInt(req.params.pageNumber, 10) || 0;
    const pageSize = 10;
    const startIndex = pageNumber * pageSize;
    const endIndex = startIndex + pageSize;

    let paginatedUsers = existingUsersProfilesWithScore.slice(startIndex, endIndex);

    if(existingUsersProfilesWithScore.length + newUsersProfilesWithScore.length <= startIndex) {
        paginatedUsers = existingUsersProfilesWithScore.slice(0,10);
    }

    paginatedUsers.push(...newUsersProfilesWithScore);
    paginatedUsers.sort((a,b) => b.score - a.score).slice(0, 10);

    shuffleProfiles(paginatedUsers);

    return res.json({
        success : true ,
        users : paginatedUsers
    })
}
*/


