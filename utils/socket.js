const { QUESTIONS } = require("../services/socket/constants.js");

function calcScore(boy, girl) {
    let score = 0;
    let timeMultiplier = 0.05 * Math.max(1 , (Date.now() - Math.max(boy.timejoined , girl.timejoined))/10000);

    boy.interests.forEach(interest_b => {
        if(girl.interests.includes(interest_b)) {
            score++;
        }
    });

    score *= (1 + timeMultiplier);
    return score;
}

function randomRoomId() {
  return "room_" + Math.random().toString(36).slice(2, 10);
}


function getQuestions() {
    let sz = QUESTIONS.length;
    let idx = new Set();

    for (let i = 0 ; i < 3 ; i+=1) {
        idx.add(Math.floor(Math.random() * sz));
    }

    let arr = [...idx];
    if(idx.size == 2) {
        if(Math.abs(arr[0] - arr[1]) === 1) {
            arr.push((Math.max(arr[0] , arr[1]) + 1) % sz);
        } else {
            arr.push((Math.min(arr[0] , arr[1]) + 1) % sz);
        }
    } else if (idx.size == 1) {
        arr.push((arr[0] + 1) % sz);
        arr.push((arr[0] + 2) % sz);
    }

    return [QUESTIONS[arr[0]] , QUESTIONS[arr[1]] , QUESTIONS[arr[2]]];
}

module.exports = { calcScore, randomRoomId, getQuestions };