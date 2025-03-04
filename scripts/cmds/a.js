const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const chatHistoryDir = "blenderChatHistory";
const systemPrompt = "You are a helpful AI chatbot. Keep responses relevant and concise.";

async function query(data) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
        {
            method: "POST",
            headers: {
                Authorization: `Bearer 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`,
                "Content-Type": "application/json",
                "x-use-cache": "false"
            },
            body: JSON.stringify(data),
        }
    );
    return await response.json();
}

module.exports = {
    config: {
        name: "blenderbot",
        aliases: ["bbot", "chatbot"],
        version: "1.3",
        author: "Mr-Perfect",
        role: 0,
        category: "AI",
        shortDescription: "AI chatbot with memory & reply support.",
        longDescription: "Chat with an AI-powered bot using BlenderBot, supporting chat history and message replies.",
        guide: "{p}blenderbot <message>\n{p}blenderbot clear (to reset history)"
    },

    onStart: async function ({ message, args, event, commandName, api }) {
        let prompt = args.join(" ");

        if (prompt.toLowerCase() === "clear") {
            clearChatHistory(event.senderID);
            return message.reply("✅ | Chat history cleared!");
        }

        let chatHistory = [];

        let content = prompt;
        let targetMessageID = event.messageID;

        if (event.type === "message_reply") {
            content = event.messageReply.body + " " + prompt;
            targetMessageID = event.messageReply.messageID;
            clearChatHistory(event.senderID);
        }

        api.setMessageReaction("⌛", event.messageID, () => {}, true);

        try {
            chatHistory = loadChatHistory(event.senderID);
            chatHistory.push({ role: "user", content });

            const response = await query({ inputs: chatHistory.map(msg => msg.content).join("\n") });

            if (response.error) {
                return message.reply(`❌ | API Error: ${response.error}`);
            }

            if (!response.length || !response[0].generated_text) {
                return message.reply("⚠️ | No response received from the AI.");
            }

            const aiResponse = response[0].generated_text;
            chatHistory.push({ role: "assistant", content: aiResponse });

            appendToChatHistory(event.senderID, chatHistory);

            api.sendMessage(aiResponse, event.threadID, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        author: event.senderID,
                        replyToMessageID: targetMessageID
                    });
                }
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);
        } catch (error) {
            console.error("Error in AI response:", error);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            message.reply(`⚠️ | Error: ${error.message}`);
        }
    },

    onReply: async function ({ api, message, event, Reply, args }) {
        let prompt = args.join(" ");
        let { author, commandName } = Reply;

        if (event.senderID !== author) return;

        if (prompt.toLowerCase() === "clear") {
            clearChatHistory(author);
            return message.reply("✅ | Chat history cleared!");
        }

        api.setMessageReaction("⌛", event.messageID, () => {}, true);

        try {
            let chatHistory = loadChatHistory(event.senderID);
            chatHistory.push({ role: "user", content: prompt });

            const response = await query({ inputs: chatHistory.map(msg => msg.content).join("\n") });

            if (response.error) {
                return message.reply(`❌ | API Error: ${response.error}`);
            }

            if (!response.length || !response[0].generated_text) {
                return message.reply("⚠️ | No response received from the AI.");
            }

            const aiResponse = response[0].generated_text;
            chatHistory.push({ role: "assistant", content: aiResponse });

            appendToChatHistory(event.senderID, chatHistory);

            message.reply(aiResponse, (err, info) => {
                if (!err) {
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName,
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);
        } catch (error) {
            console.error("Error in AI response:", error);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            message.reply(`⚠️ | Error: ${error.message}`);
        }
    }
};

// Chat History Functions
function loadChatHistory(uid) {
    const chatHistoryFile = path.join(chatHistoryDir, `memory_${uid}.json`);
    try {
        if (fs.existsSync(chatHistoryFile)) {
            return JSON.parse(fs.readFileSync(chatHistoryFile, "utf8"));
        }
    } catch (error) {
        console.error(`Error loading chat history for ${uid}:`, error);
    }
    return [];
}

function appendToChatHistory(uid, chatHistory) {
    const chatHistoryFile = path.join(chatHistoryDir, `memory_${uid}.json`);
    try {
        if (!fs.existsSync(chatHistoryDir)) fs.mkdirSync(chatHistoryDir);
        fs.writeFileSync(chatHistoryFile, JSON.stringify(chatHistory, null, 2));
    } catch (error) {
        console.error(`Error saving chat history for ${uid}:`, error);
    }
}

function clearChatHistory(uid) {
    const chatHistoryFile = path.join(chatHistoryDir, `memory_${uid}.json`);
    try {
        if (fs.existsSync(chatHistoryFile)) fs.unlinkSync(chatHistoryFile);
    } catch (error) {
        console.error(`Error clearing chat history for ${uid}:`, error);
    }
}
