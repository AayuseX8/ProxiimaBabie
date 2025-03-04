const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "anime",
    version: "1.3",
    hasPermission: 0,
    credits: "YourName",
    description: "Generate anime images using Niji 5.",
    commandCategory: "image",
    usages: "+anime <prompt>",
    cooldowns: 5
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("Please provide a prompt!\nExample: +anime A samurai anime girl", event.threadID);

    const model = "stabilityai/japanese-stable-diffusion-v2"; // Latest Niji 5 model
    const hfToken = "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";

    api.sendMessage("🎨 Generating your anime image with Niji 5...", event.threadID);

    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        { inputs: prompt },
        {
          headers: { Authorization: `Bearer ${hfToken}` },
          responseType: "arraybuffer"
        }
      );

      if (response.status !== 200) throw new Error("Failed to generate image.");

      const imagePath = `${__dirname}/cache/niji5_${event.senderID}.png`;
      fs.writeFileSync(imagePath, response.data);

      return api.sendMessage(
        { body: "✨ Here is your anime image from Niji 5!", attachment: fs.createReadStream(imagePath) },
        event.threadID,
        () => fs.unlinkSync(imagePath)
      );
    } catch (error) {
      return api.sendMessage("❌ Failed to generate the image. Try again later!", event.threadID);
    }
  }
};