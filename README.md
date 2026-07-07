AI Chatbot with Groq API

A command-line AI chatbot built with Python and the Groq API. The chatbot uses the Llama 3.3 70B Versatile model and supports real-time streaming responses for a smooth conversational experience.



📌 Overview

This project is a simple AI-powered chatbot that allows users to have conversations with a large language model through the command line.

The chatbot sends user messages to Groq's API and streams responses back in real time, creating an interactive chat experience similar to modern AI assistants.



Features

* 🤖 AI-powered conversations
* ⚡ Real-time streaming responses
* 💬 Interactive command-line interface
* 🧠 Powered by Llama 3.3 70B Versatile
* 🔄 Continuous conversation loop
* 🚪 Exit commands (`quit`, `exit`, `bye`)
* 📡 API integration with Groq



Technologies Used

* Python 3
* Groq API
* Llama 3.3 70B Versatile Model



Requirements

Install the Groq Python SDK:

```bash id="groq1"
pip install groq
```

You will also need a Groq API key.



Setup

1. Clone the repository

```bash id="groq2"
git clone https://github.com/Abdurrahman-byte/groq-chatbot.git
```

2. Navigate to the project folder

```bash id="groq3"
cd groq-chatbot
```

3. Configure your API Key

Set your Groq API key as an environment variable.

Example (Windows):

```bash id="groq4"
set GROQ_API_KEY=your_api_key_here
```

Example (Linux/macOS):

```bash id="groq5"
export GROQ_API_KEY=your_api_key_here
```

4. Run the chatbot

```bash id="groq6"
python chatbot.py
```



Example Usage

```text id="groq7"
🤖 Chatbot (Groq Streaming)

You: What is Python?

🤖 Chatbot:
Python is a high-level programming language known for its simplicity and readability...
```

Exit Commands

```text id="groq8"
quit
exit
bye
```

The chatbot will terminate when any of these commands are entered.



Project Structure

```text id="groq9"
groq-chatbot/
│
├── chatbot.py
└── README.md
```



Concepts Practiced

This project helped reinforce:

* API integration
* AI application development
* Streaming responses
* Working with SDKs
* User input handling
* Command-line applications
* Environment variables
* Conversational AI fundamentals



How It Works

1. User enters a message.
2. The message is sent to Groq's API.
3. The Llama model processes the request.
4. Response tokens are streamed back in real time.
5. The chatbot displays the response as it is generated.



Future Improvements

* 💾 Save conversation history
* 🧠 Multi-turn memory support
* 📄 Export chats to text files
* 🎨 Build a GUI version with Tkinter
* 🌐 Create a web version using Flask
* 🔊 Text-to-Speech integration
* 🎤 Speech-to-Text support
* 📚 Custom AI personalities



Known Limitations

* Requires an internet connection
* Requires a valid Groq API key
* No conversation history persistence
* No long-term memory between sessions
* Command-line interface only



Author

Abdurrahman

Python Developer | Aspiring AI/ML Engineer



Project Goal

This project was built to learn how AI APIs work and how to integrate large language models into Python applications. It demonstrates API communication, streaming responses, and the foundations of building conversational AI systems.

This project marks an important step from traditional Python programming into AI-powered application development.
