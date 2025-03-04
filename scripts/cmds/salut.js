 module.exports = {
    config: {
        name: "salut",
        version: "1.0",
        author: "kivv",
        countDown: 5,
        role: 0,
        shortDescription: "No Prefix",
        longDescription: "No Prefix",
        category: "reply",
    },
onStart: async function(){}, 
onChat: async function({
    event,
    message,
    getLang
}) {
    if (event.body && event.body.toLowerCase() == "salut") return message.reply("🎊 𝐬𝐚𝐥𝐮𝐭 𝐦𝐞𝐜 𝐞𝐜𝐫𝐢𝐭 💁‍♂️✨웃➣..『¥blazegc』𝐩𝐨𝐮𝐫 𝐫𝐞𝐣𝐨𝐢𝐧𝐝𝐫𝐞 𝐦𝐨𝐧 𝐠𝐫𝐨𝐮𝐩𝐞 🎉✨");
}
};
