document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatBox = document.getElementById('chat-box');
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const fileInput = document.getElementById('file-input');
    const attachBtn = document.getElementById('attach-btn');
    const filePreviewBar = document.getElementById('file-preview-bar');
    const filePreviewName = document.getElementById('file-preview-name');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const modelSelect = document.getElementById('model-select');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const conversationList = document.getElementById('conversation-list');
    const newChatBtn = document.getElementById('new-chat-btn');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    // State Variables
    let currentSessionId = localStorage.getItem('abdulgpt_session_id') || `session_${Date.now()}`;
    localStorage.setItem('abdulgpt_session_id', currentSessionId);

    let conversationHistory = [];
    let currentAttachment = null; // Holds { type: 'image'|'pdf'|'file', name, data, pdfText }

    // --- Initialization ---
    initTheme();
    loadSessions();
    loadHistory(currentSessionId);

    // --- Dynamic Textarea Auto-Resize ---
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = `${Math.min(userInput.scrollHeight, 160)}px`;
    });

    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // --- Theme Toggle Logic ---
    function initTheme() {
        const isDark = localStorage.getItem('theme') !== 'light';
        if (isDark) {
            document.documentElement.classList.add('dark');
            if (themeIcon) themeIcon.textContent = '🌙';
        } else {
            document.documentElement.classList.remove('dark');
            if (themeIcon) themeIcon.textContent = '☀️';
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if (themeIcon) themeIcon.textContent = isDark ? '🌙' : '☀️';
        });
    }

    // --- File Attachment Handling ---
    attachBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        showPreview(file.name, "Uploading...");

        const res = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        // 1. Check if the response content type is JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            const htmlText = await res.text();
            console.error("Server HTML Response:", htmlText);
            if (res.status === 413) {
                throw new Error("File is too large! Max limit is 16MB.");
            }
            throw new Error(`Server returned status ${res.status} (HTML error page).`);
        }

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || `Upload failed with status ${res.status}`);
        }

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                currentAttachment = {
                    type: 'image',
                    name: file.name,
                    data: event.target.result
                };
                showPreview(file.name);
            };
            reader.readAsDataURL(file);
        } else {
            currentAttachment = {
                type: file.type.includes('pdf') ? 'pdf' : 'file',
                name: file.name,
                pdfText: data.extracted_text || ''
            };
            showPreview(file.name);
        }
    } catch (err) {
        console.error('[Upload Failed]:', err);
        alert(`Upload Failed: ${err.message}`);
        clearPreviewBar();
    }
});
    removeFileBtn.addEventListener('click', clearPreviewBar);

    function showPreview(filename, status = null) {
        filePreviewName.textContent = status ? `${filename} (${status})` : filename;
        filePreviewBar.classList.remove('hidden');
    }

    function clearPreviewBar() {
        currentAttachment = null;
        fileInput.value = '';
        filePreviewBar.classList.add('hidden');
        filePreviewName.textContent = '';
    }

    // --- Message Rendering Helpers ---
    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, (m) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m]));
    }

    function appendUserMessage(text, attachment = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex flex-col items-end max-w-3xl ml-auto mb-4';

        let attachmentHtml = '';

        if (attachment) {
            if (attachment.type === 'image') {
                attachmentHtml = `
                    <div class="mb-2">
                        <img src="${attachment.data}" alt="Uploaded Image" class="max-w-xs max-h-48 rounded-xl object-cover border border-zinc-300 dark:border-zinc-700 shadow-sm" />
                    </div>
                `;
            } else if (attachment.type === 'pdf' || attachment.type === 'file') {
                attachmentHtml = `
                    <div class="mb-2 flex items-center gap-2 bg-emerald-700/80 text-white px-3 py-2 rounded-xl text-xs max-w-xs shadow-sm">
                        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                        <span class="truncate font-medium">${escapeHtml(attachment.name)}</span>
                    </div>
                `;
            }
        }

        const displayText = text.trim() ? `<div>${escapeHtml(text)}</div>` : '';

        messageDiv.innerHTML = `
            ${attachmentHtml}
            ${displayText ? `<div class="bg-emerald-600 text-white p-3.5 px-4 rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">${displayText}</div>` : ''}
        `;

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function appendBotMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start max-w-3xl mb-4';

    // Parse Markdown using marked.js, or fallback to plain text if marked isn't loaded
    const parsedContent = typeof marked !== 'undefined' ? marked.parse(text) : escapeHtml(text);

    messageDiv.innerHTML = `
        <div class="bot-markdown-content flex-1 bg-gray-100 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-800/80 p-4 rounded-2xl rounded-tl-sm text-gray-800 dark:text-zinc-200 text-sm leading-relaxed shadow-sm">
            ${parsedContent}
        </div>
    `;

    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

    function appendLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'bot-loading';
        loadingDiv.className = 'flex items-start max-w-3xl mb-4';
        loadingDiv.innerHTML = `
            <div class="bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-4 rounded-2xl rounded-tl-sm text-gray-500 dark:text-zinc-400 text-xs flex items-center gap-2">
                <span class="animate-pulse">Thinking...</span>
            </div>
        `;
        chatBox.appendChild(loadingDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function removeLoadingIndicator() {
        const loadingDiv = document.getElementById('bot-loading');
        if (loadingDiv) loadingDiv.remove();
    }

    // --- Form Submission / Chat Logic ---
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const messageText = userInput.value.trim();
        if (!messageText && !currentAttachment) return;

        // Save current attachment reference for local rendering
        const attachmentToSend = currentAttachment;

        // Reset input fields immediately
        userInput.value = '';
        userInput.style.height = 'auto';
        clearPreviewBar();

        // 1. Render User Message with File Visual Badge in UI
        appendUserMessage(messageText, attachmentToSend);

        // 2. Prepare Payload Text Context for AI
        let formattedContent = messageText;
        if (attachmentToSend && attachmentToSend.pdfText) {
            formattedContent = `[Attached Document: ${attachmentToSend.name}]\n${attachmentToSend.pdfText}\n\nUser Question: ${messageText}`;
        }

        // Add to local history stack
        conversationHistory.push({ role: 'user', content: formattedContent });

        const selectedModel = modelSelect ? modelSelect.value : 'llama-3.3-70b-versatile';

        const payload = {
            session_id: currentSessionId,
            model: selectedModel,
            messages: conversationHistory,
            image: attachmentToSend?.type === 'image' ? attachmentToSend.data : null
        };

        appendLoadingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            removeLoadingIndicator();

            if (data.error) {
                appendBotMessage(`Error: ${data.error}`);
            } else {
                appendBotMessage(data.response);
                conversationHistory.push({ role: 'assistant', content: data.response });
                loadSessions(); // Refresh sidebar threads
            }
        } catch (err) {
            removeLoadingIndicator();
            appendBotMessage("Error: Could not reach the server.");
            console.error(err);
        }
    });

    // --- Session & History Management ---
    async function loadSessions() {
        if (!conversationList) return;
        try {
            const res = await fetch('/sessions');
            const sessions = await res.json();

            conversationList.innerHTML = '';
            sessions.forEach(s => {
                const btn = document.createElement('button');
                btn.className = `w-full text-left px-3 py-2 text-xs rounded-xl truncate transition ${s.session_id === currentSessionId ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/60'}`;
                btn.textContent = s.user_message || 'Untitled Chat';
                btn.addEventListener('click', () => switchSession(s.session_id));
                conversationList.appendChild(btn);
            });
        } catch (err) {
            console.error('Failed to load sessions:', err);
        }
    }

    async function loadHistory(sessionId) {
        chatBox.innerHTML = '';
        conversationHistory = [];

        try {
            const res = await fetch(`/history?session_id=${sessionId}`);
            const history = await res.json();

            if (history.length === 0) {
                chatBox.innerHTML = `
                    <div class="flex items-start max-w-3xl mb-4">
                        <div class="flex-1 bg-gray-100 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-800/80 p-4 rounded-2xl rounded-tl-sm text-gray-800 dark:text-zinc-200 text-sm leading-relaxed shadow-sm">
                            Hello! I'm <strong>AbdulGPT</strong>. Ask me questions, upload code files, attach images, or upload PDFs for instant analysis.
                        </div>
                    </div>
                `;
                return;
            }

            history.forEach(item => {
                appendUserMessage(item.user_message);
                appendBotMessage(item.ai_response);
                conversationHistory.push({ role: 'user', content: item.user_message });
                conversationHistory.push({ role: 'assistant', content: item.ai_response });
            });
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    }

    function switchSession(sessionId) {
        currentSessionId = sessionId;
        localStorage.setItem('abdulgpt_session_id', currentSessionId);
        loadSessions();
        loadHistory(currentSessionId);
        closeMobileSidebar();
    }

    newChatBtn.addEventListener('click', () => {
        const newSessionId = `session_${Date.now()}`;
        switchSession(newSessionId);
    });

    // --- Mobile Sidebar Controls ---
    function openMobileSidebar() {
        sidebar.classList.remove('-translate-x-full');
        sidebarOverlay.classList.remove('hidden');
    }

    function closeMobileSidebar() {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    }

    if (toggleSidebarBtn) toggleSidebarBtn.addEventListener('click', openMobileSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeMobileSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileSidebar);
});