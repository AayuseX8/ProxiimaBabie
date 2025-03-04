const fs = require("fs-extra");

module.exports = {
  config: {
    name: "chocolate",
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

    if (lowerMessage.includes("chocolate") || lowerMessage.includes("CHOCOLATE") || lowerMessage.includes("Chocolate")) {
      const imagePath = __dirname + "/cache/chocolate.jpg";

      if (fs.existsSync(imagePath)) {
        return api.sendMessage({
          body: "ye lo aapki chocolate 🍫",
          attachment: fs.createReadStream(imagePath)
        }, threadID, messageID);
      } else {
        return api.sendMessage("❌ Error: chocolate file missing !", threadID, messageID);
      }
    }
  }
};
