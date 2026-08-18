from flask import Blueprint, jsonify, request, session
from database import delete_entire_session, delete_single_message

history_bp = Blueprint("history", __name__, url_prefix="/api")


@history_bp.route("/clear", methods=["POST"])
def clear_history():
  user_id = session.get("user_id")
  if not user_id:
    return jsonify({"error": "Unauthorized"}), 401

  data = request.json or {}
  session_id = data.get("session_id")

  if session_id:
    delete_entire_session(user_id, session_id)

  session.pop("pdf_text", None)
  return jsonify({"status": "cleared"})


@history_bp.route("/history/<int:chat_id>", methods=["DELETE"])
def delete_history(chat_id):
  user_id = session.get("user_id")
  if not user_id:
    return jsonify({"error": "Unauthorized"}), 401

  delete_single_message(user_id, chat_id)

  return jsonify({"status": "deleted"})