import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request, session

from database import (
    create_database,
    delete_entire_session,
    get_chat_history,
    get_user_sessions,
)
from routes.auth import auth_bp
from routes.chat import chat_bp
from routes.history import history_bp
from routes.main import main_bp
from routes.upload import upload_bp

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "fallback-dev-key")

create_database()

app.register_blueprint(auth_bp)
app.register_blueprint(chat_bp)
app.register_blueprint(upload_bp)
app.register_blueprint(history_bp)
app.register_blueprint(main_bp)


UPLOAD_FOLDER = os.path.join("static", "uploads")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 32 * 1024 * 1024  
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)


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
      jsonify({
          "error": (
              "File size exceeds the limit (32MB). Please upload a smaller"
              " file."
          )
      }),
      413,
  )


if __name__ == "__main__":
  app.run(debug=True)