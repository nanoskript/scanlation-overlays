const fs = require("fs");

const applyScript = fs.readFileSync("src/apply.js", "utf8");
const searchScript = fs.readFileSync("src/search.js", "utf8");

fs.rmSync("build", { recursive: true, force: true });
fs.mkdirSync("build");

// Generate apply script that can be imported.
fs.writeFileSync(
  "build/apply.js",
  [applyScript, `export { apply };`].join("\n"),
);
