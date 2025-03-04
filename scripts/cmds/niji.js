const fs = require("fs-extra");
const fetch = require("node-fetch");

module.exports = {
  config: {
    name: "niji",
    version: "1.2",
    hasPermission: 0,
    credits: "YourName",
    description: "Generate high-quality anime images using a public Niji model.",
    commandCategory: "image",
    usages: "+niji <prompt>",
    cooldowns: 5
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("Please provide a prompt!\nExample: +niji A cyberpunk anime samurai", event.threadID);

    const hfToken = "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"; // Your access token
    const modelURL = "https://api-inference.huggingface.co/models/ShoukanLabs/OpenNiji-V2";

    api.sendMessage("🎨 Generating your anime image with Niji...", event.threadID);

    try {
      const response = await fetch(modelURL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { sampler_index: "Euler" }, // Helps with generation
          options: { wait_for_model: true }
        })
      });

      if (!response.ok) throw new Error("Failed to generate image.");

      const imageBuffer = await response.buffer();
      const imagePath = `${__dirname}/cache/niji_${event.senderID}.png`;
      fs.writeFileSync(imagePath, imageBuffer);

      return api.sendMessage(
        { body: "✨ Here is your anime image!", attachment: fs.createReadStream(imagePath) },
        event.threadID,
        () => fs.unlinkSync(imagePath)
      );
    } catch (error) {
      return api.sendMessage("❌ Failed to generate the image. Try again later!", event.threadID);
    }
  }
};