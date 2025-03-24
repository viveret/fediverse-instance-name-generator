"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Word lists with default values
let adjectives = [];
let nouns = [];
let verbs = [];
let tlds = [];
let templates = [];
// DOM elements
const templateInputTitle = document.getElementById('title-template');
const templateInputDomain = document.getElementById('domain-template');
const countInput = document.getElementById('count');
const generateButton = document.getElementById('generate');
const saveWordsButton = document.getElementById('save-words');
const adjectivesTextarea = document.getElementById('adjectives');
const nounsTextarea = document.getElementById('nouns');
const verbsTextarea = document.getElementById('verbs');
const tldsTextarea = document.getElementById('tlds');
const uploadAdjectives = document.getElementById('upload-adjectives');
const uploadNouns = document.getElementById('upload-nouns');
const uploadVerbs = document.getElementById('upload-verbs');
const uploadTlds = document.getElementById('upload-tlds');
const outputDiv = document.getElementById('output');
const adjectivesListTitle = document.getElementById('adjectives-list-title');
const nounsListTitle = document.getElementById('nouns-list-title');
const verbsListTitle = document.getElementById('verbs-list-title');
const tldsListTitle = document.getElementById('tlds-list-title');
const templateSelect = document.getElementById('template-select');
const randomTemplateCheckbox = document.getElementById('random-template');
const adjectivesTitleTextOriginal = adjectivesListTitle.textContent;
const nounsTitleTextOriginal = nounsListTitle.textContent;
const verbsTitleTextOriginal = verbsListTitle.textContent;
const tldsTitleTextOriginal = tldsListTitle.textContent;
// Initialize the app
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        // Load default word lists
        adjectives = yield loadWordList('words/adjectives.txt');
        nouns = yield loadWordList('words/nouns.txt');
        verbs = yield loadWordList('words/verbs.txt');
        tlds = yield loadWordList('words/tlds.txt');
        templates = yield loadWordList('words/templates.csv');
        // Populate textareas
        adjectivesTextarea.value = adjectives.join('\n');
        nounsTextarea.value = nouns.join('\n');
        verbsTextarea.value = verbs.join('\n');
        tldsTextarea.value = tlds.join('\n');
        // Update titles
        adjectivesListTitle.textContent = adjectivesTitleTextOriginal + ' (' + adjectives.length + ')';
        nounsListTitle.textContent = nounsTitleTextOriginal + ' (' + nouns.length + ')';
        verbsListTitle.textContent = verbsTitleTextOriginal + ' (' + verbs.length + ')';
        tldsListTitle.textContent = tldsTitleTextOriginal + ' (' + tlds.length + ')';
        // Load templates
        populateTemplateDropdown(templates);
        // Set up event listeners
        generateButton.addEventListener('click', generateNames);
        saveWordsButton.addEventListener('click', saveWordLists);
        adjectivesTextarea.addEventListener('change', updateAdjectives);
        nounsTextarea.addEventListener('change', updateNouns);
        verbsTextarea.addEventListener('change', updateVerbs);
        tldsTextarea.addEventListener('change', updateTlds);
        uploadAdjectives.addEventListener('change', handleFileUpload.bind(null, 'adjectives'));
        uploadNouns.addEventListener('change', handleFileUpload.bind(null, 'nouns'));
        uploadVerbs.addEventListener('change', handleFileUpload.bind(null, 'verbs'));
        uploadTlds.addEventListener('change', handleFileUpload.bind(null, 'tlds'));
        // Set up template selection
        templateSelect.addEventListener('change', () => {
            if (templateSelect.value) {
                let splitComma = templateSelect.value.indexOf(',');
                if (splitComma > 0) {
                    let domainTemplateString = templateSelect.value.substring(0, splitComma).trim();
                    let titleTemplateString = templateSelect.value.substring(splitComma + 1).trim();
                    templateInputTitle.value = titleTemplateString;
                    templateInputDomain.value = domainTemplateString;
                }
            }
        });
        generateNames();
    });
}
function populateTemplateDropdown(templates) {
    templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template;
        option.textContent = template;
        templateSelect.appendChild(option);
    });
}
// Load a word list from a file
function loadWordList(path) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(path);
            const text = yield response.text();
            return text.split('\n').map(word => word.trim()).filter(word => word !== '');
        }
        catch (error) {
            console.error(`Error loading word list from ${path}:`, error);
            return [];
        }
    });
}
function capitalize(s) {
    if (s.length == 0)
        return '';
    else if (s.length == 1)
        return s.toUpperCase();
    else {
        let c = s[0].toUpperCase();
        return c + s.substring(1);
    }
}
// Generate random names
function generateNames() {
    const templateTitle = templateInputTitle.value.trim();
    const templateDomain = templateInputDomain.value.trim();
    const count = parseInt(countInput.value);
    const results = [];
    for (let i = 0; i < count; i++) {
        let domain = templateDomain;
        let title = templateTitle;
        // Use random template if checkbox is checked
        if (randomTemplateCheckbox.checked && templates.length > 0) {
            let template = templates[Math.floor(Math.random() * templates.length)];
            let splitComma = template.indexOf(',');
            if (splitComma > 0) {
                let domainTemplateString = template.substring(0, splitComma).trim();
                let titleTemplateString = template.substring(splitComma + 1).trim();
                title = titleTemplateString;
                domain = domainTemplateString;
            }
        }
        let adj = getRandomWord(adjectives);
        let noun = getRandomWord(nouns);
        let verb = getRandomWord(verbs);
        let tld = getRandomWord(tlds);
        // Replace placeholders with selected words
        domain = domain.replace(/\{adjective\}/g, () => adj.toLowerCase());
        domain = domain.replace(/\{noun\}/g, () => noun.toLowerCase());
        domain = domain.replace(/\{verb\}/g, () => verb.toLowerCase());
        domain = domain.replace(/\{tld\}/g, () => tld.toLowerCase());
        domain = domain.replace(/(inging)/g, 'ing'); // in english this is from duplicate "ing"
        domain = domain.replace(/ /g, ""); // no spaces allowed
        title = title.replace(/\{adjective\}/g, () => capitalize(adj));
        title = title.replace(/\{noun\}/g, () => capitalize(noun));
        title = title.replace(/\{verb\}/g, () => capitalize(verb));
        title = title.replace(/\{tld\}/g, () => capitalize(tld));
        title = title.replace(/(inging)/g, 'ing'); // in english this is from duplicate "ing"
        results.push({ title, domain });
    }
    displayResults(results);
}
// Display generated names
function displayResults(results) {
    outputDiv.innerHTML = '';
    results.forEach(result => {
        const div = document.createElement('div');
        const divTitle = document.createElement('h3');
        const divDomain = document.createElement('i');
        const divURL = document.createElement('a');
        divTitle.textContent = result.title;
        divDomain.textContent = '@' + result.domain.replace(/-/g, ''); // no dash allowed in handle
        divURL.textContent = 'https://' + result.domain;
        divURL.href = '#';
        divURL.onclick = () => { return false; };
        div.appendChild(divTitle);
        div.appendChild(divDomain);
        div.appendChild(document.createElement('br'));
        div.appendChild(divURL);
        div.style.backgroundColor = RGBcolor();
        outputDiv.appendChild(div);
    });
}
function RGBcolor() {
    var r = Math.floor(Math.random() * 25 + 75);
    var g = Math.floor(Math.random() * 25 + 75);
    var b = Math.floor(Math.random() * 25 + 75);
    return "rgb(" + r + "%," + g + "%," + b + "%)";
}
// Get a random word from a list
function getRandomWord(list) {
    if (list.length === 0)
        return '';
    else if (list.length === 1)
        return list[0];
    let numAttempts = 0;
    while (numAttempts < 10) {
        const index = Math.floor(Math.random() * list.length);
        if (list[index][0] != '#') {
            return list[index];
        }
        else {
            numAttempts++;
        }
    }
    return "<error>";
}
// Update word lists from textareas
function updateAdjectives() {
    adjectives = adjectivesTextarea.value.split('\n').filter(word => word.trim() !== '');
}
function updateNouns() {
    nouns = nounsTextarea.value.split('\n').filter(word => word.trim() !== '');
}
function updateVerbs() {
    verbs = verbsTextarea.value.split('\n').filter(word => word.trim() !== '');
}
function updateTlds() {
    tlds = tldsTextarea.value.split('\n').filter(word => word.trim() !== '');
}
// Handle file uploads
function handleFileUpload(type, event) {
    var _a;
    const input = event.target;
    const file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = (e) => {
        var _a;
        const content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
        const words = content.split('\n').filter(word => word.trim() !== '');
        switch (type) {
            case 'adjectives':
                adjectives = words;
                adjectivesTextarea.value = words.join('\n');
                break;
            case 'nouns':
                nouns = words;
                nounsTextarea.value = words.join('\n');
                break;
            case 'verbs':
                verbs = words;
                verbsTextarea.value = words.join('\n');
                break;
            case 'tlds':
                tlds = words;
                tldsTextarea.value = words.join('\n');
                break;
        }
        // Reset file input
        input.value = '';
    };
    reader.readAsText(file);
}
// Save word lists to files
function saveWordLists() {
    saveToFile('adjectives.txt', adjectives.join('\n'));
    saveToFile('nouns.txt', nouns.join('\n'));
    saveToFile('verbs.txt', verbs.join('\n'));
    saveToFile('tlds.txt', verbs.join('\n'));
}
function saveToFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
// Initialize the application
init();
