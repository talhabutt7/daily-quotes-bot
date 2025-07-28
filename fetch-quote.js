const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');

// 1. First commit: today's date
const today = new Date().toISOString().slice(0, 10);
fs.appendFileSync('quotes.txt', `\n===== ${today} =====\n`);
console.log(`Date added: ${today}`);
execSync('git add quotes.txt');
execSync(`git commit -m "Log date: ${today}"`);
execSync('git push');

// 2. Proceed with quotes as before
function getRandomInt(min, max) {
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
        execSync('git add quotes.txt');
        execSync(`git commit -m "Add quote: ${quote.substring(0, 20)}..."`);
        execSync('git push');
      } catch (err) {
        const line = `"Default fallback quote" — Assistant\n`;
        fs.appendFileSync('quotes.txt', line);
        execSync('git add quotes.txt');
        execSync('git commit -m "Add fallback quote"');
        execSync('git push');
      }
      setTimeout(() => fetchAndCommitQuote(repeat - 1, done), 60000); // 60 sec delay
    });
  }).on("error", (err) => {
    const line = `"Default fallback quote" — Assistant\n`;
    fs.appendFileSync('quotes.txt', line);
    execSync('git add quotes.txt');
    execSync('git commit -m "Add fallback quote"');
    execSync('git push');
    setTimeout(() => fetchAndCommitQuote(repeat - 1, done), 60000);
  });
}

const howMany = getRandomInt(7, 25);
console.log(`Adding ${howMany} quotes (one commit each) today...`);

fetchAndCommitQuote(howMany, () => {
  console.log('All quotes committed.');
});
