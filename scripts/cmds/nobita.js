const fs = require("fs-extra");

module.exports = {
  config: {
    name: "nobita",
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

    if (lowerMessage.includes("NOBITA") || lowerMessage.includes("nobita") || lowerMessage.includes("@ꕥNoɓɩtʌ᭄﹅ メ ヽ・　T.T")) {
      const imagePath = __dirname + "/cache/raj.mp4";

      if (fs.existsSync(imagePath)) {
        return api.sendMessage({
          body: " It's Nobita 🙂  \n Masoom Ladikya Dur Rahe \n              \n😝😝😝😝😝😝",
          attachment: fs.createReadStream(imagePath)
        }, threadID, messageID);
      } else {
        return api.sendMessage("❌ Error: nobita file missing !", threadID, messageID);
      }
    }
  }
};
