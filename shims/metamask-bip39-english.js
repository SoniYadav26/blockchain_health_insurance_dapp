"use strict";

// Must load the real CJS file by path. Do not require the package id —
// next.config aliases that id back to this shim (infinite loop).
const english = require("../node_modules/@metamask/scure-bip39/dist/wordlists/english.js");
const wordlist = english.wordlist;

module.exports = { wordlist };
module.exports.wordlist = wordlist;
module.exports.default = { wordlist };
module.exports.__esModule = true;
