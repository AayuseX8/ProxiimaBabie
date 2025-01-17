module.exports = {
    config: {
        name: 'ai',
        aliases: ['mst'],
        version: '1.0.0',
        author: 'Mr perfect',
        countDown: 0,
        role: 0,
        category: 'Ai',
        description: {
            en: 'Mistral Model Integration.',
        },
        guide: {
            en: '{pn} [question]',
        },
    },
    onStart: async function ({ api, message, event, args, commandName }) {
        var prompt = event.body.trim();  // Directly use the message content as prompt.

        let chatHistory = [];

        if (prompt.toLowerCase() === "clear") {
            clearChatHistory(event.senderID);
            message.reply("Chat history cleared!");
            return;
        }

        var content = prompt;

        api.setMessageReaction("⌛", event.messageID, () => { }, true);

        const startTime = Date.now();

        try {
            const chatMessages = [
                { "role": "system", "content": systemPrompt },
                { "role": "user", "content": content }
            ];

            const chatCompletion = await sendMistralRequest(chatMessages);

            const assistantResponse = chatCompletion.choices[0].message.content;

            const endTime = new Date().getTime();
            const completionTime = ((endTime - startTime) / 1000).toFixed(2);
            const totalWords = assistantResponse.split(/\s+/).filter(word => word !== '').length;

            let finalMessage = `${assistantResponse}\n\nCompletion time: ${completionTime} seconds\nTotal words: ${totalWords}`;

            api.sendMessage(finalMessage, event.threadID, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        author: event.senderID,
                    });
                } else {
                    console.error("Error sending message:", err);
                }
            });

            chatHistory.push({ role: "user", content: prompt });
            chatHistory.push({ role: "assistant", content: assistantResponse });
            appendToChatHistory(event.senderID, chatHistory);

            api.setMessageReaction("✅", event.messageID, () => { }, true);
        } catch (error) {
            console.error("Error in chat completion:", error);
            api.setMessageReaction("❌", event.messageID, () => { }, true);
            return message.reply(`An error occurred: ${error}`, event.threadID, event.messageID);
        }
    },
};