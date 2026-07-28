🤖 Abdul's AI Assistant

A modern AI-powered web chatbot built with **Python**, **Flask**, **Groq AI**, **HTML**, **Tailwind CSS**, and **JavaScript**.

This project combines a responsive web interface with a Flask backend that communicates with the Groq API, allowing users to chat with an AI assistant in real time.



Preview

![alt text](<Screenshot 2026-07-28 160804.png>)
![alt text](<Screenshot 2026-07-28 160912-1.png>) ![alt text](<Screenshot 2026-07-28 161032-1.png>)

![alt text]c:\Users\HP\Pictures\Screens![alt text](<Scrc:\Users\HP\Pictures\Screenshots\Screenshot 2026-07-28 160912.pngeenshot 2026-07-28 161032.png>)hots\Screenshot 2026-07-28 160804.png(<Screenshot 2026-07-28 160912.png>)

Features

- Real-time AI conversation
- Powered by Groq's Llama 3.3 70B Versatile model
- Flask-powered backend
- Clean and responsive user interface
- Mobile-friendly layout
- Auto-scrolling chat window
- Enter-to-send messaging
- Loading indicator while waiting for AI responses
- Fetch API communication between frontend and backend
- Secure API key using environment variables
- 🌙 Dark Theme 
- 📎 File Upload Support 



Technologies Used

Backend

- Python
- Flask
- Groq SDK

Frontend

- HTML5
- Tailwind CSS
- JavaScript
- Fetch API

AI

- Groq API
- Llama 3.3 70B Versatile



Project Structure

```
AI-Chatbot/
│
├── app.py
├── requirements.txt
├── .env
├── .gitignore
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css      (Optional)
│   ├── script.js      (Optional)
│   └── images/
│
└── README.md
```



Installation

1. Clone the repository

```bash
git clone https://github.com/Abdurrahman-byte/grog-Chatbot.git
```



2. Navigate into the project

```bash
cd AI-Chatbot
```



3. Create a virtual environment

**Windows**

```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux**

```bash
python3 -m venv venv
source venv/bin/activate
```



4. Install dependencies

```bash
pip install -r requirements.txt
```

---

5. Create a `.env` file

```env
GROQ_API_KEY=your_api_key_here
```

> Never upload your `.env` file to GitHub.



6. Run the application

```bash
python app.py
```

Open your browser and visit:

```
http://127.0.0.1:5000
```



Environment Variables

This project uses environment variables to protect sensitive credentials.

Example:

```env
GROQ_API_KEY=your_api_key_here
```

The API key is loaded securely instead of being hardcoded into the source code.



How It Works

1. User types a message.
2. JavaScript sends the message to Flask using the Fetch API.
3. Flask receives the request.
4. Flask sends the prompt to the Groq API.
5. Groq generates a response.
6. Flask returns the response as JSON.
7. JavaScript displays the AI response in the chat window.



Current Features

- AI conversation
- Responsive interface
- Backend API integration
- JSON communication
- Error handling
- Loading placeholder
- Chat bubbles
- Responsive design
- Theme toggle
- File upload



Planned Improvements


- Markdown Rendering
- Code Syntax Highlighting
- Copy Response Button
- Voice Input
- Text-to-Speech
- Conversation History
- AI Memory
- Multi-language Support
- Emoji Picker
- Settings Panel
- Progressive Web App (PWA)



What I Learned

This project helped me strengthen my understanding of:

- Flask routing
- REST APIs
- JSON requests and responses
- Frontend and backend integration
- Asynchronous JavaScript (Fetch API)
- API authentication
- Error handling
- Environment variables
- Project organization
- Building responsive user interfaces
- AI API integration



Security

Sensitive information such as API keys is stored using environment variables.

The `.env` file is excluded from version control using `.gitignore`.

---

Future Goals

- Deploy the chatbot online
- Add user authentication
- Support multiple AI models
- Add conversation memory
- Implement file analysis
- Add image understanding
- Improve UI animations
- Connect to a database



Author

*Abdurrahman Dada*

Electrical Engineering Student • AI/ML Enthusiast • Python Developer • Full-Stack Learner

Currently building projects in:

- Python
- Flask
- JavaScript
- AI Engineering
- Machine Learning
- Backend Development



Support

If you found this project helpful or interesting, consider giving it a ⭐ on GitHub.

It motivates me to continue learning and building more open-source projects.



*"Every project is another step toward becoming the engineer I aspire to be."*