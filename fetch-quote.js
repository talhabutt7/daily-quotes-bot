const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

function getRandomInt(min, max) {
  // Inclusive min and max
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fetchAndCommitQuote(repeat, done) {
  if (repeat === 0) {
    done();
    return;
  }
  https.get('https://zenquotes.io/api/random', (resp) => {
    let data = '';
    resp.on('data', (chunk) => { data += chunk; });
    resp.on('end', () => {
      try {
        const res = JSON.parse(data);
        const quote = res[0]['q'];
        const author = res[0]['a'];
        const line = `"${quote}" — ${author}\n`;
        fs.appendFileSync('quotes.txt', line);
        console.log('Quote added:', line.trim());

        // Git commit and push
        execSync('git add quotes.txt');
        execSync(`git commit -m "Add quote: ${quote.substring(0, 20)}..."`);
        execSync('git push');
      } catch (err) {
        // Fallback if something goes wrong
        const line = `"Default fallback quote" — Assistant\n`;
        fs.appendFileSync('quotes.txt', line);
        execSync('git add quotes.txt');
        execSync('git commit -m "Add fallback quote"');
        execSync('git push');
      }
      // Wait a bit, then do the next quote
      setTimeout(() => fetchAndCommitQuote(repeat - 1, done), 20000); // 20 sec delay
    });
  }).on("error", (err) => {
    const line = `"Default fallback quote" — Assistant\n`;
    fs.appendFileSync('quotes.txt', line);
    execSync('git add quotes.txt');
    execSync('git commit -m "Add fallback quote"');
    execSync('git push');
    setTimeout(() => fetchAndCommitQuote(repeat - 1, done), 20000);
  });
}

const howMany = getRandomInt(7, 25);
console.log(`Adding ${howMany} quotes (one commit each) today...`);

fetchAndCommitQuote(howMany, () => {
  console.log('All quotes committed.');
});
