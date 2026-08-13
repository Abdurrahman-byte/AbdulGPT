import os
import uuid

from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.utils import secure_filename
from pdf_utils import extract_pdf_text


upload_bp = Blueprint("upload",
                       __name__,
                       url_prefix="/api")


ALLOWED_EXTENSIONS = {
    "png", "jpg", "jpeg",
    "webp", "gif", "txt"
    "html", "css", "js",
    "json", "csv", "md",
    "pdf"
}


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower()
        in ALLOWED_EXTENSIONS
    )


@upload_bp.route("/upload", methods=["POST"])
def upload_file():
  if "file" not in request.files:
    return jsonify({"error": "No file part"}), 400

  file = request.files["file"]
  if file.filename == "":
    return jsonify({"error": "No selected file"}), 400

  original_name = secure_filename(file.filename)
  unique_filename = f"{uuid.uuid4().hex}_{original_name}"
  filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_filename)

  file.save(filepath)

  extracted_text = ""
  if original_name.lower().endswith(".pdf"):
    extracted_text = extract_pdf_text(filepath)

  return jsonify({
      "filename": original_name,
      "filepath": f"/static/uploads/{unique_filename}",
      "extracted_text": extracted_text,
  })