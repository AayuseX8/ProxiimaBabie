const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

async function generateImage(prompt) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/playgroundai/playground-v2.5-1024px-aesthetic",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer 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`,
                "Content-Type": "application/json",
                "x-use-cache": "false"
            },
            body: JSON.stringify({ inputs: prompt }),
        }
    );

    const textResponse = await response.text();

    try {
        const jsonResponse = JSON.parse(textResponse);
        return jsonResponse;
    } catch (error) {
        console.log("⚠️ API Response:", textResponse);
        throw new Error("Invalid JSON response from Hugging Face API");
    }
}

module.exports = {
    config: {
        name: "pg",
        version: "1.4",
        author: "Perfect Wife",
        role: 0,
        shortDescription: "Generate AI Images",
        longDescription: "Generates images using Hugging Face PlaygroundAI.",
        category: "AI",
        guide: "{p}pg <prompt>"
    },

    onStart: async function ({ message, args }) {
        const prompt = args.join(" ");
        if (!prompt) return message.reply("❌ | Please provide a prompt!");

        try {
            const response = await generateImage(prompt);

            if (response.error) {
                return message.reply(`❌ | API Error: ${response.error}`);
            }

            if (response && response.image) {
                const imageBuffer = Buffer.from(response.image, "base64");
                const filePath = path.join(__dirname, "generated.png");

                fs.writeFileSync(filePath, imageBuffer);

                return message.reply({
                    body: `🖼️ | Image generated for: *${prompt}*`,
                    attachment: fs.createReadStream(filePath)
                });
            } else {
                return message.reply("⚠️ | No image received from AI.");
            }
        } catch (error) {
            message.reply(`⚠️ | Error: ${error.message}`);
        }
    }
};