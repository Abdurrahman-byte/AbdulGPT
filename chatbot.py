import os
import uuid
from flask import Flask, render_template, request, jsonify
from groq import Groq
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = "PythonAbdul_123"
client = Groq()

UPLOAD_FOLDER = os.path.join("static", "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg",
                       "gif", "webp", "txt"
                       "html", "css", "js"
                       "json", "csv" "md"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


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

@app.route("/upload", methods=["POST"])
def upload_file():

    if request.method == "POST":
        file = request.files["file"] 

        if file and allowed_file(file.filename):
            filename = secure_filename()

            unique_filename = f"{uuid.uuid4().hex[:8]}_{filename}"

            file.save(
                os.path.join(
                    app.config["UPLOAD_FOLDER"],
                    unique_filename
                )
            )

            return jsonify({
            "message": "File uploaded successfully",
            "filename": unique_filename,
            "url": f"/static/uploads/{unique_filename}"
        })

    return jsonify({"error": "Invalid file type"}),

if __name__ == "__main__":
    app.run(debug=True)