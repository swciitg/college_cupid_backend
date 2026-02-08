const POOL = "pool";

let boys = [];
let girls = [];
const rooms = {};

const CHAT_TIME = 1 * 60 * 1000 + 5000;

const MIN_SCORE = 0;

const MATCH_INTERVAL = 5000

let MATCH_COUNTER = 0;

function incrementMatches() {
  MATCH_COUNTER++;
  console.log("MATCHED " , MATCH_COUNTER);
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

module.exports = {
  boys,
  girls,
  rooms,
  POOL,
  CHAT_TIME,
  MIN_SCORE,
  MATCH_INTERVAL,
  QUESTIONS,
  incrementMatches
};
