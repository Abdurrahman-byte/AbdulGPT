from flask import Blueprint, render_template,session

main_bp = Blueprint("main", __name__)

@main_bp.route("/")
def home():
    if not "messages" in session:
        session["messages"] = []
    return render_template("index.html")