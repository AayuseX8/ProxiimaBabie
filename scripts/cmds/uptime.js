const os = require("os");
const pidusage = require("pidusage");
const https = require("https");
const { performance } = require("perf_hooks");

let fontEnabled = true;
const startTime = Date.now(); // Start uptime from zero on each restart

// Function to apply special font to text
function formatFont(text) {
    const fontMapping = {
        a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
        n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
        A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
        N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
    };

    let formattedText = "";
    for (const char of text) {
        formattedText += fontMapping[char] || char;
    }
    return formattedText;
}

// Convert bytes to MB
function byte2mb(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(0)} 𝖬𝖡`;
}

// Function to calculate uptime
function getUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const months = Math.floor(days / 30);
    const remainingDays = days % 30;

    return `𝖴𝗉𝗍𝗂𝗆𝖾: ${months} 𝗆𝗈𝗇𝗍𝗁(𝗌), ${remainingDays} 𝖽𝖺𝗒(𝗌), ${hours} 𝗁𝗈𝗎𝗋(𝗌), ${minutes} 𝗆𝗂𝗇𝗎𝗍𝖾(𝗌), 𝖺𝗇𝖽 ${remainingSeconds} 𝗌𝖾𝖼𝗈𝗇𝖽(𝗌)`;
}

// Function to calculate ping
async function getPing() {
    const start = performance.now();
    await new Promise((resolve) => {
        const req = https.get("https://google.com", () => resolve());
        req.on("error", () => resolve());
        req.end();
    });
    const end = performance.now();
    return `${Math.round(end - start)}𝗆𝗌`;
}

// Main function to display system stats
async function onStart({ api, event }) {
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    // Retrieve process resource usage
    const usage = await pidusage(process.pid);

    // Dynamically gather system information
    const osInfo = {
        cores: os.cpus().length,
        platform: os.platform(),
        architecture: os.arch()
    };

    // Calculate server ping
    const ping = await getPing();

    // Construct formatted output
    const formattedText = `
𝖡𝖮𝖳 𝗁𝖺𝗌 𝖻𝖾𝖾𝗇 𝗐𝗈𝗋𝗄𝗂𝗇𝗀 𝖿𝗈𝗋 ${getUptime(uptimeSeconds)}

❖ 𝖢𝗉𝗎 𝗎𝗌𝖺𝗀𝖾: ${usage.cpu.toFixed(1)}%
❖ 𝖱𝖠𝖬 𝗎𝗌𝖺𝗀𝖾: ${byte2mb(usage.memory)}
❖ 𝖢𝗈𝗋𝖾𝗌: ${osInfo.cores}
❖ 𝖯𝗂𝗇𝗀: ${ping}
❖ 𝖮𝗉𝖾𝗋𝖺𝗍𝗂𝗇𝗀 𝖲𝗒𝗌𝗍𝖾𝗆 𝖯𝗅𝖺𝗍𝖿𝗈𝗋𝗆: ${osInfo.platform}
❖ 𝖲𝗒𝗌𝗍𝖾𝗆 𝖢𝖯𝖴 𝖠𝗋𝖼𝗁𝗂𝗍𝖾𝗐𝗍𝗎𝗋𝖾: ${osInfo.architecture}`;

    // Share contact using UID
    const uid = "61556771164358"; // Replace with the correct UID
    return api.shareContact(formatFont(formattedText), uid, event.threadID);
}

module.exports = {
    config: {
        name: "uptime",
        version: "2.1.0",
        author: "Mr perfect",
        countDown: 5,
        role: 0,
        shortDescription: "Displays the bot's uptime.",
        longDescription: "Shows how long the bot has been running, including system stats.",
        category: "system",
        guide: "{p}uptime"
    },
    byte2mb,
    getUptime,
    getPing,
    onStart
};