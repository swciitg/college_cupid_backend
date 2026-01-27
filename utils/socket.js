function calcScore(boy, girl) {
    let score = 0;
    let timeMultiplier = 0.2 * Math.max(1 , (Math.max(boy.timeJoined , girl.timeJoined) - Date.now())/10000);

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

function createUser(user) {
    return {
        email : user.email ,
        gender : user.gender , 
        timeJoined : null,
        room : null,
        chatStarted : null
    };
}

const QUESTIONS = [
  "What’s your favorite hobby?",
  "What kind of music do you like?",
  "What’s one place you want to travel to?",
  "What’s your favorite hobby?",
  "What kind of music do you like?",
  "What’s one place you want to travel to?"
];

function getQuestions() {
    let sz = QUESTIONS.length;
    let idx = new Set();

    for (let i = 0 ; i < 3 ; i+=1) {
        idx.add(Math.floor(Math.random() * sz));
    }

    let arr = [...idx];
    if(idx.size == 2) {
        if(Math.abs(arr[0] - arr[1]) === 1) {
            arr.push((Math.max(arr[0] , arr[1]) + 2) % sz);
        } else {
            arr.push(Math.min(arr[0] , arr[1]) + 1);
        }
    } else if (idx.size == 1) {
        arr.push((Math.max(arr[0] , arr[1]) + 1) % sz);
        arr.push((Math.max(arr[0] , arr[1]) + 2) % sz);
    }

    return [QUESTIONS[arr[0]] , QUESTIONS[arr[1]] , QUESTIONS[arr[2]]];
}

module.exports = { calcScore, randomRoomId, createUser, getQuestions };