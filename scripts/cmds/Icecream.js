const fs = require("fs-extra");

module.exports = {
  config: {
    name: "icecream",
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

    if (lowerMessage.includes("icecream") || lowerMessage.includes("Icecream") || lowerMessage.includes("ICECREAM")) {
      const imagePath = __dirname + "/cache/icecream.jpg";

      if (fs.existsSync(imagePath)) {
        return api.sendMessage({
          body: "Ye lo Meri Hot 🥵 Mwal Icecream Kha Kar Cool Ho Jao 😝🥶",
          attachment: fs.createReadStream(imagePath)
        }, threadID, messageID);
      } else {
        return api.sendMessage("❌ Error: icecream file missing !", threadID, messageID);
      }
    }
  }
};
