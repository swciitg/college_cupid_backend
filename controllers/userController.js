const shuffleArray = require("shuffle-array");
const PersonalInfo = require("../models/PersonalInfo");
const UserProfile = require("../models/UserProfile");
const BlockedUserList = require("../models/BlockedUserList");
const DeactivatedUsers = require("../models/DeactivatedUsers");

function sortByPositions(positions, objects) {
  let max = Math.max(...positions);
  console.log(max);
  let objectMap = [];
  for (let i = 0; i < positions.length; i++) {
    if (objects.length > positions[i]) {
      objectMap.push(objects[positions[i]]);
    }
  }
  if (max + 1 >= objects.length) {
    return objectMap;
  }
  let neww = [...objects.slice(max + 1), ...objectMap];
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
      message: "Removed user from database!",
    });
  } else {
    return res.json({
      success: false,
      userProfileResponse: res1,
      personalInfoResponse: res2,
      message: "User not found in the database!",
    });
  }
};
exports.removeAllUsersFromDB = async (req, res, next) => {
  const deletedUserProfiles = await UserProfile.find({});
  const deletedPersonalInfos = await PersonalInfo.find({});

  const res1 = await UserProfile.deleteMany({});
  const res2 = await PersonalInfo.deleteMany({});

  if (res1.acknowledged && res2.acknowledged) {
    return res.json({
      success: true,
      userProfileResponse: res1,
      personalInfoResponse: res2,
      deletedUserProfiles,
      deletedPersonalInfos,
      message: "Removed all users from database!",
    });
  } else {
    return res.json({
      success: false,
      userProfileResponse: res1,
      personalInfoResponse: res2,
      message: "No users found in the database!",
    });
  }
};
exports.listAllUsers = async (req, res, next) => {
  const userProfiles = await UserProfile.find({});
  const personalInfos = await PersonalInfo.find({});
  res.json({
    success: true,
    userProfiles,
    personalInfos,
  });
};
exports.createUserProfile = async (req, res, next) => {
  var userProfile = req.body;
  userProfile.email = req.email;
  // if (req.imageUrl) {
  //     userProfile.profilePicUrl = req.imageUrl;
  // } else {
  //     delete userProfile.imageUrl
  // }

  const interests = new Set(userProfile.interests);
  userProfile.interests = Array.from(interests);

  const user = await UserProfile.findOne({ email: req.email });
  if (user) {
    const resp = await UserProfile.findOneAndUpdate(
      {
        email: req.email,
      },
      userProfile,
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      newUserProfile: resp,
    });
  }
  const newUserProfile = await UserProfile.create(userProfile);

  return res.json({
    success: true,
    newUserProfile,
  });
};

exports.getUserProfile = async (req, res, next) => {
  const userProfile = await UserProfile.findOne({ email: req.params.email });
  const user = await DeactivatedUsers.findOne({ email: req.params.email });
  if (user) {
    return res.json({
      success: true,
      userProfile: {
        sexualOrientation: {
          type: "STRAIGHT",
          display: false,
        },
        relationshipGoals: {
          goal: "LONGTERMPARTNER",
          display: false,
        },
        name: "Deactivated User",
        gender: "MALE",
        email: req.params.email,
        profilePicUrls: [
          {
            Url: "https://swc.iitg.ac.in/test/collegeCupid/api/v2/getImage?photoId=25388381-a5a2-46cd-982c-a2f5634477bc-compressed",
            blurHash: null,
          },
          {
            Url: "https://swc.iitg.ac.in/test/collegeCupid/api/v2/getImage?photoId=25388381-a5a2-46cd-982c-a2f5634477bc-compressed",
            blurHash: null,
          },
        ],
        program: "BTECH",
        yearOfJoin: 25,
        interests: [],
        bio: " ",
        personalityType: "estj",
      },
    });
  }
  res.json({
    success: true,
    userProfile: userProfile,
  });
};
exports.deleteUserProfile = async (req, res, next) => {
    const user = await DeactivatedUsers.findOne({ email: req.email });
    if (user) {
        return res.json({
            success: true,
            message: "User already deactivated",
        });
    }
    await DeactivatedUsers.create({ email: req.email });
    res.json({
        success: true,
        user: req.email,
        message: "User deactivated successfully",
    });
};


// exports.getUserProfilePages = async (req, res, next) => {
//     const { name, ...filters } = req.query;
//     const newFilters = { name: { $regex: name, $options: 'i' }, ...filters };

//     let userProfiles = (await UserProfile.find(newFilters))
//         .filter(profile => profile.email !== req.email);

//     let currTime = new Date();
//     currTime = currTime.getTime();
//     let currUser = await UserProfile.findOne({email: req.email});

//     if(currUser.shuffleOrder == undefined || currTime - currUser.lastShuffle >= 1800000){
//         let positions = Array(userProfiles.length).fill(0).map((_, i) => i);
//         const shuffledPositions = shuffleArray(positions);
//         await UserProfile.findOneAndUpdate({
//             email: req.email}, {lastShuffle : currTime, shuffleOrder: shuffledPositions},
//             {runValidators: true});

//         userProfiles = sortByPositions(shuffledPositions, userProfiles);
//     }else{
//         userProfiles = sortByPositions(currUser.shuffleOrder, userProfiles);
//     }

//     const user = await BlockedUserList.findOne({ email: req.email });
//     if (user) {
//         userProfiles = userProfiles.filter(
//             profile => user.blockedUsers.includes(profile.email) === false
//         );
//     }

//     const startIndex = req.params.pageNumber * 10;
//     const newUserProfiles = userProfiles.slice(startIndex, startIndex + 10).map((user) => {
//         user.shuffleOrder = undefined;
//         return user;
//     });

//     res.json({
//         success: true,
//         totalCount: newUserProfiles.length,
//         users: newUserProfiles
//     });
// };
exports.getUserProfilePages = async (req, res, next) => {
  const { name, ...filters } = req.query;
  const newFilters = { name: { $regex: name, $options: "i" }, ...filters };

  const currUser = await UserProfile.findOne({ email: req.email });
  if (!currUser || !currUser.personalityType) {
    return res
      .status(400)
      .json({ success: false, message: "User personalityType not found" });
  }
  const currentpersonalityType = currUser.personalityType.toUpperCase();

  let userProfiles = (await UserProfile.find(newFilters)).filter(
    (profile) => profile.email !== req.email
  );

  const blockedUsers = await BlockedUserList.findOne({ email: req.email });
  if (blockedUsers) {
    userProfiles = userProfiles.filter(
      (profile) => !blockedUsers.blockedUsers.includes(profile.email)
    );
  }
  const deactivatedUsers = await DeactivatedUsers.find({});
    if (deactivatedUsers) {
        userProfiles = userProfiles.filter(
            (profile) => !deactivatedUsers.includes(profile.email)
        );
    }
  const computeDifference = (targetpersonalityType) => {
    let diff = 0;
    for (let i = 0; i < 4; i++) {
      if (currentpersonalityType[i] !== targetpersonalityType[i]) diff++;
    }
    return diff;
  };

  const categorizedUsers = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
  };

  userProfiles.forEach((user) => {
    if (!user.personalityType) return;
    const diff = computeDifference(user.personalityType.toUpperCase());
    categorizedUsers[diff].push(user);
  });

  // Shuffle within each category
  // Object.values(categorizedUsers).forEach(group => shuffleArray(group));

  // Create priority ordered list
  const orderedUsers = [
    ...categorizedUsers[0],
    ...categorizedUsers[1],
    ...categorizedUsers[2],
    ...categorizedUsers[3],
    ...categorizedUsers[4],
  ];

  // Pagination
  const pageNumber = parseInt(req.params.pageNumber) || 0;
  const startIndex = pageNumber * 10;
  const endIndex = startIndex + 10;
  const paginatedUsers = orderedUsers.slice(startIndex, endIndex);

  res.json({
    success: true,
    totalCount: paginatedUsers.length,
    users: paginatedUsers,
  });
};

exports.updateUserProfile = async (req, res, next) => {
  const profileChanges = req.body;
  // if (req.imageUrl) {
  //     profileChanges.profilePicUrl = req.imageUrl;
  // }
  await UserProfile.findOneAndUpdate({ email: req.email }, profileChanges, {
    runValidators: true,
  });
  const user = await UserProfile.findOne({ email: req.email });
  res.json({
    success: true,
    message: "Profile updated successfully",
    profilePicUrl: user.profilePicUrl,
  });
};

exports.postPersonalInfo = async (req, res, next) => {
  var info = req.body;
  info.email = req.email;

  const user = await PersonalInfo.findOne({ email: req.email });
  if (user) {
    const resp = await PersonalInfo.findOneAndUpdate(
      { email: req.email },
      info,
      { new: true, runValidators: true }
    );
    return res.json({
      success: true,
      personalInfo: resp,
      message: "Data uploaded successfully",
    });
  }

  const resp2 = await PersonalInfo.create(info);
  res.json({
    success: true,
    personalInfo: resp2,
    message: "Data uploaded successfully",
  });
};

exports.getPersonalInfo = async (req, res, next) => {
  const user = await PersonalInfo.findOne({ email: req.email });
  res.json({
    success: true,
    personalInfo: user,
  });
};
