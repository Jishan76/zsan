const express = require('express');
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs');
const app = express();
const PORT = 3000;

const audioFolderPath = './audio/';

app.get('/download', async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    // Search for videos using yt-search
    const { videos } = await ytSearch(query);

    if (!videos.length) {
      return res.status(404).json({ error: 'No videos found' });
    }

    // Get the first video
    const firstVideo = videos[0];

    // Get video details
    const videoInfo = await ytdl.getInfo(firstVideo.url);

    // Get the direct audio download URL of the video
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
    if (!audioFormat) {
      return res.status(404).json({ error: 'No audio found' });
    }

    // Create a unique file name
    const fileName = `audio_${Date.now()}.mp3`;
    const filePath = audioFolderPath + fileName;

    // Download and save audio to file
    ytdl(firstVideo.url, { filter: 'audioonly' })
      .pipe(fs.createWriteStream(filePath))
      .on('finish', () => {
        const downloadLink = `${req.protocol}://${req.get('host')}/audio/${fileName}`;
        res.json({ downloadLink });

        // Delete the file after 7 seconds
        setTimeout(() => {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting file:', err);
            } else {
              console.log('File deleted successfully:', filePath);
            }
          });
        }, 7000); // 7 seconds in milliseconds
      });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve the audio files
app.use('/audio', express.static('audio'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
