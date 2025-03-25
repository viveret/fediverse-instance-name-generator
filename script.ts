interface WordBanks {
    nouns: string[];
    adjectives: string[];
    verbs: string[];
    tlds: string[];
    templates: string[];
};

// Word lists with default values
let wordBanks: WordBanks = {
    adjectives: [],
    nouns: [],
    verbs: [],
    tlds: [],
    templates: [],
};

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
const randomTemplateCheckbox = document.getElementById('random-template') as HTMLInputElement;
const darkModeToggle = document.getElementById('darkModeToggle') as HTMLInputElement;

const adjectivesTitleTextOriginal = adjectivesListTitle.textContent;
const nounsTitleTextOriginal = nounsListTitle.textContent;
const verbsTitleTextOriginal = verbsListTitle.textContent;
const tldsTitleTextOriginal = tldsListTitle.textContent;

// Initialize the app
async function init() {
    // Check for saved user preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.checked = true;
    } else if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        darkModeToggle.checked = false;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // Use system preference if no saved preference
        document.documentElement.setAttribute('data-theme', 'dark');
        darkModeToggle.checked = true;
    }


    // Load default word lists
    wordBanks.adjectives = await loadWordList('words/adjectives.txt');
    wordBanks.nouns = await loadWordList('words/nouns.txt');
    wordBanks.verbs = await loadWordList('words/verbs.txt');
    wordBanks.tlds = await loadWordList('words/tlds.txt');
    wordBanks.templates = await loadWordList('words/templates.csv');

    // Populate textareas
    adjectivesTextarea.value = wordBanks.adjectives.join('\n');
    nounsTextarea.value = wordBanks.nouns.join('\n');
    verbsTextarea.value = wordBanks.verbs.join('\n');
    tldsTextarea.value = wordBanks.tlds.join('\n');

    // Update titles
    adjectivesListTitle.textContent = adjectivesTitleTextOriginal + ' (' + wordBanks.adjectives.length + ')';
    nounsListTitle.textContent = nounsTitleTextOriginal + ' (' + wordBanks.nouns.length + ')';
    verbsListTitle.textContent = verbsTitleTextOriginal + ' (' + wordBanks.verbs.length + ')';
    tldsListTitle.textContent = tldsTitleTextOriginal + ' (' + wordBanks.tlds.length + ')';

    // Load templates
    populateTemplateDropdown(wordBanks.templates);

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

    // Toggle dark mode
    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) { // Only if user hasn't set preference
            document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
            darkModeToggle.checked = e.matches;
        }
    });

    generateNames();
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

function capitalize(this: string): string {
    if (this.length == 0) return '';
    else if (this.length == 1) return this.toUpperCase();
    else {
        let c = this[0].toUpperCase();
        return c + this.substring(1);
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

        // Use random template if checkbox is checked
        if (randomTemplateCheckbox.checked && wordBanks.templates.length > 0) {
            let template = wordBanks.templates[Math.floor(Math.random() * wordBanks.templates.length)];
            let splitComma = template.indexOf(',');
            if (splitComma > 0) {
                let domainTemplateString = template.substring(0, splitComma).trim();
                let titleTemplateString = template.substring(splitComma + 1).trim();
                title = titleTemplateString;
                domain = domainTemplateString;
            }
        }

        type WordUsageTracker = {
            indexed: Record<string, string>; // Tracks words used by index (e.g., {noun.1})
            nonindexed: string[];             // Tracks words used without index (e.g., {noun})
        };
        
        const usedWords: Record<string, WordUsageTracker> = {
            noun: { indexed: {}, nonindexed: [] },
            adjective: { indexed: {}, nonindexed: [] },
            verb: { indexed: {}, nonindexed: [] },
            tld: { indexed: {}, nonindexed: [] }
        };

        // let adj = getRandomWord(adjectives);
        // let noun = getRandomWord(nouns);
        // let verb = getRandomWord(verbs);
        // let tld = getRandomWord(tlds);

        // Replace placeholders with selected words
        domain = generateNameFromTemplate(domain, String.prototype.toLowerCase);
        // domain = domain.replace(/\{adjective\}/g, () => adj.toLowerCase());
        // domain = domain.replace(/\{noun\}/g, () => noun.toLowerCase());
        // domain = domain.replace(/\{verb\}/g, () => verb.toLowerCase());
        // domain = domain.replace(/\{tld\}/g, () => tld.toLowerCase());
        domain = domain.replace(/(inging)/g, 'ing'); // in english this is from duplicate "ing"
        domain = domain.replace(/ /g, ""); // no spaces allowed

        title = generateNameFromTemplate(title, capitalize);
        // title = title.replace(/\{adjective\}/g, () => capitalize(adj));
        // title = title.replace(/\{noun\}/g, () => capitalize(noun));
        // title = title.replace(/\{verb\}/g, () => capitalize(verb));
        // title = title.replace(/\{tld\}/g, () => capitalize(tld));
        title = title.replace(/(inging)/g, 'ing'); // in english this is from duplicate "ing"

        function generateNameFromTemplate(template: string, modStrFn: Function) {
            let wordtypeNonIndexedPosition: Record<string, number> = {
                verb: 0,
                noun: 0,
                adjective: 0,
                tld: 0,
            };
            return template.replace(/\{([a-z]+)\.?(\d+)?\}/g, (match, wordType, index) => {
                const bank = wordBanks[`${wordType}s` as keyof WordBanks]; // Convert to plural
                if (!bank || bank.length === 0) {
                    console.log(`${wordType} bank is null or empty`);
                    return match;
                }

                let usedWordIndexStr = match.substring(1, match.length - 1).split('.')[1];
                if (usedWordIndexStr) {
                    let word = usedWords[wordType].indexed[usedWordIndexStr];
                    if (word) {
                        if (modStrFn) {
                            return modStrFn.call(word);
                        } else {
                            return word;
                        }
                    } else {
                        let word = getRandomWord(bank);
                        usedWords[wordType].indexed[usedWordIndexStr] = word;
                        if (modStrFn) {
                            return modStrFn.call(word);
                        } else {
                            return word;
                        }
                    }
                }
                
                if (wordtypeNonIndexedPosition[wordType] < usedWords[wordType].nonindexed.length) {
                    let word = usedWords[wordType].nonindexed[wordtypeNonIndexedPosition[wordType]];
                    if (modStrFn) {
                        return modStrFn.call(word);
                    } else {
                        return word;
                    }
                } else {                    
                    // Filter out already used words

                    // Get random word (remove used words if you want uniqueness)
                    let word = getRandomWord(bank);
                    usedWords[wordType].nonindexed[wordtypeNonIndexedPosition[wordType]] = word;
                    wordtypeNonIndexedPosition[wordType]++;
                    if (modStrFn) {
                        return modStrFn.call(word);
                    } else {
                        return word;
                    }
                }

              })/*.replace(/\{tld\}/g, () => {
                return getRandomWord(wordBanks.tlds);
                // return wordBanks.tlds[Math.floor(Math.random() * wordBanks.tlds.length)];
              })*/;
        }

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
        divDomain.textContent = '@' + result.domain.replace(/-/g, ''); // no dash allowed in handle
        divURL.textContent = 'https://' + result.domain;
        divURL.href = '#';
        divURL.onclick = () => { return false; }
        div.appendChild(divTitle);
        div.appendChild(divDomain);
        div.appendChild(document.createElement('br'));
        div.appendChild(divURL);
        div.style.backgroundColor = RGBcolor("50");
        div.style.borderColor = RGBcolor("100");
        div.style.borderWidth = '2px';
        outputDiv.appendChild(div);
    });
}

function RGBcolor(alpha: string) {
    var r = Math.floor(Math.random() * 25 + 75);
    var g = Math.floor(Math.random() * 25 + 75);
    var b = Math.floor(Math.random() * 25 + 75);
    return "rgba(" + r + "%," + g + "%," + b + "%, " + alpha + "%)";  
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
    wordBanks.adjectives = adjectivesTextarea.value.split('\n').filter(word => word.trim() !== '');
}

function updateNouns() {
    wordBanks.nouns = nounsTextarea.value.split('\n').filter(word => word.trim() !== '');
}

function updateVerbs() {
    wordBanks.verbs = verbsTextarea.value.split('\n').filter(word => word.trim() !== '');
}

function updateTlds() {
    wordBanks.tlds = tldsTextarea.value.split('\n').filter(word => word.trim() !== '');
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
                wordBanks.adjectives = words;
                adjectivesTextarea.value = words.join('\n');
                break;
            case 'nouns':
                wordBanks.nouns = words;
                nounsTextarea.value = words.join('\n');
                break;
            case 'verbs':
                wordBanks.verbs = words;
                verbsTextarea.value = words.join('\n');
                break;
            case 'tlds':
                wordBanks.tlds = words;
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
    saveToFile('adjectives.txt', wordBanks.adjectives.join('\n'));
    saveToFile('nouns.txt', wordBanks.nouns.join('\n'));
    saveToFile('verbs.txt', wordBanks.verbs.join('\n'));
    saveToFile('tlds.txt', wordBanks.verbs.join('\n'));
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
