const express = require('express');
const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs');
const app = express();
const PORT = 3000;

const videoFolderPath = './video/';
const audioFolderPath = './audio/';

// Function to delete file after delay
const deleteFileAfterDelay = (filePath, delay) => {
  setTimeout(() => {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
      } else {
        console.log('File deleted successfully:', filePath);
      }
    });
  }, delay);
};

// Route for downloading video
app.get('/download-video', async (req, res) => {
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

    // Create a unique file name for the video
    const videoFileName = `video_${Date.now()}.mp4`;
    const videoFilePath = videoFolderPath + videoFileName;

    // Download and save video to file
    ytdl(firstVideo.url)
      .pipe(fs.createWriteStream(videoFilePath))
      .on('finish', () => {
        const videoDownloadLink = `${req.protocol}://${req.get('host')}/video/${videoFileName}`;
        res.json({ videoDownloadLink });

        // Delete the video file after 7 seconds
        deleteFileAfterDelay(videoFilePath, 7000); // 7 seconds in milliseconds
      });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Route for downloading audio
app.get('/download-audio', async (req, res) => {
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

    // Create a unique file name for the audio
    const audioFileName = `audio_${Date.now()}.mp3`;
    const audioFilePath = audioFolderPath + audioFileName;

    // Download and save audio to file
    ytdl(firstVideo.url, { filter: 'audioonly' })
      .pipe(fs.createWriteStream(audioFilePath))
      .on('finish', () => {
        const audioDownloadLink = `${req.protocol}://${req.get('host')}/audio/${audioFileName}`;
        res.json({ audioDownloadLink });

        // Delete the audio file after 7 seconds
        deleteFileAfterDelay(audioFilePath, 7000); // 7 seconds in milliseconds
      });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Serve the video files
app.use('/video', express.static('video'));

// Serve the audio files
app.use('/audio', express.static('audio'));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
