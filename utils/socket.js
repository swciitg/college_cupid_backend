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


const QUESTIONS = [
  "What’s your go-to way to spend a free evening?",
  "What’s a movie or show you can rewatch anytime?",
  "Are you more of a morning person or a night owl?",
  "What’s the best food you’ve ever had?",
  "What’s something small that instantly makes your day better?",
  "Do you prefer beaches, mountains, or city trips?",
  "What’s a skill you’d love to learn?",
  "What’s your idea of a perfect weekend?",
  "What’s a song you currently have on repeat?",
  "What’s the most spontaneous thing you’ve done?",
  "Coffee or tea — and how do you take it?",
  "What’s one hobby you’ve always wanted to try but haven’t yet?",
  "What’s a fun fact most people don’t know about you?",
  "What kind of plans excite you more: planned or last-minute?",
  "What’s your comfort food?",
  "What’s a hobby you picked up recently?",
  "What’s the best trip you’ve ever been on?",
  "What’s your favorite way to unwind after a long day?",
  "What’s a book that left an impression on you?",
  "What’s your favorite time of the year and why?",
  "If you could live anywhere for a year, where would it be?",
  "What’s something you’re really passionate about?",
  "What’s a random thing that always makes you laugh?",
  "What’s your favorite way to stay active?",
  "What’s one thing on your bucket list?",
  "Do you enjoy cooking or ordering in more?",
  "What’s a habit you’re trying to build right now?",
  "What’s a childhood memory that still makes you smile?",
  "What’s your favorite kind of date — simple or fancy?",
  "What’s something you can talk about for hours?"
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