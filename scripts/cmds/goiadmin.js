module.exports = {
  config: {
    name: "goiadmin",
    aliases: ["tagreply"],
    version: "1.0",
    author: "Mr Perfect",
    countDown: 0,
    role: 0, // Everyone can trigger
    shortDescription: "Auto-replies when Shristi Magar is tagged.",
    longDescription: "If Shristi Magar is tagged in a message, the bot will send a random response.",
    category: "Utility",
  },

  onStart: async function () {},

  onEvent: async function ({ event, api }) {
    const uid = "61571249576714"; // Shristi Magar's Facebook UID

    const responses = [
      "I'm busy right now.",
      "I'm outside, talk later.",
      "Not available at the moment.",
      "Please message me later.",
      "I'm currently occupied.",
      "I'll respond when I'm free.",
    ];

    console.log("DEBUG: Event Body ->", event.body); // Debugging

    // Check if event.body contains '@Shristi Magar'
    if (event.body && event.body.includes("@Shristi Magar")) {
      const randomMessage = responses[Math.floor(Math.random() * responses.length)];
      api.sendMessage(randomMessage, event.threadID, event.messageID);
    }
  }
};