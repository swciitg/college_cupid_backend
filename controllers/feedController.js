const BlockedUserList = require("../models/BlockedUserList.js");
const DeactivatedUsers = require("../models/DeactivatedUsers.js");
const PersonalInfo = require("../models/PersonalInfo.js");
const UserProfile = require("../models/UserProfile.js");
const { GuestEmails } = require("../shared/constants.js");
const { calculateMatchingScore, cumulateMatchingFactors } = require("../utils/feedAlgorithm.js");

async function cleanUserProfiles(userProfiles , email) {
    // here we remove the profiles blocked by the user
    const blockedUsers = await BlockedUserList.findOne({ 
        email
    });
    if(blockedUsers) {
        userProfiles = userProfiles.filter(
            (profile) => !blockedUsers.blockedUsers.includes(profile.email)
        );
    }

    // here we remove the deactivted users
    const deactivatedUsers = await DeactivatedUsers.find();
    const deactivatedEmailSet = new Set(
        deactivatedUsers.map(u => u.email)
    );
    userProfiles = userProfiles.filter(
        profile => !deactivatedEmailSet.has(profile.email)
    );
    
    // here we removed the guests and alums
    const guestEmailSet = new Set(GuestEmails);
    userProfiles = userProfiles.filter(
    profile =>
        !guestEmailSet.has(profile.email) &&
        !profile.email.endsWith("@alumni.iitg.ac.in")
    );

    // here we removed the profiles which the user has already liked previously
    const currUserInfo = await PersonalInfo.findOne({ email });

    if(currUserInfo.sharedSecretList.length === 0) {
        return userProfiles;
    }

    const likedInfos = await PersonalInfo.find(
        {
            receivedLikesSecrets: {
                $in: currUserInfo.sharedSecretList
            }
        }
    );

    const alreadyLikedEmails = new Set(likedInfos.map(i => i.email));

    userProfiles = userProfiles.filter(
        profile => !alreadyLikedEmails.has(profile.email)
    );

    return userProfiles;
}




exports.getFeed = async (req, res) => {
    const { name, ...filters } = req.query;
    const newFilters = { name: { $regex: name, $options: "i" }, ...filters };

    let { lastFetchTimestamps } = req.params;
    if(!lastFetchTimestamps) {
        return res.json({
            success : true ,
            message : "Timestamps of last fetch not found"
        })
    }

    lastFetchTimestamps = new Date(lastFetchTimestamps);

    const currUser = await UserProfile.findOne({ 
        email: req.email 
    });
    if (!currUser || !currUser.personalityType) {
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

        if(otherUser.createdAt < lastFetchTimestamps) {
            existingUsersProfilesWithScore.push(scoredProfile);
        } else {
            newUsersProfilesWithScore.push(scoredProfile);
        }
    });

    
    existingUsersProfilesWithScore.sort((a, b) => b.score - a.score);
    newUsersProfilesWithScore.sort((a, b) => b.score - a.score);

    const pageNumber = parseInt(req.params.pageNumber, 10) || 0;
    const pageSize = 10;
    const startIndex = pageNumber * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedUsers = existingUsersProfilesWithScore.slice(startIndex, endIndex);

    return res.json({
        success : true
    })
}



