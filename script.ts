// Word lists with default values
let adjectives: string[] = [];
let nouns: string[] = [];
let verbs: string[] = [];
let tlds: string[] = [];

// DOM elements
const templateInputTitle = document.getElementById('title-template') as HTMLInputElement;
const templateInputDomain = document.getElementById('domain-template') as HTMLInputElement;
const countInput = document.getElementById('count') as HTMLInputElement;
const generateButton = document.getElementById('generate') as HTMLButtonElement;
const saveWordsButton = document.getElementById('save-words') as HTMLButtonElement;
const adjectivesTextarea = document.getElementById('adjectives') as HTMLTextAreaElement;
const nounsTextarea = document.getElementById('nouns') as HTMLTextAreaElement;
const verbsTextarea = document.getElementById('verbs') as HTMLTextAreaElement;
const tldsTextarea = document.getElementById('tlds') as HTMLTextAreaElement;
const uploadAdjectives = document.getElementById('upload-adjectives') as HTMLInputElement;
const uploadNouns = document.getElementById('upload-nouns') as HTMLInputElement;
const uploadVerbs = document.getElementById('upload-verbs') as HTMLInputElement;
const uploadTlds = document.getElementById('upload-tlds') as HTMLInputElement;
const outputDiv = document.getElementById('output') as HTMLDivElement;
const adjectivesListTitle = document.getElementById('adjectives-list-title') as HTMLHeadingElement;
const nounsListTitle = document.getElementById('nouns-list-title') as HTMLHeadingElement;
const verbsListTitle = document.getElementById('verbs-list-title') as HTMLHeadingElement;
const tldsListTitle = document.getElementById('tlds-list-title') as HTMLHeadingElement;
const templateSelect = document.getElementById('template-select') as HTMLSelectElement;

const adjectivesTitleTextOriginal = adjectivesListTitle.textContent;
const nounsTitleTextOriginal = nounsListTitle.textContent;
const verbsTitleTextOriginal = verbsListTitle.textContent;
const tldsTitleTextOriginal = tldsListTitle.textContent;

// Initialize the app
async function init() {
    // Load default word lists
    adjectives = await loadWordList('words/adjectives.txt');
    nouns = await loadWordList('words/nouns.txt');
    verbs = await loadWordList('words/verbs.txt');
    tlds = await loadWordList('words/tlds.txt');

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
    const templates = await loadWordList('words/templates.csv');
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
}

function populateTemplateDropdown(templates: string[]) {
    templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template;
        option.textContent = template;
        templateSelect.appendChild(option);
    });
}

// Load a word list from a file
async function loadWordList(path: string): Promise<string[]> {
    try {
        const response = await fetch(path);
        const text = await response.text();
        return text.split('\n').map(word => word.trim()).filter(word => word !== '');
    } catch (error) {
        console.error(`Error loading word list from ${path}:`, error);
        return [];
    }
}

function capitalize(s: string): string {
    if (s.length == 0) return '';
    else if (s.length == 1) return s.toUpperCase();
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
    const results: any[] = [];

    for (let i = 0; i < count; i++) {
        let domain = templateDomain;
        let title = templateTitle;

        let adj = getRandomWord(adjectives);
        let noun = getRandomWord(nouns);
        let verb = getRandomWord(verbs);
        let tld = getRandomWord(tlds);

        // Replace placeholders with selected words
        domain = domain.replace(/\{adjective\}/g, () => adj.toLowerCase());
        domain = domain.replace(/\{noun\}/g, () => noun.toLowerCase());
        domain = domain.replace(/\{verb\}/g, () => verb.toLowerCase());
        domain = domain.replace(/\{tld\}/g, () => tld.toLowerCase());
        domain = domain.replace('inging', 'ing'); // in english this is from duplicate "ing"
        domain = domain.replace(' ', ''); // no spaces allowed

        title = title.replace(/\{adjective\}/g, () => capitalize(adj));
        title = title.replace(/\{noun\}/g, () => capitalize(noun));
        title = title.replace(/\{verb\}/g, () => capitalize(verb));
        title = title.replace(/\{tld\}/g, () => capitalize(tld));
        title = title.replace('inging', 'ing'); // in english this is from duplicate "ing"

        results.push({ title, domain });
    }

    displayResults(results);
}

// Display generated names
function displayResults(results: any[]) {
    outputDiv.innerHTML = '';

    results.forEach(result => {
        const div = document.createElement('div');
        const divTitle = document.createElement('h3');
        const divDomain = document.createElement('i');
        const divURL = document.createElement('a');
        divTitle.textContent = result.title;
        divDomain.textContent = '@' + result.domain;
        divURL.textContent = 'https://' + result.domain;
        divURL.href = '#';
        divURL.onclick = () => { return false; }
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
function getRandomWord(list: string[]): string {
    if (list.length === 0) return '';
    else if (list.length === 1) return list[0];

    let numAttempts = 0;
    while (numAttempts < 10) {
        const index = Math.floor(Math.random() * list.length);
        if (list[index][0] != '#') {
            return list[index];
        } else {
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
function handleFileUpload(type: 'adjectives' | 'nouns' | 'verbs' | 'tlds', event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target?.result as string;
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

function saveToFile(filename: string, content: string) {
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
