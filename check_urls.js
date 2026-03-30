/* eslint-disable @typescript-eslint/no-require-imports */
const https = require('https');

const IMAGES = {
  'iphone-16-pro-max': 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-pro-max-finish-select-202409-desertttitanium?wid=400&hei=400&fmt=jpeg&qlt=95',
  'iphone-15-pro-max': 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-15-pro-max-black-titanium-select?wid=400&hei=400&fmt=jpeg&qlt=95',
  'iphone-14-pro-max': 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-14-pro-max-deepviolet-select?wid=400&hei=400&fmt=jpeg&qlt=95',
  'iphone-11-pro': 'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-11-pro-midnight-green-select-2019?wid=400&hei=400&fmt=jpeg&qlt=95'
};

Object.entries(IMAGES).forEach(([key, url]) => {
  https.get(url, (res) => {
    console.log(`${key}: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(`${key} error: ${e.message}`);
  });
});
