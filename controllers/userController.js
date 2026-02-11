const PersonalInfo = require("../models/PersonalInfo");
const UserProfile = require("../models/UserProfile");
const BlockedUserList = require("../models/BlockedUserList");
const DeactivatedUsers = require("../models/DeactivatedUsers");
const { deactivatedUserProfile, GuestEmails, GuestUserInfo, AdminList } = require("../shared/constants");

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
  let userProfile = await UserProfile.findOne({ email: req.params.email });
  if(!userProfile) {
    return res.json({
      success: false ,
      message : "User not found"
    })
  }

  const user = await DeactivatedUsers.findOne({ email: req.params.email });
  if (user) {
    if (req.params.email === req.email) {
      await DeactivatedUsers.deleteMany({ email: req.params.email });
    } else {
      // Return deactivated profile for other users viewing this profile
      const deactivateUser = {
        ...deactivatedUserProfile,
        _id: userProfile._id,
        email: req.params.email
      };
      return res.json({
        success: true,
        userProfile: deactivateUser,
      });
    }
  }

  const isAdmin = AdminList.includes(userProfile.email) && req.email === userProfile.email;
  userProfile = userProfile.toObject();
  userProfile.isAdmin = isAdmin;

  res.json({
    success: true,
    userProfile: userProfile,
  });
};

exports.deactivateUser = async (req, res, next) => {
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

exports.reactivateUser = async (req, res, next) => {
  const user = await DeactivatedUsers.findOne({ email: req.email });
  if (!user) {
    return res.json({
      success: false,
      message: "User already active!",
    });
  }
  await DeactivatedUsers.deleteMany({ email: req.email });
  res.json({
    success: true,
    user: req.email,
    message: "User activated successfully",
  });
};

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

  const currPersonalInfo = await PersonalInfo.findOne({ email: req.email });
  const mySharedSecrets = currPersonalInfo?.sharedSecretList || [];
  const receivedLikesSecrets = currPersonalInfo?.receivedLikesSecrets || [];

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
    let deactivatedEmails = [];
    deactivatedUsers.forEach((user) => {
      deactivatedEmails.push(user.email);
    });
    userProfiles = userProfiles.filter(
      (profile) => !deactivatedEmails.includes(profile.email)
    );
  }

  userProfiles = userProfiles.filter(
    (profile) => !(
      GuestEmails.includes(profile.email) 
      || (`${profile.email}`).endsWith("@alumni.iitg.ac.in")
    )
  );
   // Get personal info for all users in feed to check for mutual likes
  const userEmails = userProfiles.map(p => p.email);
  const allPersonalInfos = await PersonalInfo.find({ 
    email: { $in: userEmails } 
  });
  
  // Create a map for quick lookup
  const personalInfoMap = {};
  allPersonalInfos.forEach(info => {
    personalInfoMap[info.email] = info;
  });

  // Identify priority users (mutual interest) and already liked users
  const priorityUserProfiles = [];
  const alreadyLikedEmails = new Set();
  
  userProfiles.forEach((profile) => {
    const theirPersonalInfo = personalInfoMap[profile.email];
    if (!theirPersonalInfo) return;
    
    const theirSharedSecrets = theirPersonalInfo.sharedSecretList || [];
    
    // Check if I've already liked them (my secret exists in their receivedLikes)
    const iHaveLikedThem = (theirPersonalInfo.receivedLikesSecrets || [])
      .some(secret => mySharedSecrets.includes(secret));
    
    if (iHaveLikedThem) {
      alreadyLikedEmails.add(profile.email);
    }
    
    // Check if they've liked me (their secret exists in my receivedLikes)
    const theyHaveLikedMe = theirSharedSecrets
      .some(secret => receivedLikesSecrets.includes(secret));
    
    if (theyHaveLikedMe) {
      priorityUserProfiles.push(profile);
    }
  });

  // Filter out users I've already liked
  userProfiles = userProfiles.filter(
    profile => !alreadyLikedEmails.has(profile.email)
  );
  const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

const pickWeightedArray = (groups, weights) => {
  const available = Object.keys(weights).filter(
    (k) => groups[k].length > 0
  );

  if (available.length === 0) return null;

  const totalWeight = available.reduce(
    (sum, k) => sum + weights[k],
    0
  );

  let r = Math.random() * totalWeight;

  for (const k of available) {
    r -= weights[k];
    if (r <= 0) return k;
  }

  return available[available.length - 1];
};

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
}; //for more no of arrays 

userProfiles.forEach((user) => {
  if (!user.personalityType) return;
   if (priorityUserProfiles.some(p => p.email === user.email)) return;
  const diff = computeDifference(user.personalityType.toUpperCase());
  categorizedUsers[diff].push(user);
});
const priorityUsers = [...priorityUserProfiles];
let sincePriority = 0;
let nextPriorityGap = Math.floor(Math.random() * 3) + 3; // 3–5

const orderedUsers = [];
const weights = {
  0: 60,
  1: 25,
  2: 10,
};

const working = {
  0: [...categorizedUsers[0]],
  1: [...categorizedUsers[1]],
  2: [...categorizedUsers[2]],
};
while (
  working[0].length ||
  working[1].length ||
  working[2].length
) {
  if (
    priorityUsers.length > 0 &&
    sincePriority >= nextPriorityGap
  ) {
    orderedUsers.push(priorityUsers.shift());
    sincePriority = 0;
    nextPriorityGap = Math.floor(Math.random() * 3) + 3;
    continue;
  }

  const key = pickWeightedArray(working, weights);
  if (key === null) {
    if (priorityUsers.length > 0) {
      orderedUsers.push(...priorityUsers);
      priorityUsers.length = 0;
    }
    break;
  }

  orderedUsers.push(working[key].shift());
  sincePriority++;
}

if (categorizedUsers[3].length > 0) {
  const arr3 = [...categorizedUsers[3]];
  shuffleArray(arr3);
  orderedUsers.push(...arr3);
}

if (categorizedUsers[4].length > 0) {
  const arr4 = [...categorizedUsers[4]];
  shuffleArray(arr4);
  orderedUsers.push(...arr4);
}

const pageNumber = parseInt(req.params.pageNumber, 10) || 0;
const pageSize = 10;
const startIndex = pageNumber * pageSize;
const endIndex = startIndex + pageSize;
const paginatedUsers = orderedUsers.slice(startIndex, endIndex);

res.json({
  success: true,
  totalCount: orderedUsers.length,
  users: paginatedUsers,
});
};

exports.updateUserProfile = async (req, res, next) => {
  let profileChanges = req.body;
  // if (req.imageUrl) {
  //     profileChanges.profilePicUrl = req.imageUrl;
  // }
  const _user = await UserProfile.findOne({email : req.email});
  profileChanges.gender = _user.gender; // gender resets back to initial one always
  
  const user = await UserProfile.findOneAndUpdate(
    { email: req.email },
    profileChanges,
    {
      new: true,          
      runValidators: true
    }
  );

  // Add isAdmin dynamically (same logic as getUserProfile)
  const isAdmin = AdminList.includes(user.email) && req.email === user.email;
  user = user.toObject();
  user.isAdmin = isAdmin;
  
  res.json({
    success: true,
    message: "Profile updated successfully",
    userProfile: user,
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

exports.uploadVoice = async (req, res) => {
  try {
    if(!req.file) {
      return res.status(400).json({ error: "No audio uploaded" });
    }

    const { question } = req.body;
    const fileUrl = `/uploads/voice/${req.file.filename}`;
    const recording = {
      question: question || "",
      answer: fileUrl,
    };

    await UserProfile.updateOne(
      { email: req.email },
      { $push: { voiceRecordings: recording } },
    );

    return res.json({
      success: true,
      recording,
      message: "Voice uploaded & saved",
    });
  } catch(err) {
    console.error("VOICE UPLOAD ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}

exports.searchUser = async(req, res) => {
  const { searchQuery } = req.query;
  
  let userLists = await UserProfile.find({
    name : {
      $regex : searchQuery , 
      $options : "i"
    }
  }).select("name email profilePicUrls gender age");

  const deactivatedUsers = await DeactivatedUsers.find();
  const deactivatedEmailSet = new Set(
      deactivatedUsers.map(u => u.email)
  );

  userLists = userLists.filter(
    profile => !deactivatedEmailSet.has(profile.email) 
  )

  return res.json({
    success: true , 
    users : userLists
  });
}