const express = require('express');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.get('/api/optimize-image', async (req, res) => {
  console.log('API Route Called');
  console.log('Full Request URL:', req.url);
  console.log('All Query Params:', req.query);

  const { src, width, quality } = req.query;
  console.log('Parsed Parameters:', { src, width, quality });

  if (!src) {
    console.error('Missing src parameter');
    return res.status(400).json({ error: 'Missing src parameter' });
  }

  if (!width) {
    console.error('Missing width parameter');
    return res.status(400).json({ error: 'Missing width parameter' });
  }

  try {
    let inputBuffer;
    if (src.startsWith('http://') || src.startsWith('https://')) {
      console.log('Fetching remote image:', src);
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      inputBuffer = Buffer.from(await response.arrayBuffer());
      console.log('Remote image fetched successfully');
    } else {
      const publicPath = path.join(__dirname, 'public', src);
      console.log('Reading local image from:', publicPath);
      
      if (!fs.existsSync(publicPath)) {
        console.error('File not found:', publicPath);
        return res.status(404).json({ error: 'File not found' });
      }
      
      inputBuffer = await fs.promises.readFile(publicPath);
      console.log('Local image read successfully');
    }

    console.log('Processing image with sharp');
    const outputBuffer = await sharp(inputBuffer)
      .resize({ width: parseInt(width), withoutEnlargement: true })
      .webp({ quality: parseInt(quality || '80') })
      .toBuffer();

    console.log('Image processed successfully');
    res.set('Content-Type', 'image/webp');
    res.send(outputBuffer);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Error processing image', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Image optimization server listening at http://localhost:${port}`);
});