import os
import uuid
from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request, session
from werkzeug.utils import secure_filename

from ai import ask_groq
from database import (
    create_database,
    create_user,
    delete_entire_session,
    get_chat_history,
    get_user_sessions,
    save_chat,
    verify_user,
)
from pdf_utils import extract_pdf_text
from routes.chat import chat_bp
from routes.history import history_bp
from routes.main import main_bp
from routes.upload import upload_bp
from routes.auth import auth_bp

load_dotenv()
app = Flask(__name__)


app.register_blueprint(chat_bp)
app.register_blueprint(upload_bp)
app.register_blueprint(history_bp)
app.register_blueprint(main_bp)
app.register_blueprint(auth_bp)

create_database()

UPLOAD_FOLDER = os.path.join("static", "uploads")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)


@app.route("/api/register", methods=["POST"])
def register():
  data = request.json or {}
  username = data.get("username")
  password = data.get("password")

  if not username or not password:
    return jsonify({"error": "Username and password required"}), 400

  user_id = create_user(username, password)
  if not user_id:
    return jsonify({"error": "Username already exists"}), 400

  session["user_id"] = user_id
  return jsonify({"message": "User registered successfully"})


@app.route("/api/login", methods=["POST"])
def login():
  data = request.json or {}
  username = data.get("username")
  password = data.get("password")

  user = verify_user(username, password)
  if not user:
    return jsonify({"error": "Invalid username or password"}), 401

  session["user_id"] = user["id"]
  return jsonify({"message": "Logged in successfully", "username": user["username"]})


@app.route("/api/logout", methods=["POST"])
def logout():
  session.clear()
  return jsonify({"message": "Logged out successfully"})


@app.route("/api/me", methods=["GET"])
def get_current_user():
  user_id = session.get("user_id")
  if not user_id:
    return jsonify({"authenticated": False}), 401
  return jsonify({"authenticated": True, "user_id": user_id})


@app.route("/api/sessions", methods=["GET"])
def fetch_sessions():
  user_id = session.get("user_id")
  if not user_id:
    return jsonify({"error": "Unauthorized"}), 401

  sessions = get_user_sessions(user_id)
  return jsonify(sessions)


@app.route("/api/sessions/<session_id>", methods=["DELETE"])
def remove_session(session_id):
  user_id = session.get("user_id")
  if not user_id:
    return jsonify({"error": "Unauthorized"}), 401

  delete_entire_session(user_id, session_id)
  return jsonify({"message": "Session deleted successfully"})


@app.route("/api/history/<session_id>", methods=["GET"])
def fetch_chat_history(session_id):
  user_id = session.get("user_id")
  if not user_id:
    return jsonify({"error": "Unauthorized"}), 401

  history = get_chat_history(user_id, session_id)
  return jsonify(history)


@app.route("/clear-pdf", methods=["POST"])
def clear_pdf():
  session.pop("pdf_text", None)
  return jsonify({"status": "pdf_cleared"})


@app.errorhandler(413)
def request_entity_too_large(error):
  return (
      jsonify(
          {"error": "File size exceeds the limit. Please upload a smaller file."}
      ),
      413,
  )


if __name__ == "__main__":
  app.run(debug=True)