from flask import Blueprint, request, jsonify, session
from database import clear_session_history, delete_chat

history_bp = Blueprint("history",
                        __name__,
                        url_prefix="/api")

@history_bp.route("/clear", methods=["POST"])
def clear_history():
    data = request.json or {}
    session_id = data.get("session_id")
    clear_session_history(session_id)
    session.pop("pdf_text", None)
    return jsonify({"status": "cleared"})

