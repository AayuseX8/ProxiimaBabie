const axios = require("axios");
const fs = require("fs");
const path = require("path");

const chatHistoryDir = "claudeChatHistory";
const apiKey = process.env.ANTHROPIC_API_KEY || "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";

const systemPrompt = "Examine the prompt and respond precisely as directed, omitting superfluous information. Provide brief responses, typically 1-2 sentences, except when detailed answers like essays, poems, or stories are requested.";

module.exports = {
    config: {
        name: "claude",
        aliases: ["cld"],
        version: "1.0.0",
        author: "Mr Perfect",
        countDown: 0,
        role: 0,
        category: "AI",
        description: {
            en: "Claude AI Model Integration.",
        },
        guide: {
            en: "{pn} [question]",
        },
    },
    onStart: async function ({ api, message, event, args, commandName }) {
        var prompt = args.join(" ");

        if (prompt.toLowerCase() === "clear") {
            clearChatHistory(event.senderID);
            message.reply("Chat history cleared!");
            return;
        }

        var content = event.type === "message_reply" ? event.messageReply.body : args.join(" ");
        var targetMessageID = event.type === "message_reply" ? event.messageReply.messageID : event.messageID;

        api.setMessageReaction("⌛", event.messageID, () => {}, true);

        const startTime = Date.now();

        try {
            const chatMessages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: content }
            ];

            const chatCompletion = await sendClaudeRequest(chatMessages);
            const assistantResponse = chatCompletion.content[0].text;

            const completionTime = ((Date.now() - startTime) / 1000).toFixed(2);
            const totalWords = assistantResponse.split(/\s+/).filter(word => word !== "").length;

            let finalMessage = `${assistantResponse}\n\nCompletion time: ${completionTime} seconds\nTotal words: ${totalWords}`;

            api.sendMessage(finalMessage, event.threadID, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        author: event.senderID,
                        replyToMessageID: targetMessageID
                    });
                }
            });

            saveChatHistory(event.senderID, content, assistantResponse);
            api.setMessageReaction("✅", event.messageID, () => {}, true);
        } catch (error) {
            console.error("Error in chat completion:", error);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            message.reply(`An error occurred: ${error}`);
        }
    },
    onReply: async function ({ api, message, event, Reply, args }) {
        var prompt = args.join(" ");
        let { author, commandName } = Reply;

        if (event.senderID !== author) return;

        if (prompt.toLowerCase() === "clear") {
            clearChatHistory(author);
            message.reply("Chat history cleared!");
            return;
        }

        api.setMessageReaction("⌛", event.messageID, () => {}, true);

        const startTime = Date.now();

        try {
            const chatHistory = loadChatHistory(event.senderID);

            const chatMessages = [
                { role: "system", content: systemPrompt },
                ...chatHistory,
                { role: "user", content: prompt }
            ];

            const chatCompletion = await sendClaudeRequest(chatMessages);
            const assistantResponse = chatCompletion.content[0].text;

            const completionTime = ((Date.now() - startTime) / 1000).toFixed(2);
            const totalWords = assistantResponse.split(/\s+/).filter(word => word !== "").length;

            let finalMessage = `${assistantResponse}\n\nCompletion time: ${completionTime} seconds\nTotal words: ${totalWords}`;

            message.reply(finalMessage, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        author: event.senderID,
                    });
                }
            });

            saveChatHistory(event.senderID, prompt, assistantResponse);
            api.setMessageReaction("✅", event.messageID, () => {}, true);
        } catch (error) {
            console.error("Error in chat completion:", error);
            message.reply(error.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
        }
    }
};

async function sendClaudeRequest(messages) {
    try {
        const response = await axios.post(
            "https://api.anthropic.com/v1/messages",
            {
                model: "claude-3-7-sonnet-20250219",
                max_tokens: 1024,
                messages: messages
            },
            {
                headers: {
                    "x-api-key": apiKey,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json"
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error in Claude API request:", error.response?.data || error.message);
        throw error;
    }
}

function loadChatHistory(uid) {
    const chatHistoryFile = path.join(chatHistoryDir, `memory_${uid}.json`);

    try {
        if (fs.existsSync(chatHistoryFile)) {
            return JSON.parse(fs.readFileSync(chatHistoryFile, "utf8"));
        } else {
            return [];
        }
    } catch (error) {
        console.error(`Error loading chat history for UID ${uid}:`, error);
        return [];
    }
}

function saveChatHistory(uid, userMessage, assistantResponse) {
    const chatHistoryFile = path.join(chatHistoryDir, `memory_${uid}.json`);

    try {
        let chatHistory = [];
        if (fs.existsSync(chatHistoryFile)) {
            chatHistory = JSON.parse(fs.readFileSync(chatHistoryFile, "utf8"));
        }

        chatHistory.push({ role: "user", content: userMessage });
        chatHistory.push({ role: "assistant", content: assistantResponse });

        if (!fs.existsSync(chatHistoryDir)) {
            fs.mkdirSync(chatHistoryDir);
        }

        fs.writeFileSync(chatHistoryFile, JSON.stringify(chatHistory, null, 2));
    } catch (error) {
        console.error(`Error saving chat history for UID ${uid}:`, error);
    }
}

function clearChatHistory(uid) {
    const chatHistoryFile = path.join(chatHistoryDir, `memory_${uid}.json`);

    try {
        if (fs.existsSync(chatHistoryFile)) {
            fs.unlinkSync(chatHistoryFile);
        }
    } catch (err) {
        console.error("Error deleting chat history file:", err);
    }
}