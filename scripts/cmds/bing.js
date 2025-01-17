const axios = require('axios');
const { GoogleSearch } = require('google-search-results-nodejs');
const fs = require('fs');
const path = require('path');

// Mistral API Key and Model Name
const mistralApiKey = "5eWAboCmhFiauSojnBGkDnVvoDJ7pVhD"; // Your Mistral API key
const MISTRAL_API_URL = "https://api.mistral.ai/v1/completions"; // Mistral API URL
const MODEL_NAME = "mistral-large-latest"; // Mistral model name

// API Keys
const apiKey = "17b146d3a8d19cc93b14289347d5d044901bfe80882806a54e3acce4c90c6046"; // Google News API key

module.exports.config = {
    name: 'news',
    version: '1.0.0',
    author: 'LocDev',
    description: 'Fetches news articles from Google News and provides summaries.',
    category: 'Utility',
    usages: 'news <search keyword>',
    countDown: 5
};

module.exports.onReply = async function ({ api, event, Reply, commandName }) {
    const { threadID, messageID, body, senderID } = event;
    const { author, searchQuery, newsResults, type: reply_type, page } = Reply;

    if (author !== senderID) return;

    if (reply_type === 'news') {
        const totalPages = Math.ceil(newsResults.length / 5);
        const currentPage = page || 1;

        if (body.toLowerCase() === 'next' && currentPage < totalPages) {
            sendPaginatedResults(api, threadID, messageID, newsResults, searchQuery, currentPage + 1, senderID, commandName);
        } else if (body.toLowerCase() === 'back' && currentPage > 1) {
            sendPaginatedResults(api, threadID, messageID, newsResults, searchQuery, currentPage - 1, senderID, commandName);
        } else if (!isNaN(body)) {
            const index = parseInt(body) - 1;
            if (index < 0 || index >= newsResults.length) {
                api.sendMessage('⚠️ Please choose a valid number.', threadID, messageID);
            } else {
                const news = newsResults[index];
                const title = news.title || 'No title available';
                const description = news.description || 'No description available';
                const link = news.link || 'No link available';
                const source = news.source || 'Unknown';
                const publishedAt = news.published_at || 'Unknown';
                const formattedTime = prettyTime(publishedAt);

                // Save the link content in description.json
                try {
                    const content = await fetchLinkContent(link);
                    fs.writeFileSync(path.join(__dirname, 'news', 'description.json'), JSON.stringify({ link, content }, null, 2));

                    // Generate summary only after storing content in description.json
                    const summary = await generateMainPoints(content);
                    fs.writeFileSync(path.join(__dirname, 'news', 'summary.json'), JSON.stringify({ summary }, null, 2));

                    const message = `[ NEWS DETAILS ]\n
📝 Title: ${title}\n
📄 Description: ${description}\n
⏰ Uploaded: ${formattedTime}\n
🌍 Source: ${source}\n🔗 Link: ${link}\n\n📌 Main Points:\n${summary}`;
                    api.sendMessage(message, threadID, messageID);
                } catch (error) {
                    console.error('Error:', error);
                    api.sendMessage('❎ Error occurred: ' + error.message, threadID, messageID);
                }
            }
        } else {
            api.sendMessage('❎ Invalid response. Use a number, "Next," or "Back."', threadID, messageID);
        }
    }
};

module.exports.onStart = async function ({ api, event, args, commandName }) {
    const { threadID, messageID, senderID } = event;

    if (args.length === 0) return api.sendMessage('❎ Please provide a search query (e.g., Nepal)', threadID, messageID);

    const keyword = args.join(' ');

    const search = new GoogleSearch(apiKey); // Use Google News API key here
    const params = {
        engine: "google_news",
        q: keyword,
        gl: "us",
        hl: "en"
    };

    try {
        const searchResults = await new Promise((resolve, reject) => {
            search.json(params, (data) => {
                resolve(data);
            }, (error) => {
                reject(error);
            });
        });

        if (searchResults && searchResults.news_results) {
            // Clear existing news data before writing new data
            clearPreviousData();

            // Save the news articles to news.json
            fs.writeFileSync(path.join(__dirname, 'news', 'news.json'), JSON.stringify(searchResults.news_results, null, 2));

            sendPaginatedResults(api, threadID, messageID, searchResults.news_results, keyword, 1, senderID, commandName);
        } else {
            api.sendMessage('❎ No news results found for your query.', threadID, messageID);
        }

    } catch (error) {
        console.error('Error in API call:', error.message);
        api.sendMessage('❎ Error occurred: ' + error.message, threadID, messageID);
    }
};

// Function to send paginated news results
function sendPaginatedResults(api, threadID, messageID, newsResults, keyword, page, senderID, commandName) {
    const totalPages = Math.ceil(newsResults.length / 5);
    const startIndex = (page - 1) * 5;
    const endIndex = Math.min(startIndex + 5, newsResults.length);

    let message = `[ NEWS SEARCH ]\n📝 Results for keyword: ${keyword}\n\n`;
    for (let i = startIndex; i < endIndex; i++) {
        const news = newsResults[i];
        const title = news.title || 'No title available';
        const source = news.source || 'Unknown';
        const link = news.link || 'No link available';
        const publishedAt = news.published_at || 'Unknown';
        const formattedTime = prettyTime(publishedAt);

        message += `${i + 1}. ${title}\nSource: ${source}\nPublished: ${formattedTime}\nLink: ${link}\n\n`;
    }

    if (page > 1) message += '⬅️ Back\n';
    if (page < totalPages) message += '➡️ Next\n';

    message += '📌 Reply with a number to get details of a news article.';

    api.sendMessage(message, threadID, (err, info) => {
        if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
                commandName,
                messageID: info.messageID,
                author: senderID,
                searchQuery: keyword,
                newsResults,
                type: 'news',
                page
            });
        }
    }, messageID);
}

// Function to fetch the content of the link
async function fetchLinkContent(link) {
    try {
        const response = await axios.get(link);
        // Assuming the content is in the body of the response
        // You might need to use a library like cheerio to scrape the content
        return response.data;
    } catch (error) {
        console.error('Error fetching link content:', error.message);
        throw new Error('Unable to fetch the content of the link');
    }
}

// Function to generate main points using Mistral API
async function generateMainPoints(content) {
    try {
        const response = await axios.post(
            MISTRAL_API_URL,
            {
                model: MODEL_NAME, // Mistral model name
                prompt: `Please summarize the following content into three key points:\n\n${content}`,
                max_tokens: 100,
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${mistralApiKey}`, // Use Mistral API key
                    "Content-Type": "application/json"
                }
            }
        );

        // Check if response has data
        if (response.data && response.data.choices && response.data.choices[0]) {
            const summaryText = response.data.choices[0].text.trim();
            // Format summary into three main points
            const points = summaryText.split('\n').slice(0, 3).map((point, index) => `${index + 1}. ${point}`).join('\n');

            return points;
        } else {
            throw new Error('No valid response from Mistral API');
        }
    } catch (error) {
        console.error('Error generating main points:', error.response ? error.response.data : error.message);
        throw new Error('Error generating main points');
    }
}

// Helper function to format time
function prettyTime(time) {
    const date = new Date(time);
    if (isNaN(date)) return "Unknown";
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Helper function to clear previous data in the news folder
function clearPreviousData() {
    const newsFolderPath = path.join(__dirname, 'news');
    if (!fs.existsSync(newsFolderPath)) {
        fs.mkdirSync(newsFolderPath);
    }

    // Remove old files if they exist
    const files = ['news.json', 'summary.json', 'description.json'];
    files.forEach(file => {
        const filePath = path.join(newsFolderPath, file);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });
}