from ai import ask_groq_stream
from database import save_chat
from flask import (
    Blueprint,
    Response,
    jsonify,
    request,
    session,
    stream_with_context,
)

chat_bp = Blueprint("chat", __name__, url_prefix="/api")


@chat_bp.route("/chat", methods=["POST"])
def chat():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized. Please log in."}), 401

    data = request.json or {}
    messages = data.get("messages") or []
    image_base64 = data.get("image", None)
    session_id = data.get("session_id", "default")
    selected_model = data.get("model", "llama-3.3-70b-versatile")

    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    latest_content = messages[-1].get("content", "")
    if isinstance(latest_content, list):
        user_message = " ".join(
            item.get("text", "")
            for item in latest_content
            if isinstance(item, dict) and item.get("type") == "text"
        )
    else:
        user_message = str(latest_content)

    groq_messages = [dict(m) for m in messages]
    pdf_text = session.get("pdf_text")
    if pdf_text and len(groq_messages) > 0:
        if groq_messages[0].get("role") != "system":
            groq_messages.insert(
                0,
                {
                    "role": "system",
                    "content": f"Context Document Content:\n{pdf_text}",
                },
            )

    @stream_with_context
    def generate():
        full_response = ""
        try:
            for token in ask_groq_stream(
                groq_messages, image_base64=image_base64, model=selected_model
            ):
                if token:
                    full_response += token
                    yield token
        except Exception as e:
            print(f"[Streaming Error]: {e}")
            yield f"\n[Error during generation: {str(e)}]"
            return

        try:
            if full_response.strip():
                save_chat(user_id, session_id, user_message, full_response)
        except Exception as db_err:
            print(f"[DB Save Error]: {db_err}")

    return Response(generate(), content_type="text/plain; charset=utf-8")