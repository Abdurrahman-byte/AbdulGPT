import copy
import os
from groq import Groq

SYSTEM_PROMPT = """You are AbdulGPT, an intelligent AI assistant capable of analyzing text, code, images, and multi-page PDF documents. 
Provide accurate, structured, and helpful answers."""

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

VALID_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "llama-3.1-8b-instant",
    "llama-3.2-11b-vision-instruct",
]


def _prepare_messages(
    messages, image_base64=None, model="openai/gpt-oss-120b", max_history=10
):
    conversation = copy.deepcopy(messages)

   
    if len(conversation) > max_history:
        conversation = conversation[-max_history:]

    if image_base64:
        selected_model = "llama-3.2-11b-vision-instruct"

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
                content_list.extend([
                    item for item in raw_text if item.get("type") == "text"
                ])
            elif raw_text:
                content_list.append({"type": "text", "text": str(raw_text)})

            content_list.append({
                "type": "image_url",
                "image_url": {"url": formatted_image_url},
            })

            conversation.append({"role": "user", "content": content_list})
    else:
        selected_model = (
            model if model in VALID_MODELS else "openai/gpt-oss-120b"
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

    return full_conversation, selected_model


def ask_groq(messages, image_base64=None, model="openai/gpt-oss-120b"):
    full_conversation, selected_model = _prepare_messages(
        messages, image_base64, model
    )

    try:
        completion = client.chat.completions.create(
            model=selected_model,
            messages=full_conversation,
            temperature=0.7,
            max_tokens=2048,  
        )
        return completion.choices[0].message.content or ""

    except Exception as e:
        raise Exception(f"Groq API Error ({selected_model}): {str(e)}")


def ask_groq_stream(
    messages, image_base64=None, model="openai/gpt-oss-120b"
):
    full_conversation, selected_model = _prepare_messages(
        messages, image_base64, model
    )

    try:
        response = client.chat.completions.create(
            model=selected_model,
            messages=full_conversation,
            temperature=0.7,
            max_tokens=2048,  
            stream=True,
        )

        for chunk in response:
            if not chunk.choices:
                continue

            delta = chunk.choices[0].delta
            content = getattr(delta, "content", None)

            if content:
                yield content

    except Exception as e:
        yield f"\n[Groq Streaming Error ({selected_model}): {str(e)}]"