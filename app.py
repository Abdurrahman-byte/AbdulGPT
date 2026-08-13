import os
import uuid

from flask import Flask, jsonify, render_template, request, session
from werkzeug.utils import secure_filename

from ai import ask_groq
from database import (
    clear_session_history,
    create_database,
    get_all_sessions,
    get_chat_history,
    save_chat,
)
from pdf_utils import extract_pdf_text
from routes.chat import chat_bp
from routes.upload import upload_bp
from routes.history import history_bp
from routes.main import main_bp

app = Flask(__name__)
app.register_blueprint(chat_bp)
app.register_blueprint(upload_bp)
app.register_blueprint(history_bp)
app.register_blueprint(main_bp)
app.secret_key = "PythonAbdul_123"


create_database()

UPLOAD_FOLDER = os.path.join("static", "uploads")


app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

@app.errorhandler(413)
def request_entity_too_large(error):
    jsonify({
        "error":"File size exceeds the limit the 16MB limit. please upload a smaller file"
    }), 413

@app.route("/sessions", methods=["GET"])
def get_sessions():
    sessions = get_all_sessions()
    return jsonify(sessions)


@app.route("/history", methods=["GET"])
def get_history():
    session_id = request.args.get("session_id", "default")
    history = get_chat_history(session_id)
    return jsonify(history)


@app.route("/clear-pdf", methods=["POST"])
def clear_pdf():
    session.pop("pdf_text", None)
    return jsonify({"status": "pdf_cleared"})


if __name__ == "__main__":
    app.run(debug=True)