const sharp = require('sharp');

async function fetchModule() {
  const fetch = (await import('node-fetch')).default;
  return fetch;
}

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

module.exports.handler = async function (req, res) {
  const { src, width, quality } = req.query;

  if (!src) {
    return res.status(400).json({ error: 'Missing src parameter' });
  }

  // Check if the image is from the public folder
  if (src.startsWith('/')) {
    // Serve the image directly without optimization
    res.setHeader('Content-Type', 'image/*');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(307).redirect(src);
  }

  try {
    const fetch = await fetchModule();
    const imageUrl = src.startsWith('http')
      ? src
      : `${process.env.NEXT_PUBLIC_SITE_URL}${src}`;
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const inputBuffer = Buffer.from(await response.arrayBuffer());

    const outputBuffer = await sharp(inputBuffer)
      .resize({
        width: width ? parseInt(width) : undefined,
        withoutEnlargement: true,
      })
      .webp({ quality: parseInt(quality || '80') })
      .toBuffer();

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 's-maxage=31536000, stale-while-revalidate');
    res.send(outputBuffer);
  } catch (error) {
    console.error('Error processing image:', error);
    res
      .status(500)
      .json({ error: 'Error processing image', details: error.message });
  }
};
