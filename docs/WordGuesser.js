'use strict';

let words;

async function loadWords() {
  const response = await fetch("https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt");
   if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const body = await response.text();
  const result = new Set(body.split("\n").map(line => line.trim().toUpperCase()));
  return result;
}

async function initOnce() {
  words = await loadWords();
  alert("loaded " + words.size + " words.");
}

// Generate all permutations of the given string.
function permutations(available, minLength = 3) {
  const result = new Set();
  function helper(soFar, available) {
    if (soFar.length >= minLength) {
      result.add(soFar);
    }
    Array.from(available).forEach((next, index) => {
      helper(soFar + next, available.substring(0, index) + available.substring(index+1));
    });
  }
  helper("", available);
  return result;
}

// What results are we displaying?
// This is a global variable only debugging and development.
const currentlyDisplayed = [];

// Only display words matching this regular expression.
let re;  

function availableChanged() {
  const availableInput = document.getElementById("available");
  const output = document.getElementById("output");
  output.innerText = "";
  const available = availableInput.value.trim().toUpperCase();
  currentlyDisplayed.length = 0;
  permutations(available).forEach(string => {
    if (words.has(string) && re.test(string)) {
      const div = document.createElement("div");
      div.innerText = string;
      output.appendChild(div);
      currentlyDisplayed.push(string);
    }
  });
}

function makeRegularExpression(input) {
  input = input.trim().toUpperCase();
  let reSource = "";
  Array.from(input).forEach(char => {
    if (/[A-Z]/.test(char)) {
      reSource += char;
    } else {
      reSource += ".";
    }
  });
  if (reSource != "") {
    reSource = "^" + reSource + "$";
  }
  // TODO check for errors?  If the available letters are "ABBC" and the pattern is "C?C", that second C should be drawn in red.
  return new RegExp(reSource);
}

function patternChanged() {
  const patternInput = document.getElementById("pattern");
  const showAllButton = document.getElementById("show all");
  const reDebugOut = document.getElementById("regex");
  const pattern = patternInput.value;
  showAllButton.disabled = pattern == "";
  re = makeRegularExpression(pattern);
  reDebugOut.innerText = re.toString();
}

function updateGUI() {
  patternChanged();
  availableChanged();
}

function showAll() {
  const patternInput = document.getElementById("pattern");
  patternInput.value = "";
  patternChanged();
}
