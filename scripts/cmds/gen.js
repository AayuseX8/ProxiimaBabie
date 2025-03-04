const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gen",
    version: "1.0",
    author: "Mr-Perfect",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Generate images using Stable Diffusion XL"
    },
    longDescription: {
      en: "Generate AI images using the Stable Diffusion XL model from Hugging Face."
    },
    category: "ai",
    guide: {
      en: "{prefix}generate [prompt]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("Please provide a prompt for image generation.", event.threadID);

    const HF_TOKEN = "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"; 
    const HF_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
    const HF_URL = `https://api-inference.huggingface.co/models/${HF_MODEL}`;

    try {
      const response = await axios.post(
        HF_URL,
        { inputs: prompt },
        {
          headers: { Authorization: `Bearer ${HF_TOKEN}` },
          responseType: "arraybuffer"
        }
      );

      if (response.status !== 200) throw new Error("Failed to generate image.");

      const imgPath = path.join(__dirname, "cache", `${Date.now()}.png`);
      fs.writeFileSync(imgPath, response.data);

      api.sendMessage(
        { body: `Here is your generated image for: "${prompt}"`, attachment: fs.createReadStream(imgPath) },
        event.threadID,
        () => fs.unlinkSync(imgPath)
      );
    } catch (error) {
      api.sendMessage(`Error: ${error.message}`, event.threadID);
    }
  }
};