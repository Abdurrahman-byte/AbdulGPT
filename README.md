 AbdulGPT

**AbdulGPT** is a full-stack AI assistant built with **Python, Flask, JavaScript, Tailwind CSS, SQLite, and the Groq API**.

The project started as a simple command-line AI chatbot and evolved into a complete web-based AI assistant with a modern interface, persistent conversations, authentication, file uploads, AI-powered responses, and document-processing capabilities.



 Features

🤖 AI Chat

* AI-powered conversations using the Groq API
* Powered by modern LLMs
* Fast responses through Groq's inference infrastructure
* Conversational chat interface
* Error handling for failed API requests
* Persistent conversation sessions

🧠 Conversation History & Memory

* Saves conversation history
* Allows previous conversations to be retrieved
* Session-based chat management
* Clear conversation history functionality
* Persistent storage using SQLite

🔐 User Authentication

* User authentication system
* Protected user-specific data
* Separate conversation history for users
* Authentication routes handled through Flask

📎 File Uploads

* Upload files directly through the chatbot interface
* Dedicated upload route
* Uploaded files are handled by the Flask backend
* Supports building toward document-aware AI interactions

 📄 PDF Processing

* PDF utility functions
* Backend support for working with PDF documents
* Designed to allow AbdulGPT to process information from uploaded documents

🎨 Modern User Interface

* Responsive web interface
* Dark theme
* Clean chat interface
* Mobile-friendly layout
* Dynamic chat messages
* User and AI message separation
* Loading states while waiting for responses

 💾 Persistent Data

* SQLite database
* Persistent chat data
* User/session information
* Conversation history

🌙 Theme Support

* Dark-themed interface
* Theme toggle support
* UI state handled on the frontend



 Tech Stack

 Backend

* **Python**
* **Flask**
* **Groq API**
* **SQLite**
* **JSON**

 Frontend

* **HTML5**
* **JavaScript**
* **Tailwind CSS**

Document Processing

* **Python PDF utilities**

 Development

* **Git**
* **GitHub**
* **VS Code**
* **Python Virtual Environment**



 Project Structure

```text
AbdulGPT/
│
├── routes/
│   ├── __init__.py
│   ├── auth.py
│   ├── chat.py
│   ├── history.py
│   ├── main.py
│   └── upload.py
│
├── static/
│   ├── css/
│   ├── js/
│   └── uploads/
│
├── templates/
│   └── index.html
│
├── .env
├── .gitignore
├── abdulgpt.db
├── ai.py
├── app.py
├── database.py
├── pdf_utils.py
└── README.md
```



 Architecture

AbdulGPT follows a modular Flask architecture.

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │ HTML + JS + Tailwind│
                    └──────────┬──────────┘
                               │
                               │ HTTP / JSON
                               ▼
                    ┌─────────────────────┐
                    │       Flask         │
                    │      app.py         │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
       ┌───────────┐     ┌───────────┐     ┌───────────┐
       │   Auth    │     │   Chat    │     │  Upload   │
       │   Route   │     │   Route   │     │   Route   │
       └───────────┘     └─────┬─────┘     └─────┬─────┘
                               │                 │
                               ▼                 ▼
                        ┌─────────────┐    ┌─────────────┐
                        │  Groq API   │    │ PDF Utility │
                        └─────────────┘    └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │   SQLite    │
                        │  Database   │
                        └─────────────┘
```



   How It Works

1. User interacts with the frontend

The user sends a message through the web interface.

2. JavaScript sends the request

The frontend communicates with Flask using HTTP requests and JSON.

3. Flask processes the request

The appropriate route handles the request depending on the operation.

Examples include:

```text
/chat
/auth
/history
/upload
```

4. AI processing

The chat functionality communicates with the Groq API to generate an AI response.

5. Database operations

User information and conversation data can be stored and retrieved through the SQLite database.

6. Response

Flask returns the result to the frontend, where JavaScript updates the chat interface dynamically.



 Environment Variables

API credentials should **never be hardcoded into the source code**.

Create a `.env` file for local development:

```env
GROQ_API_KEY=your_groq_api_key
```

Make sure `.env` is included in `.gitignore`:

```gitignore
.env
```

Never commit API keys or other sensitive credentials to GitHub.



Installation

1. Clone the repository

```bash
git clone https://github.com/Abdurrahman-byte/abdulgpt.git
```

2. Navigate into the project

```bash
cd abdulgpt
```

3. Create a virtual environment

Windows:

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

Mac/Linux:

```bash
python3 -m venv venv
```

```bash
source venv/bin/activate
```

4. Install dependencies

```bash
pip install -r requirements.txt
```

5. Configure your API key

Create `.env`:

```env
GROQ_API_KEY=your_groq_api_key
```

6. Run the application

```bash
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```



Database

AbdulGPT uses **SQLite** for persistent application data.

The database is represented by:

```text
abdulgpt.db
```

Database functionality is organized through:

```text
database.py
```

This allows the application to persist information instead of relying entirely on temporary in-memory variables.



Route Structure

The Flask routes are separated into modules to keep the application organized.

```text
routes/
│
├── auth.py       → Authentication functionality
├── chat.py       → AI chat functionality
├── history.py    → Conversation history
├── main.py       → Main application pages
└── upload.py     → File upload functionality
```

This modular structure makes the application easier to maintain and extend as more functionality is added.

---

File Processing

PDF-related functionality is separated into:

```text
pdf_utils.py
```

Keeping document processing separate from the main Flask application makes the project easier to expand with additional document formats and AI-powered document analysis.



Security Considerations

The project uses several practices to protect sensitive information:

* API keys are stored outside the source code
* `.env` is excluded from Git
* User-specific data is stored separately
* Backend routes handle sensitive operations
* API communication is performed server-side

> **Important:** Do not upload `.env`, API keys, passwords, or other secrets to GitHub.



Current Development Status

AbdulGPT is an actively evolving project.

Completed

* [x] Flask backend
* [x] Web-based chat interface
* [x] Groq API integration
* [x] JavaScript frontend/backend communication
* [x] Responsive interface
* [x] Dark theme
* [x] Authentication system
* [x] Conversation history
* [x] SQLite database
* [x] File upload functionality
* [x] PDF utilities
* [x] Modular Flask routes
* [x] Environment-based API credentials
* [x] Multiple AI model selection
* [x] Image understanding

Future Improvements


* [ ] Improved document understanding
* [ ] Voice input
* [ ] Text-to-speech
* [ ] Image understanding
* [ ] Better document management
* [ ] Production deployment
* [ ] Improved authentication and security
* [ ] More advanced AI agents



What I Learned

Building AbdulGPT has been an opportunity to combine several technologies into one application.

Python

* Functions
* Modules
* Classes
* Exception handling
* File handling
* Environment variables
* API integration

Flask

* Routes
* Blueprints
* Request handling
* JSON responses
* Templates
* Sessions
* Backend architecture

JavaScript

* DOM manipulation
* Event listeners
* Fetch API
* Asynchronous programming
* JSON communication
* Dynamic UI updates

Databases

* SQLite
* Database operations
* Persistent application data
* Conversation storage

AI Engineering

* LLM API integration
* Prompt construction
* AI response handling
* Building AI-powered applications
* Connecting AI models to real-world software



🎯 Project Goal

The goal of AbdulGPT is to continuously evolve from a simple chatbot into a practical AI assistant capable of handling conversations, files, documents, and other useful tasks through a single web interface.

The project is also a practical learning environment for developing skills in:

```text
Python
   ↓
Backend Development
   ↓
Flask
   ↓
APIs
   ↓
Databases
   ↓
JavaScript
   ↓
AI Integration
   ↓
AI Engineering
```

---

Author

**Abdurrahman Dada**

AI/ML Learner • Python Developer • Full-Stack Developer

Currently building projects around:

* Python
* AI/ML
* Flask
* JavaScript
* Backend Development
* AI Engineering



⭐ Acknowledgements

Built as a personal learning project while exploring Python, web development, APIs, databases, and AI engineering.



📌 Note

AbdulGPT is a personal development project and is continuously being improved as new technologies and features are explored.

````

