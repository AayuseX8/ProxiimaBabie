const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "animegen",
    version: "1.1",
    author: "Mr-perfect",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Generate anime-style images using AI"
    },
    longDescription: {
      en: ""
    },
    category: "ai",
    guide: {
      en: ""
    }
  },

  onStart: async function ({ api, event, args }) {
    const prompt = args.join(" ");
    if (!prompt) return api.sendMessage("Enter perompt", event.threadID);

    const HF_TOKEN = "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"; 
    const MODELS = [
      "cagliostrolab/animagine-xl-3.0",
      "hakurei/waifu-diffusion", 
      "stabilityai/stable-diffusion-xl-base-1.0" 
    ];

    async function generateImage(model) {
      const HF_URL = `https://api-inference.huggingface.co/models/${model}`;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const response = await axios.post(
            HF_URL,
            { inputs: prompt },
            {
              headers: { Authorization: `Bearer ${HF_TOKEN}` },
              responseType: "arraybuffer"
            }
          );

          if (response.status === 200) return response.data;

          console.log(`Attempt ${attempt} failed for ${model}. Retrying...`);
          await new Promise((r) => setTimeout(r, 5000)); 
        } catch (error) {
          console.log(`Error on attempt ${attempt} for ${model}: ${error.message}`);
        }
      }
      return null;
    }

    let imageData = null;
    let usedModel = null;

    for (const model of MODELS) {
      imageData = await generateImage(model);
      if (imageData) {
        usedModel = model;
        break;
      }
    }

    if (!imageData) {
      return api.sendMessage("All AI models failed to generate an image. Try again later.", event.threadID);
    }

    const imgPath = path.join(__dirname, "cache", `${Date.now()}.png`);
    fs.writeFileSync(imgPath, imageData);

    api.sendMessage(
      { body: `Image is here "`, attachment: fs.createReadStream(imgPath) },
      event.threadID,
      () => fs.unlinkSync(imgPath)
    );
  }
};