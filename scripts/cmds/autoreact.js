const fs = require("fs");
const path = require("path");
const stateFile = path.join(__dirname, "autoreact_state.json");

if (!fs.existsSync(stateFile)) {
  fs.writeFileSync(stateFile, JSON.stringify({ enabled: false }, null, 2));
}

module.exports = {
  config: {
    name: "autoreact",
    version: "10.0-Ultimate",
    author: "Helal",
    role: 0,
    shortDescription: "React all messages (Bangla + English bad word & emotion detector)",
    category: "fun",
  },

  onStart: async function ({ api, event, args }) {
    const state = JSON.parse(fs.readFileSync(stateFile));
    let ownerID = [];
    try {
      const config = require("../../config.json");
      ownerID = config.adminBot || [];
    } catch {}

    if (!ownerID.includes(event.senderID)) {
      const msg = await api.sendMessage("⛔ Only bot owner can toggle AutoReact!", event.threadID, event.messageID);
      return setTimeout(() => api.unsendMessage(msg.messageID), 8000);
    }

    if (args[0]?.toLowerCase() === "on") {
      state.enabled = true;
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
      const msg = await api.sendMessage("✅ AutoReact ON (সব মেসেজে রিঅ্যাক্ট দিবে)", event.threadID, event.messageID);
      return setTimeout(() => api.unsendMessage(msg.messageID), 8000);
    } else if (args[0]?.toLowerCase() === "off") {
      state.enabled = false;
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
      const msg = await api.sendMessage("🚫 AutoReact OFF", event.threadID, event.messageID);
      return setTimeout(() => api.unsendMessage(msg.messageID), 8000);
    } else {
      const msg = await api.sendMessage("⚙️ Usage:\n/autoreact on\n/autoreact off", event.threadID, event.messageID);
      return setTimeout(() => api.unsendMessage(msg.messageID), 8000);
    }
  },

  onChat: async function ({ api, event }) {
    const state = JSON.parse(fs.readFileSync(stateFile));
    if (!state.enabled || !event.body) return;

    const text = event.body.toLowerCase();

    // Emotion based emoji list
    const emotion = {
      sad: ["😢","😭","😔","☹️","😞","😿","🥺","😩","😣"],
      happy: ["😂","🤣","😆","😁","😄","😊","😹","😅","😇"],
      love: ["❤️","💞","💕","💖","😍","😘","💋","💘","🩷"],
      angry: ["😡","🤬","👿","💢","😠","😤","😾"],
      random: [
        "😎","🤩","🫶","👏","👍","🙃","🤭","🤗","🫡","😴","😌","🤠","😏","🥸","🤑",
        "🤓","🤔","🫣","😶‍🌫️","😬","🙄","🤡","💀","👻","💩","🤖","🔥","💫","⭐",
        "🌈","💥","🎉","🥂","💯","💎","🧡","💙","💚","🖤","💛","💌","⚡","🌟","🪄"
      ]
    };

    // 🧠 Huge Badword List (Bangla + English + Mix)
    const badWords = [
      // English
      "fuck","fuk","fck","f@ck","fuc","motherfucker","shit","bullshit","bitch","slut","whore","dick","cock",
      "pussy","cum","asshole","ass","fag","bastard","porn","sex","nude","boobs","jerk","retard","suck","lick",
      // Banglish / translit
      "chod","choda","chodar","chodbo","chudir","chud","bal","boll","bosd","bosedi","gaand","gandu","chut",
      "madarchod","randi","magi","haramzada","lawda","lund","loda","mara","bokachoda","bonchod","fokinni",
      "shala","chu","chuse","bosdom","harami","randipona","randimoni","randibaz","tor ma","tor bon","tor bou",
      "randir pola","tor bap","tor dada","tor gf","tor girlfriend","tor nanar","tor nani","bokachod","lundamar",
      // বাংলা গালি 🔞
      "চোদ","চোদা","চুদি","চোদবি","চুদি","চুদিস","চুদ","চোদমাগি","চোদন","চোদার","বাল","বলদ","বালের","মাগি",
      "রান্ডি","রান্ডি","বসদি","হারামজাদা","হারামজাদী","চোদমারান","চোদনখোর","চুদবো","চুদে","মাদারচোদ","মাদারচোদা",
      "চুত","চুতি","বসদী","গান্ডু","গান্ড","বসদি মাগি","চোদা খা","বালখা","রান্ডির ছেলে","রান্ডির মেয়ে","বালের ছেলে",
      "চুদে ফেল","চুদে দিলাম","চুদ","চুদি","চুদলি","চুদছিস","মাগির পোলা","রান্ডির পোলা","চোদনখোর","ল্যাওড়া",
      "চুদচুদ","চুদছ","চোদমাগি","রান্ডিপনা","বালের পোলা","মাদারচোদ","চুদব","বালছাল","গান্ডমারা","চোদা খাস","গালাগালি"
    ];

    let reaction;

    // Emotion detection
    if (text.match(/(😭|😢|😿|☹️|😔|😞|🥺)/)) {
      reaction = emotion.sad[Math.floor(Math.random() * emotion.sad.length)];
    } else if (text.match(/(😂|😆|🤣|😁|😄|😊|😹)/)) {
      reaction = emotion.happy[Math.floor(Math.random() * emotion.happy.length)];
    } else if (text.match(/(❤️|💖|💞|💕|😍|😘|💘)/)) {
      reaction = emotion.love[Math.floor(Math.random() * emotion.love.length)];
    } else if (badWords.some(w => text.includes(w))) {
      reaction = emotion.angry[Math.floor(Math.random() * emotion.angry.length)];
    } else {
      reaction = emotion.random[Math.floor(Math.random() * emotion.random.length)];
    }

    try {
      api.setMessageReaction(reaction, event.messageID, () => {}, true);
    } catch (err) {
      console.error("AutoReact Error:", err);
    }
  },
};
