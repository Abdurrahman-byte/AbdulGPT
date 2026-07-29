import os
from flask import Flask, render_template, request, jsonify
from groq import Groq

app = Flask(__name__)
client = Groq()

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json or {}
    messages = data.get("messages", [])
    image_base64 = data.get("image", None)
    
    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    try:
        if image_base64:
            model = "qwen/qwen3.6-27b"
            
            latest_message = messages.pop()  
            content = []
            if latest_message["content"]:
                content.append({"type": "text", "text": latest_message["content"]})
            content.append({
                "type": "image_url",
                "image_url": {"url": image_base64}
            })
            messages.append({"role": "user", "content": content})
        else:
            model = "llama-3.3-70b-versatile"

        
        full_conversation = [{"role": "system", "content": "You are a helpful and concise AI assistant."}] + messages

        completion = client.chat.completions.create(
            model=model,
            messages=full_conversation
        )
        
        bot_response = completion.choices[0].message.content
        return jsonify({"response": bot_response})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)