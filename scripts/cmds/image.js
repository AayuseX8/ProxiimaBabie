const axios = require('axios');
const fs = require('fs');

module.exports = {
    config: {
        name: 'staryai',
        version: '1.0.0',
        author: 'Mr. Perfect',
        countDown: 5,
        role: 0,
        shortDescription: 'Generate images using StarryAI',
        longDescription: 'Generate an AI-generated image from a prompt using StarryAI and send it to the chat.',
        category: 'fun',
        guide: '{pn} <prompt>',
    },
    onStart: async function ({ message, api, args, event }) {
        const apiKey = 'yKv6K5xl3rBS3iojhIcDmHhO7GkbKg';
        const apiUrl = 'https://api.starryai.com/generate/';
        const prompt = args.join(' ');

        if (!prompt) {
            return api.sendMessage('❌ Please provide a prompt to generate an image.', event.threadID, event.messageID);
        }

        try {
            const response = await axios.post(
                apiUrl,
                { prompt },
                {
                    headers: {
                        'X-API-Key': apiKey,
                        'accept': 'application/json',
                    },
                }
            );

            const imageUrl = response.data.image_url;

            if (!imageUrl) {
                return api.sendMessage('❌ Failed to generate an image. Please try again later.', event.threadID, event.messageID);
            }

            // Download the image
            const imagePath = `./temp/${event.threadID}_staryai.jpg`;
            const imageResponse = await axios({
                url: imageUrl,
                method: 'GET',
                responseType: 'stream',
            });

            // Save the image locally
            const writer = fs.createWriteStream(imagePath);
            imageResponse.data.pipe(writer);

            writer.on('finish', () => {
                api.sendMessage(
                    {
                        body: `✨ Here's your AI-generated image for the prompt: "${prompt}"`,
                        attachment: fs.createReadStream(imagePath),
                    },
                    event.threadID,
                    () => {
                        // Delete the image after sending
                        fs.unlinkSync(imagePath);
                    }
                );
            });

            writer.on('error', (error) => {
                console.error('Error saving the image:', error);
                api.sendMessage('❌ Error generating the image. Please try again later.', event.threadID, event.messageID);
            });
        } catch (error) {
            console.error(error);
            api.sendMessage('❌ Failed to generate an image. Please check your prompt or try again later.', event.threadID, event.messageID);
        }
    },
};