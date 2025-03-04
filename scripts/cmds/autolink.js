const fs = require("fs-extra");
const axios = require("axios");

const autoLinkStatus = {}; // Stores ON/OFF status per group

module.exports = {
  config: {
    name: "autolink",
    version: "1.2",
    hasPermission: 1,
    credits: "YourName",
    description: "Toggle auto Facebook video downloader ON/OFF.",
    commandCategory: "settings",
    usages: "+autolink on/off",
    cooldowns: 5
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const choice = args[0]?.toLowerCase();

    if (!["on", "off"].includes(choice)) {
      return api.sendMessage("⚙ Usage: +autolink on/off", threadID);
    }

    autoLinkStatus[threadID] = choice === "on";
    return api.sendMessage(`✅ AutoLink has been turned ${choice.toUpperCase()} for this chat.`, threadID);
  },

  onMessage: async function ({ api, event }) {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const senderID = event.senderID;
    const message = event.body || "";

    if (!autoLinkStatus[threadID]) return; // Ignore if AutoLink is OFF
    if (!message.includes("facebook.com") && !message.includes("fb.watch")) return; // Ignore non-FB links

    // React with 👍 emoji
    api.setMessageReaction("👍", messageID, () => {}, true);

    api.sendMessage("⏳ Downloading Facebook video...", threadID);

    try {
      // Use a public Facebook video downloader API
      const fbAPI = `https://fdown.net/api.php?url=${encodeURIComponent(message)}`;
      const { data } = await axios.get(fbAPI);

      if (!data.download_url) throw new Error("No video found!");

      const videoURL = data.download_url;
      const response = await axios.get(videoURL, { responseType: "arraybuffer" });
      const filePath = `${__dirname}/cache/fbvideo_${senderID}.mp4`;
      fs.writeFileSync(filePath, response.data);

      return api.sendMessage(
        { body: "📽 Here is the downloaded Facebook video:", attachment: fs.createReadStream(filePath) },
        threadID,
        () => fs.unlinkSync(filePath)
      );
    } catch (error) {
      return api.sendMessage("❌ Failed to download the video. It may be private or unavailable.", threadID);
    }
  }
};