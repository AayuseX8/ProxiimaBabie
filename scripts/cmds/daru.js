const fs = require("fs-extra");

module.exports = {
  config: {
    name: "daru",
    version: "1.0",
    author: "Priyansh",
    countDown: 5,
    role: 0,
    shortDescription: "no-prefix",
    longDescription: "Bot Will Reply You In Engish/Bangla Language",
    category: "no prefix",
    guide: {
      en: "{p}{n}",
    }
  },

  onStart: async function ({ }) { },

  onChat: async function ({ api, event }) {
    var { threadID, messageID } = event;
    const lowerMessage = event.body.toLowerCase();

    if (lowerMessage.includes("Daru") || lowerMessage.includes("DARU") || lowerMessage.includes("daru")) {
      const imagePath = __dirname + "/cache/daru.mp4";

      if (fs.existsSync(imagePath)) {
        return api.sendMessage({
          body: "Saath Me Pite Hai  😬  \n Tasty 😋😋😋😋\n Yammmmm 😋😋😋😋😋\n Delicious 🤤🤤🤤🤤🤤",
          attachment: fs.createReadStream(imagePath)
        }, threadID, messageID);
      } else {
        return api.sendMessage("❌ Error: daru file missing !", threadID, messageID);
      }
    }
  }
};
