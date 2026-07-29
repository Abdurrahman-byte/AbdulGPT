// 1. DOM Elements & State Variables

const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const attachBtn = document.getElementById('attach-btn');
const fileInput = document.getElementById('file-input');
const filePreviewBar = document.getElementById('file-preview-bar');
const filePreviewName = document.getElementById('file-preview-name');
const removeFileBtn = document.getElementById('remove-file-btn');

// Conversation Memory State
let conversationHistory = [];

// File Attachment State Variables
let attachedFile = null;
let attachedImageBase64 = null;
let attachedTextContent = null;


// 2. Theme Toggle Logic (Light / Dark Mode)

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.documentElement.classList.remove('dark');
        themeIcon.innerText = '☀️';
    } else {
        document.documentElement.classList.add('dark');
        themeIcon.innerText = '🌙';
    }
}

themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeIcon.innerText = isDark ? '🌙' : '☀️';
});

initTheme();

// 3. File Attachment Logic

attachBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    attachedFile = file;
    filePreviewName.innerText = `📎 ${file.name}`;
    filePreviewBar.classList.remove('hidden');

    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
        reader.onload = (evt) => {
            attachedImageBase64 = evt.target.result;
            attachedTextContent = null;
        };
        reader.readAsDataURL(file);
    } else {
        reader.onload = (evt) => {
            attachedTextContent = evt.target.result;
            attachedImageBase64 = null;
        };
        reader.readAsText(file);
    }
});

removeFileBtn.addEventListener('click', clearAttachment);

function clearAttachment() {
    attachedFile = null;
    attachedImageBase64 = null;
    attachedTextContent = null;
    fileInput.value = '';
    filePreviewBar.classList.add('hidden');
}


// 4. Chat Form Submission & API Request

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let message = userInput.value.trim();

    // Prevent submitting empty messages with no files attached
    if (!message && !attachedImageBase64 && !attachedTextContent) return;

    let displayMessage = message;

    // Handle attached text/code file formatting
    if (attachedTextContent) {
        displayMessage = (message ? `${message}\n\n` : '') + `[Attached File: ${attachedFile.name}]`;
        message = `${message}\n\n--- Contents of attached file (${attachedFile.name}) ---\n${attachedTextContent}`;
    } else if (attachedImageBase64 && !message) {
        displayMessage = `[Attached Image: ${attachedFile.name}]`;
    }

    // 1. Render User Message on the UI
    appendMessage(displayMessage, 'user');
    userInput.value = '';

    // 2. Append User Message to local Conversation Memory
    conversationHistory.push({
        role: "user",
        content: message
    });

    // Prepare JSON Payload
    const payload = {
        messages: conversationHistory,
        image: attachedImageBase64
    };

    clearAttachment();

    // 3. Render Bot Thinking State
    const botMessageDiv = appendMessage('Thinking...', 'bot');
    botMessageDiv.classList.add('thinking-pulse');

    try {
        // Send conversation history to Flask backend
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        botMessageDiv.classList.remove('thinking-pulse');

        if (data.response) {
            botMessageDiv.innerText = data.response;

            // 4. Append Bot Response to Conversation Memory for subsequent turns
            conversationHistory.push({
                role: "assistant",
                content: data.response
            });
        } else {
            botMessageDiv.innerText = data.error || "Error fetching response.";
        }
    } catch (err) {
        botMessageDiv.classList.remove('thinking-pulse');
        botMessageDiv.innerText = "Error connecting to backend.";
    }
});


// 5. Helper Functions

function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' 
        ? 'bg-emerald-600 text-white ml-auto max-w-md p-3 rounded-lg text-sm font-medium whitespace-pre-wrap' 
        : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mr-auto max-w-md p-3 rounded-lg text-sm whitespace-pre-wrap';
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
}