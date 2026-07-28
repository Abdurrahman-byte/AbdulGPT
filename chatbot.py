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
    user_message = data.get("message", "")
    image_base64 = data.get("image", None)
    
    if not user_message and not image_base64:
        return jsonify({"error": "No message or file provided"}), 400

    try:
        
        if image_base64:
            model = "qwen/qwen3.6-27b"
            content = []
            if user_message:
                content.append({"type": "text", "text": user_message})
            else:
                content.append({"type": "text", "text": "Describe or analyze this image."})
                
            content.append({
                "type": "image_url",
                "image_url": {"url": image_base64}
            })
            
            messages = [{"role": "user", "content": content}]
        else:
            
            model = "llama-3.3-70b-versatile"
            messages = [{"role": "user", "content": user_message}]

        completion = client.chat.completions.create(
            model=model,
            messages=messages
        )
        
        bot_response = completion.choices[0].message.content
        return jsonify({"response": bot_response})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)