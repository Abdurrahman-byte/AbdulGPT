import copy
import os
from groq import Groq

SYSTEM_PROMPT = """You are AbdulGPT, an intelligent AI assistant capable of analyzing text, code, images, and multi-page PDF documents. 
Provide accurate, structured, and helpful answers."""

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

VALID_MODELS = [
    "llama-3.3-70b-versatile",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "llama-3.1-8b-instant",
]


def ask_groq(
    messages,
    image_base64=None,
    model="llama-3.3-70b-versatile",
):
    conversation = copy.deepcopy(messages)

    if image_base64:
        selected_model = "qwen/qwen3.6-27b"

        if conversation and conversation[-1]["role"] == "user":
            latest_message = conversation.pop()
            formatted_image_url = (
                image_base64
                if image_base64.startswith("data:")
                else f"data:image/jpeg;base64,{image_base64}"
            )

            content_list = []
            raw_text = latest_message.get("content", "")

            if isinstance(raw_text, list):
                content_list.extend(
                    [
                        item
                        for item in raw_text
                        if item.get("type") == "text"
                    ]
                )
            elif raw_text:
                content_list.append({"type": "text", "text": str(raw_text)})

            content_list.append({
                "type": "image_url",
                "image_url": {"url": formatted_image_url},
            })

            conversation.append({"role": "user", "content": content_list})
    else:
        selected_model = (
            model if model in VALID_MODELS else "llama-3.3-70b-versatile"
        )

    
    if conversation and conversation[0].get("role") == "system":
        conversation[0]["content"] = (
            f"{SYSTEM_PROMPT}\n\n{conversation[0]['content']}"
        )
        full_conversation = conversation
    else:
        full_conversation = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ] + conversation

   
    try:
        completion = client.chat.completions.create(
            model=selected_model,
            messages=full_conversation,
            temperature=0.7,
            max_tokens=4096,
        )
        return completion.choices[0].message.content

    except Exception as e:
        raise Exception(f"Groq API Error ({selected_model}): {str(e)}")