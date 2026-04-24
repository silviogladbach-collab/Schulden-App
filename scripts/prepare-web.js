const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const target = path.join(projectRoot, "cloudflare-pages-upload");

function resetDir(dirPath) {
  fs.rmSync(dirPath, { recursive: true, force: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyIntoTarget(sourceName) {
  const source = path.join(projectRoot, sourceName);
  const destination = path.join(target, sourceName);
  fs.cpSync(source, destination, { recursive: true });
}

resetDir(target);
copyIntoTarget("assets");
copyIntoTarget("legal");
fs.copyFileSync(path.join(projectRoot, "index.html"), path.join(target, "index.html"));

process.stdout.write("Web-Dateien wurden nach cloudflare-pages-upload kopiert.\n");
