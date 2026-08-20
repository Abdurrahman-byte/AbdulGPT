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

  // Auth UI Elements
  const authModal = document.getElementById('auth-modal');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabRegisterBtn = document.getElementById('tab-register-btn');
  const authError = document.getElementById('auth-error');

  // Tab Switching
  tabLoginBtn?.addEventListener('click', () => {
    tabLoginBtn.className =
        'flex-1 pb-3 text-sm font-semibold text-emerald-600 border-b-2 border-emerald-600 transition';
    tabRegisterBtn.className =
        'flex-1 pb-3 text-sm font-semibold text-gray-400 hover:text-gray-200 border-b-2 border-transparent transition';
    loginForm?.classList.remove('hidden');
    registerForm?.classList.add('hidden');
    authError?.classList.add('hidden');
  });

  tabRegisterBtn?.addEventListener('click', () => {
    tabRegisterBtn.className =
        'flex-1 pb-3 text-sm font-semibold text-emerald-600 border-b-2 border-emerald-600 transition';
    tabLoginBtn.className =
        'flex-1 pb-3 text-sm font-semibold text-gray-400 hover:text-gray-200 border-b-2 border-transparent transition';
    registerForm?.classList.remove('hidden');
    loginForm?.classList.add('hidden');
    authError?.classList.add('hidden');
  });

  // State Variables
  let currentSessionId =
      localStorage.getItem('abdulgpt_session_id') || `session_${Date.now()}`;
  localStorage.setItem('abdulgpt_session_id', currentSessionId);

  let conversationHistory = [];
  let currentAttachment = null;

  // Check Auth State
  checkAuth();

  async function checkAuth() {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        authModal?.classList.add('hidden');
        loadSessions();
        loadHistory(currentSessionId);
      } else {
        authModal?.classList.remove('hidden');
      }
    } catch (err) {
      authModal?.classList.remove('hidden');
    }
  }

  // Handle Login Submission
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError?.classList.add('hidden');

    const username = document.getElementById('login-username')?.value;
    const password = document.getElementById('login-password')?.value;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password})
      });
      const data = await res.json();

      if (res.ok) {
        authModal?.classList.add('hidden');
        loadSessions();
        loadHistory(currentSessionId);
      } else {
        if (authError) {
          authError.textContent = data.error || 'Login failed';
          authError.classList.remove('hidden');
        }
      }
    } catch (err) {
      if (authError) {
        authError.textContent = 'Server connection error';
        authError.classList.remove('hidden');
      }
    }
  });

  // Handle Registration Submission
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError?.classList.add('hidden');

    const username = document.getElementById('reg-username')?.value;
    const email = document.getElementById('reg-email')?.value;
    const password = document.getElementById('reg-password')?.value;

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, email, password})
      });

      if (res.ok) {
        tabLoginBtn?.click();
        const loginUserElem = document.getElementById('login-username');
        const loginPassElem = document.getElementById('login-password');
        if (loginUserElem) loginUserElem.value = username;
        if (loginPassElem) loginPassElem.value = password;
        loginForm?.dispatchEvent(new Event('submit'));
      } else {
        const data = await res.json();
        if (authError) {
          authError.textContent = data.error || 'Registration failed';
          authError.classList.remove('hidden');
        }
      }
    } catch (err) {
      if (authError) {
        authError.textContent = 'Server connection error';
        authError.classList.remove('hidden');
      }
    }
  });

  // Initialization
  initTheme();
  loadSessions();
  loadHistory(currentSessionId);

  // Auto-Resize Textarea
  if (userInput) {
    userInput.addEventListener('input', () => {
      userInput.style.height = 'auto';
      userInput.style.height = `${Math.min(userInput.scrollHeight, 160)}px`;
    });

    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm?.dispatchEvent(new Event('submit'));
      }
    });
  }

  // Theme Controls
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

  // File Attachments
  if (attachBtn) attachBtn.addEventListener('click', () => fileInput?.click());

  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        showPreview(file.name, 'Uploading...');

        const res = await fetch('/api/upload', {method: 'POST', body: formData});
        const contentType = res.headers.get('content-type');

        if (!contentType || !contentType.includes('application/json')) {
          if (res.status === 413) {
            throw new Error('File is too large! Max limit is 32MB.');
          }
          throw new Error(`Server returned status ${res.status}`);
        }

        const data = await res.json();
        if (!res.ok)
          throw new Error(data.error || `Upload failed (${res.status})`);

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
        console.error('[Upload Error]:', err);
        alert(`Upload Failed: ${err.message}`);
        clearPreviewBar();
      }
    });
  }

  if (removeFileBtn)
    removeFileBtn.addEventListener('click', clearPreviewBar);

  function showPreview(filename, status = null) {
    if (filePreviewName) {
      filePreviewName.textContent = status ? `${filename} (${status})` : filename;
    }
    if (filePreviewBar) {
      filePreviewBar.classList.remove('hidden');
    }
  }

  function clearPreviewBar() {
    currentAttachment = null;
    if (fileInput) fileInput.value = '';
    if (filePreviewBar) filePreviewBar.classList.add('hidden');
    if (filePreviewName) filePreviewName.textContent = '';
  }

  // Helper & Rendering Functions
  function escapeHtml(str) {
    return str.replace(
        /[&<>"']/g,
        (m) =>
            ({'&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              '\'': '&#039;'}[m]));
  }

  // Escape LaTeX delimiters to protect them from standard markdown parsers
  function preprocessLaTeX(text) {
    return text
      .replace(/\\\(/g, '&#92;(')
      .replace(/\\\)/g, '&#92;)')
      .replace(/\\\[/g, '&#92;[')
      .replace(/\\\]/g, '&#92;]');
  }

  function postprocessLaTeX(text) {
    return text
      .replace(/&#92;\(/g, '\\(')
      .replace(/&#92;\)/g, '\\)')
      .replace(/&#92;\[/g, '\\[')
      .replace(/&#92;\]/g, '\\]');
  }

  function renderContentWithMath(container, rawMarkdown) {
    if (typeof marked !== 'undefined') {
      const protectedText = preprocessLaTeX(rawMarkdown);
      const parsedHtml = marked.parse(protectedText);
      container.innerHTML = postprocessLaTeX(parsedHtml);
    } else {
      container.innerHTML = escapeHtml(rawMarkdown);
    }

    // Attach Copy Buttons to Code Blocks
    container.querySelectorAll('pre').forEach((pre) => {
      if (pre.querySelector('.copy-code-btn')) return;
      
      pre.classList.add('relative', 'group');
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-btn absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-zinc-700/80 hover:bg-zinc-600 text-zinc-200 text-xs px-2 py-1 rounded transition shadow';
      copyBtn.textContent = 'Copy';
      
      copyBtn.addEventListener('click', () => {
        const codeText = pre.querySelector('code')?.innerText || pre.innerText;
        navigator.clipboard.writeText(codeText).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        });
      });
      pre.appendChild(copyBtn);
    });

    // Render KaTeX Expressions
    if (typeof renderMathInElement !== 'undefined') {
      renderMathInElement(container, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
        throwOnError: false
      });
    }
  }

  function appendUserMessage(text, attachment = null) {
    if (!chatBox) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex flex-col items-end max-w-3xl ml-auto mb-4';

    let attachmentHtml = '';
    if (attachment) {
      if (attachment.type === 'image') {
        attachmentHtml = `
          <div class="mb-2">
            <img src="${attachment.data}" alt="Uploaded Image" class="max-w-xs max-h-48 rounded-xl object-cover border border-zinc-300 dark:border-zinc-700 shadow-sm" />
          </div>`;
      } else {
        attachmentHtml = `
          <div class="mb-2 flex items-center gap-2 bg-emerald-700/80 text-white px-3 py-2 rounded-xl text-xs max-w-xs shadow-sm">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
            <span class="truncate font-medium">${escapeHtml(attachment.name)}</span>
          </div>`;
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

  function createBotMessageContainer() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start max-w-3xl mb-4';

    const contentDiv = document.createElement('div');
    contentDiv.className =
        'bot-markdown-content flex-1 bg-gray-100 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-800/80 p-4 rounded-2xl rounded-tl-sm text-gray-800 dark:text-zinc-200 text-sm leading-relaxed shadow-sm overflow-x-auto';

    messageDiv.appendChild(contentDiv);
    if (chatBox) {
      chatBox.appendChild(messageDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    return contentDiv;
  }

  function appendBotMessage(text) {
    const contentDiv = createBotMessageContainer();
    renderContentWithMath(contentDiv, text);
  }

  function appendLoadingIndicator() {
    if (!chatBox) return;
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

  // Live Stream Chat Handler
  chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const messageText = userInput?.value.trim() || '';
    if (!messageText && !currentAttachment) return;

    const attachmentToSend = currentAttachment;
    if (userInput) {
      userInput.value = '';
      userInput.style.height = 'auto';
    }
    clearPreviewBar();

    appendUserMessage(messageText, attachmentToSend);

    let formattedContent = messageText;
    if (attachmentToSend && attachmentToSend.pdfText) {
      formattedContent = `[Attached Document: ${attachmentToSend.name}]\n${attachmentToSend.pdfText}\n\nUser Question: ${messageText}`;
    }

    conversationHistory.push({role: 'user', content: formattedContent});

    const selectedModel = modelSelect ? modelSelect.value : 'openai/gpt-oss-120b';
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
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });

      removeLoadingIndicator();

      if (!response.ok) {
        const errorData = await response.json();
        appendBotMessage(`Error: ${errorData.error || 'Request failed'}`);
        return;
      }

      // Setup Stream Reader
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const contentDiv = createBotMessageContainer();
      let fullResponseText = '';

      while (true) {
        const {done, value} = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, {stream: true});
        fullResponseText += chunk;

        if (typeof marked !== 'undefined') {
          contentDiv.innerHTML = marked.parse(preprocessLaTeX(fullResponseText));
        } else {
          contentDiv.innerHTML = escapeHtml(fullResponseText);
        }

        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
      }

      // Render KaTeX formula typesetting and copy buttons once streaming completes
      renderContentWithMath(contentDiv, fullResponseText);

      conversationHistory.push({role: 'assistant', content: fullResponseText});
      loadSessions();

    } catch (err) {
      removeLoadingIndicator();
      appendBotMessage('Error: Could not reach the server.');
      console.error(err);
    }
  });

  // Session & History Management
  async function loadSessions() {
    try {
      const res = await fetch('/api/sessions');
      if (!res.ok) return;

      const sessions = await res.json();
      if (!conversationList) return;

      conversationList.innerHTML = '';

      sessions.forEach((s) => {
        const item = document.createElement('div');
        item.className =
            'group flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer text-xs transition';
        item.dataset.sessionId = s.session_id;

        const titleSpan = document.createElement('span');
        titleSpan.className =
            'truncate flex-1 text-gray-700 dark:text-zinc-300 font-medium';
        titleSpan.textContent = s.title || 'New Chat';
        titleSpan.addEventListener('click', () => switchSession(s.session_id));

        const delBtn = document.createElement('button');
        delBtn.className =
            'opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition rounded';
        delBtn.title = 'Delete thread';
        delBtn.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        `;
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          deleteSession(s.session_id);
        });

        item.appendChild(titleSpan);
        item.appendChild(delBtn);
        conversationList.appendChild(item);
      });
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  }

  async function deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this thread?')) return;

    try {
      const res =
          await fetch(`/api/sessions/${sessionId}`, {method: 'DELETE'});
      if (res.ok) {
        const elem =
            document.querySelector(`[data-session-id="${sessionId}"]`);
        if (elem) elem.remove();

        if (currentSessionId === sessionId) {
          const newSessionId = `session_${Date.now()}`;
          switchSession(newSessionId);
        }
      } else {
        alert('Failed to delete chat session.');
      }
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  }

  async function loadHistory(sessionId) {
    if (!chatBox) return;
    chatBox.innerHTML = '';
    conversationHistory = [];

    try {
      const res = await fetch(`/api/history/${sessionId}`);
      if (!res.ok) throw new Error('Could not load history');

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

      history.forEach((item) => {
        appendUserMessage(item.user_message);
        appendBotMessage(item.ai_response);
        conversationHistory.push({role: 'user', content: item.user_message});
        conversationHistory.push({role: 'assistant', content: item.ai_response});
      });
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }

  function switchSession(sessionId) {
    currentSessionId = sessionId;
    localStorage.setItem('abdulgpt_session_id', currentSessionId);
    loadSessions();
    loadHistory(currentSessionId);
    closeMobileSidebar();
  }

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      const newSessionId = `session_${Date.now()}`;
      switchSession(newSessionId);
    });
  }

  // Mobile Sidebar Controls
  function openMobileSidebar() {
    if (sidebar) sidebar.classList.remove('-translate-x-full');
    if (sidebarOverlay) sidebarOverlay.classList.remove('hidden');
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
  }

  if (toggleSidebarBtn)
    toggleSidebarBtn.addEventListener('click', openMobileSidebar);
  if (closeSidebarBtn)
    closeSidebarBtn.addEventListener('click', closeMobileSidebar);
  if (sidebarOverlay)
    sidebarOverlay.addEventListener('click', closeMobileSidebar);
});