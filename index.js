const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    config: {
        name: "coverimage",
        aliases: ["cover"],
        version: "1.0",
        author: "Your Name",
        countDown: 10,
        role: 0,
        shortDescription: "Generate cover image",
        longDescription: "Generates a cover image based on character name or ID, name, and slogan using the specified API.",
        category: "media",
        guide: "{pn} coverimage <character:name:slogan>"
    },

    onStart: async function ({ message, args, api }) {
        // React with clock emoji to indicate loading
        await api.setMessageReaction("⏰", message.messageID);

        if (args.length < 1) {
            await api.removeMessageReaction("⏰", message.messageID);
            return message.reply(`Please provide character ID or name, name, and slogan separated by colons.\nExample: -coverimage Pikachu:John:My Slogan`);
        }

        const input = args.join(' ');
        const parts = input.split(':').map(part => part.trim());
        
        if (parts.length < 3) {
            await api.removeMessageReaction("⏰", message.messageID);
            return message.reply(`Invalid format. Please provide character ID or name, name, and slogan separated by colons.\nExample: -coverimage Pikachu:John:My Slogan`);
        }

        const [characterInput, name, slogan] = parts;

        // Helper function to get character ID
        async function getCharacterId(character) {
            const searchUrl = `https://nguyenmanh.name.vn/api/searchAvt?key=${encodeURIComponent(character)}`;
            try {
                const response = await axios.get(searchUrl);
                if (response.status === 200 && response.data.result && response.data.result.ID) {
                    return response.data.result.ID;
                } else {
                    throw new Error("Character not found");
                }
            } catch (error) {
                console.error('Error fetching character ID:', error);
                throw new Error("Character not found");
            }
        }

        async function generateCoverImage(characterId) {
            const apiKey = "APyDXmib";
            const apiUrl = `https://nguyenmanh.name.vn/api/avtWibu4?id=${characterId}&tenchinh=${encodeURIComponent(name)}&tenphu=${encodeURIComponent(slogan)}&apikey=${apiKey}`;
            
            try {
                // Send a GET request to the API URL
                const response = await axios.get(apiUrl, { responseType: 'stream' });

                // Check if the API request was successful
                if (response.status === 200) {
                    // Define a temporary file path
                    const tempFilePath = path.join(__dirname, `cover_${Date.now()}.jpg`);

                    // Create a write stream to save the image
                    const writer = fs.createWriteStream(tempFilePath);
                    response.data.pipe(writer);

                    // Wait for the write stream to finish
                    writer.on('finish', async () => {
                        // Remove the clock emoji reaction
                        await api.removeMessageReaction("⏰", message.messageID);

                        // Send the image as an attachment
                        await message.reply({
                            body: 'Here is your generated cover image:',
                            attachment: fs.createReadStream(tempFilePath)
                        });

                        // React with done emoji
                        await api.setMessageReaction("✅", message.messageID);
                        // Delete the temporary file
                        fs.unlinkSync(tempFilePath);
                    });

                    writer.on('error', (err) => {
                        console.error('Error writing image to file:', err);
                        message.reply("An error occurred while generating the cover image. Please try again.");
                    });
                } else {
                    await api.removeMessageReaction("⏰", message.messageID);
                    await message.reply("Failed to generate cover image. Please try again.");
                }
            } catch (error) {
                await api.removeMessageReaction("⏰", message.messageID);
                console.error('Error fetching cover image:', error);
                await message.reply("An error occurred while generating the cover image. Please try again.");
            }
        }

        // Determine if characterInput is an ID or a name
        if (isNaN(characterInput)) {
            // If characterInput is not a number, treat it as a name and get the ID
            getCharacterId(characterInput)
                .then(characterId => generateCoverImage(characterId))
                .catch(async (error) => {
                    await api.removeMessageReaction("⏰", message.messageID);
                    await message.reply(error.message);
                });
        } else {
            // If characterInput is a number, use it directly as the ID
            generateCoverImage(characterInput);
        }
    }
};
