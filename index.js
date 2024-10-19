const express = require('express');
const optimizeImageHandler = require('./api/optimize-image'); // Adjust to CommonJS

const app = express();

// Use the image optimization handler on a specific route, e.g., /optimize
app.get('/optimize', optimizeImageHandler.handler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
