const fs = require('fs');
const https = require('https');

function writeQuote(quote, author) {
  const line = `"${quote}" — ${author}\n`;
  fs.appendFileSync('quotes.txt', line);
  console.log('Quote added:', line.trim());
}

https.get('https://zenquotes.io/api/random', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    try {
      const res = JSON.parse(data);
      if (Array.isArray(res) && res.length > 0) {
        writeQuote(res[0]['q'], res[0]['a']);
      } else {
        // Fallback quote if parsing fails
        writeQuote('Default fallback quote', 'Assistant');
      }
    } catch (err) {
      writeQuote('Default fallback quote', 'Assistant');
    }
  });
}).on("error", (err) => {
  writeQuote('Default fallback quote', 'Assistant');
});
