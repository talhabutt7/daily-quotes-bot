const fs = require('fs');
const https = require('https');

https.get('https://api.quotable.io/random', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    try {
      const { content, author } = JSON.parse(data);
      const line = `"${content}" — ${author}\n`;
      fs.appendFileSync('quotes.txt', line);
      console.log('Quote added:', line.trim());
    } catch (err) {
      console.error('Error parsing quote:', err);
    }
  });
}).on("error", (err) => {
  console.error("Error fetching quote:", err.message);
});
