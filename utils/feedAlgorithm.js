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
