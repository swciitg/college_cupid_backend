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
        ...user.personalityType.split()
    );

    return scoreFactors
}


exports.shuffleProfiles = (userProfiles) => {
  for (let i = userProfiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [userProfiles[i], userProfiles[j]] = [userProfiles[j], userProfiles[i]];
  }
}


exports.paginateCombined = (
    moreArr,
    lessArr,
    start,
    size
) => {
    const result = [];

    let m = start;
    let l = start;

    const allowMoreCycle = Math.random() < 0.5;

    while (result.length < size && (moreArr.length || lessArr.length)) {

        const takeMore = result.length % 2 === 0;

        if (takeMore) {

            if (m < moreArr.length) {
                result.push(moreArr[m++]);
            } 
            else if (allowMoreCycle && moreArr.length > 0) {
                result.push(moreArr[m % moreArr.length]);
                m++;
            } 
            else if (l < lessArr.length) {
                result.push(lessArr[l++]);
            } 
            else {
                break;
            }

        } else {

            if (l < lessArr.length) {
                result.push(lessArr[l++]);
            } 
            else if (m < moreArr.length) {
                result.push(moreArr[m++]);
            } 
            else if (allowMoreCycle && moreArr.length > 0) {
                result.push(moreArr[m % moreArr.length]);
                m++;
            }
            else {
                break;
            }
        }
    }

    return result;
};
