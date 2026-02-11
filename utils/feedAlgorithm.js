exports.calculateMatchingScore = (curr_user_factors , other_user_factors) => {
    let score = 0;
    curr_user_factors.forEach(factor => {
        score += other_user_factors.includes(factor);
    });

    return score;
}


exports.cumulateMatchingFactors = (user) => {
    let scoreFactors = user.interests;
    scoreFactors.push(
        user.sexualOrientation , 
        user.hometown , 
        user.relationshipGoals ,
        // ...user.personalityType.split()
    );

    return scoreFactors
}


exports.shuffleProfiles = (userProfiles) => {
  for (let i = userProfiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [userProfiles[i], userProfiles[j]] = [userProfiles[j], userProfiles[i]];
  }
}


function getRandomConsecutiveSlice(arr, count) {
  if (count <= 0 || arr.length === 0) return [];

  if (arr.length <= count) return [...arr];

  const maxStart = arr.length - count;
  const start = Math.floor(Math.random() * (maxStart + 1));
  return arr.slice(start, start + count);
}


exports.pickUsers = (morePreferredGenderUser, lessPreferredGenderUser) => {
    const totalNeeded = 10;

    let moreCount = Math.floor(Math.random() * (totalNeeded + 1));
    let lessCount = totalNeeded - moreCount;

    if (morePreferredGenderUser.length < moreCount) {
        const deficit = moreCount - morePreferredGenderUser.length;
        moreCount = morePreferredGenderUser.length;
        lessCount = Math.min(
            lessPreferredGenderUser.length,
            lessCount + deficit
        );
    }

    if (lessPreferredGenderUser.length < lessCount) {
        const deficit = lessCount - lessPreferredGenderUser.length;
        lessCount = lessPreferredGenderUser.length;
        moreCount = Math.min(
            morePreferredGenderUser.length,
            moreCount + deficit
        );
    }

    const pickedMore = getRandomConsecutiveSlice(
            morePreferredGenderUser,
            moreCount
    );

    const pickedLess = getRandomConsecutiveSlice(
            lessPreferredGenderUser,
            lessCount
    );

    return [...pickedMore, ...pickedLess];
}
