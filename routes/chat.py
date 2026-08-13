from flask import Blueprint, request, jsonify, session
from database import save_chat
from ai import ask_groq


chat_bp = Blueprint("chat",
                     __name__,
                     url_prefix="/api")

@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.json or {}
    messages = data.get("messages") or []
    image_base64 = data.get("image", None)
    session_id = data.get("session_id", "default")
    selected_model = data.get("model", "llama-3.3-70b-versatile")

    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    try:
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

        bot_response = ask_groq(groq_messages, image_base64, model=selected_model)

        latest_content = messages[-1].get("content", "")

        if isinstance(latest_content, list):
            user_message = " ".join(
                item.get("text", "")
                for item in latest_content
                if isinstance(item, dict) and item.get("type") == "text"
            )
        else:
            user_message = str(latest_content)

        
        save_chat(user_message, bot_response, session_id=session_id)

        return jsonify({"response": bot_response})

    except Exception as e:
        print(f"Error in/chat route: {str(e)}")
        return jsonify({"error": str(e)}), 500