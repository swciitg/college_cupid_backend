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
        currUser.sexualOrientation , 
        currUser.hometown , 
        currUser.relationshipGoals ,
        ...currUser.personalityType.split()
    );

    return scoreFactors
}


exports.categorizeProfiles = (user) => {
    
}
