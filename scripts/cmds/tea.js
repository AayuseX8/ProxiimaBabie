const fs = require("fs-extra");
const axios = require("axios");

module.exports = {
  config: {
    name: "tea",
    version: "1.0",
    author: "Mr Perfect",
    countDown: 5,
    role: 0,
    shortDescription: "no-prefix",
    longDescription: "Bot Will Reply You In English/Bangla Language",
    category: "no prefix",
    guide: {
      en: "{p}{n}",
    }
  },

  onStart: async function ({ }) { },

  onChat: async function ({ api, event }) {
    var { threadID, messageID } = event;
    const messageText = event.body.toLowerCase().trim();

    if (messageText === "tea" || messageText === "chai" || messageText === "☕" || messageText === "Coffee") {
      const mitsukiURL = "https://i.imgur.com/5ppt95h.mp4"; 
      const mitskiPath = __dirname + "/cache/perfect_wife.mp4"; 

      try {
        const response = await axios({
          url: mitsukiURL,
          method: "GET",
          responseType: "stream"
        });

        const writer = fs.createWriteStream(mitskiPath);
        response.data.pipe(writer);

        writer.on("close", () => {
          if (fs.existsSync(mitskiPath)) {
            api.sendMessage({
              body: "Ye lo aapki chai pyar se banaya hu apne chote chote hatho se \n📛😋😋😋😋😋😋",
              attachment: fs.createReadStream(mitskiPath)
            }, threadID, () => fs.unlinkSync(mitskiPath));
          } else {
            api.sendMessage("❌ Error: Video download failed!", threadID, messageID);
          }
        });

      } catch (error) {
        console.error("Download Error:", error);
        return api.sendMessage("❌ Error: Unable to fetch the video!", threadID, messageID);
      }
    }
  }
};
