const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", (err) => {
    console.error("DOM ERROR:", err);
});
virtualConsole.on("jsdomError", (err) => {
    console.error("JSDOM Error:", err);
});
virtualConsole.on("log", (msg) => {
    console.log("DOM LOG:", msg);
});

const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: "usable",
    virtualConsole
});
setTimeout(() => {
    console.log("MOTIVATIONAL:", dom.window.document.getElementById('motivational-text').innerText);
}, 2000);
