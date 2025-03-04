const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const IMGUR_CLIENT_ID = "086e5aa86bd00c4"; 

module.exports = {
    config: {
        name: "imgur",
        aliases: ["upload"],
        version: "2.0.0",
        author: "Mr Perfect",
        countDown: 5,
        role: 0,
        category: "Utility",
        guide: "{pn} [reply with an image, GIF, or video]",
    },
    onStart: async function ({ api, event, message }) {
        if (!event.messageReply || !event.messageReply.attachments.length) {
            return message.reply("⚠️ Please reply with an image, GIF, or video.");
        }

        const attachment = event.messageReply.attachments[0];
        const supportedTypes = {
            "photo": ".jpg",
            "animated_image": ".gif",
            "video": ".mp4"
        };

        if (!supportedTypes[attachment.type]) {
            return message.reply("⚠️ Only images, GIFs, and videos are supported.");
        }

        const filePath = path.join(__dirname, `temp_${Date.now()}${supportedTypes[attachment.type]}`);

        try {
            const fileData = await axios.get(attachment.url, { responseType: "arraybuffer" });
            fs.writeFileSync(filePath, fileData.data);

            const imgurLink = await uploadToImgur(filePath);
            fs.unlinkSync(filePath); 

            message.reply(`✅ File Uploaded: ${imgurLink}`);
        } catch (error) {
            console.error("Imgur Upload Error:", error);
            message.reply("❌ Failed to upload file.");
        }
    }
};

async function uploadToImgur(filePath) {
    try {
        const fileData = fs.readFileSync(filePath, { encoding: "base64" });

        const response = await axios.post(
            "https://api.imgur.com/3/upload",
            { image: fileData, type: "base64" },
            {
                headers: {
                    Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
                    "Content-Type": "application/json"
                }
            }
        ); return response.data.data.link; 
    } catch (error) {
        console.error("Error uploading to Imgur:", error.response?.data || error.message);
        throw error;
    }
}