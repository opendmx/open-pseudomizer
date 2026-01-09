// Application state
let originalData = null;
let pseudonymizedData = null;
let customData = null;
let apiToken = '';

// DOM Elements
const apiTokenInput = document.getElementById('apiToken');
const promptTextArea = document.getElementById('promptText');
const fileInput = document.getElementById('fileInput');
const fileNameDisplay = document.getElementById('fileName');
const customDataInput = document.getElementById('customDataInput');
const customDataFileNameDisplay = document.getElementById('customDataFileName');
const pseudonymizeBtn = document.getElementById('pseudonymizeBtn');
const loadingSection = document.getElementById('loadingSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const downloadBtn = document.getElementById('downloadBtn');
const resetBtn = document.getElementById('resetBtn');

// Event Listeners
apiTokenInput.addEventListener('input', updateButtonState);
fileInput.addEventListener('change', handleFileSelect);
customDataInput.addEventListener('change', handleCustomDataSelect);
pseudonymizeBtn.addEventListener('click', handlePseudonymize);
downloadBtn.addEventListener('click', handleDownload);
resetBtn.addEventListener('click', handleReset);

// Tab functionality
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        switchTab(tabName);
    });
});

function updateButtonState() {
    apiToken = apiTokenInput.value.trim();
    const hasToken = apiToken.length > 0;
    const hasFile = originalData !== null;
    pseudonymizeBtn.disabled = !(hasToken && hasFile);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    fileNameDisplay.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            originalData = JSON.parse(e.target.result);
            updateButtonState();
            hideError();
        } catch (error) {
            showError('Invalid JSON file. Please upload a valid JSON file.');
            originalData = null;
            updateButtonState();
        }
    };
    reader.readAsText(file);
}

function handleCustomDataSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    customDataFileNameDisplay.textContent = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsedData = JSON.parse(e.target.result);
            
            // Validate custom data structure
            if (!parsedData || typeof parsedData !== 'object') {
                throw new Error('Custom data must be a JSON object');
            }
            
            // Check if at least one category exists
            const hasNames = parsedData.names && (parsedData.names.firstNames || parsedData.names.lastNames);
            const hasAddresses = parsedData.addresses && (
                parsedData.addresses.streets || 
                parsedData.addresses.cities || 
                parsedData.addresses.buildings || 
                parsedData.addresses.apartments
            );
            
            if (!hasNames && !hasAddresses) {
                throw new Error('Custom data must contain at least names or addresses');
            }
            
            customData = parsedData;
            hideError();
        } catch (error) {
            showError(`Invalid custom data JSON file: ${error.message}. Please check the file format.`);
            customData = null;
            customDataFileNameDisplay.textContent = 'Optional: Choose custom data file...';
        }
    };
    reader.readAsText(file);
}

async function handlePseudonymize() {
    if (!originalData || !apiToken) return;

    showLoading();
    hideError();
    hideResults();

    try {
        pseudonymizedData = await pseudonymizeData(originalData);
        displayResults();
        hideLoading();
    } catch (error) {
        hideLoading();
        showError(`Pseudonymization failed: ${error.message}`);
    }
}

async function pseudonymizeData(data) {
    // Convert data to string for AI processing
    const dataStr = JSON.stringify(data, null, 2);

    // Get the prompt template from the textarea
    let promptTemplate = promptTextArea.value.trim();
    
    // If custom data is available, add instructions to use it
    if (customData) {
        const customDataStr = JSON.stringify(customData, null, 2);
        const customDataInstructions = `\n\nIMPORTANT: Use the following custom data for pseudonymization:\n${customDataStr}\n\nWhen replacing names, use names from the provided firstNames and lastNames lists. When replacing addresses, use addresses from the provided streets, cities, buildings, and apartments lists. Randomly combine these elements to create realistic addresses.`;
        promptTemplate = promptTemplate + customDataInstructions;
    }
    
    // Replace {DATA} placeholder with actual data
    const prompt = promptTemplate.replace('{DATA}', dataStr);

    try {
        const response = await callGitHubModelsAPI(prompt);
        
        // Extract JSON from response, handling potential markdown code blocks
        let jsonStr = response.trim();
        
        // Remove markdown code blocks if present
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\n?$/g, '');
        }
        
        // Parse and return
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Pseudonymization error:', error);
        throw new Error(`Failed to pseudonymize data: ${error.message}`);
    }
}

async function callGitHubModelsAPI(prompt) {
    const endpoint = 'https://models.inference.ai.azure.com/chat/completions';
    
    const requestBody = {
        messages: [
            {
                role: "system",
                content: "You are a helpful AI assistant that pseudonymizes personal data. Always return valid JSON without markdown formatting."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 4000
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || data.choices.length === 0) {
            throw new Error('No response from API');
        }

        return data.choices[0].message.content;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

function displayResults() {
    // Display original data
    document.getElementById('originalData').textContent = JSON.stringify(originalData, null, 2);
    
    // Display pseudonymized data
    document.getElementById('pseudonymizedData').textContent = JSON.stringify(pseudonymizedData, null, 2);
    
    // Display comparison
    displayComparison();
    
    resultsSection.style.display = 'block';
}

function displayComparison() {
    const comparisonView = document.getElementById('comparisonView');
    comparisonView.innerHTML = '';

    const changes = findChanges(originalData, pseudonymizedData);
    
    if (changes.length === 0) {
        comparisonView.innerHTML = '<p>No changes detected.</p>';
        return;
    }

    changes.forEach(change => {
        const item = document.createElement('div');
        item.className = 'comparison-item';
        
        item.innerHTML = `
            <h4>${change.path}</h4>
            <div class="comparison-row">
                <div class="comparison-col original-col">
                    <strong>Original</strong>
                    <code>${escapeHtml(String(change.original))}</code>
                </div>
                <div class="comparison-col pseudonymized-col">
                    <strong>Pseudonymized</strong>
                    <code>${escapeHtml(String(change.pseudonymized))}</code>
                </div>
            </div>
        `;
        
        comparisonView.appendChild(item);
    });
}

function findChanges(original, pseudonymized, path = '') {
    const changes = [];

    if (Array.isArray(original) && Array.isArray(pseudonymized)) {
        const maxLen = Math.max(original.length, pseudonymized.length);
        for (let i = 0; i < maxLen; i++) {
            const newPath = `${path}[${i}]`;
            if (i < original.length && i < pseudonymized.length) {
                changes.push(...findChanges(original[i], pseudonymized[i], newPath));
            }
        }
    } else if (typeof original === 'object' && original !== null && 
               typeof pseudonymized === 'object' && pseudonymized !== null) {
        const allKeys = new Set([...Object.keys(original), ...Object.keys(pseudonymized)]);
        allKeys.forEach(key => {
            const newPath = path ? `${path}.${key}` : key;
            if (key in original && key in pseudonymized) {
                changes.push(...findChanges(original[key], pseudonymized[key], newPath));
            }
        });
    } else if (original !== pseudonymized) {
        changes.push({
            path: path || 'root',
            original: original,
            pseudonymized: pseudonymized
        });
    }

    return changes;
}

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // Update tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function handleDownload() {
    if (!pseudonymizedData) return;

    const dataStr = JSON.stringify(pseudonymizedData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pseudonymized-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleReset() {
    originalData = null;
    pseudonymizedData = null;
    customData = null;
    fileInput.value = '';
    customDataInput.value = '';
    fileNameDisplay.textContent = 'Choose a JSON file...';
    customDataFileNameDisplay.textContent = 'Optional: Choose custom data file...';
    hideResults();
    hideError();
    updateButtonState();
}

function showLoading() {
    loadingSection.style.display = 'block';
}

function hideLoading() {
    loadingSection.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
}

function hideError() {
    errorSection.style.display = 'none';
}

function hideResults() {
    resultsSection.style.display = 'none';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
