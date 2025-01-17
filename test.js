const axios = require('axios');

// Define the API endpoint and your API key
const apiUrl = "https://api.google.com/gemini/v1.5/flash";
const apiKey = "S"; // Replace with your actual API key

// Define the question you want to test
const question = "What are the benefits of using AI in healthcare?";

// Function to send the request
async function testGeminiAPI() {
    try {
        const response = await axios.post(apiUrl, {
            question: question
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Response from Gemini 1.5 Flash API:");
        console.log(response.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.status : error.message);
        console.error("Details:", error.response ? error.response.data : '');
    }
}

// Call the function to test the API
testGeminiAPI();