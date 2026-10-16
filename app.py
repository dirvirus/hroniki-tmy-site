import os
import json
import datetime
from flask import (
    Flask, render_template, send_from_directory,
    jsonify, request
)

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOWNLOADS_DIR = os.path.join(BASE_DIR, "downloads")
STATS_FILE = os.path.join(BASE_DIR, "stats.json")
MESSAGES_FILE = os.path.join(BASE_DIR, "messages.json")

GAME_FILENAME = "Hroniki_Tmy.exe"


def load_stats():
    if os.path.exists(STATS_FILE):
        try:
            with open(STATS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"downloads": 0}


def save_stats(stats):
    try:
        with open(STATS_FILE, "w", encoding="utf-8") as f:
            json.dump(stats, f, ensure_ascii=False, indent=2)
    except Exception:
        pass


@app.route("/")
def index():
    stats = load_stats()
    return render_template(
        "index.html",
        version="2.4",
        downloads=stats.get("downloads", 0),
    )


@app.route("/download")
def download():
    file_path = os.path.join(DOWNLOADS_DIR, GAME_FILENAME)
    if not os.path.exists(file_path):
        return (
            "<h1>Файл пока не загружен</h1>"
            "<p>Скоро здесь появится игра.</p>",
            404,
        )
    stats = load_stats()
    stats["downloads"] = stats.get("downloads", 0) + 1
    save_stats(stats)
    return send_from_directory(
        DOWNLOADS_DIR,
        GAME_FILENAME,
        as_attachment=True,
        download_name="Hroniki_Tmy.exe",
    )


@app.route("/api/stats")
def api_stats():
    return jsonify(load_stats())


@app.route("/api/feedback", methods=["POST"])
def api_feedback():
    try:
        data = request.get_json() or {}
        name = str(data.get("name", ""))[:50].strip()
        email = str(data.get("email", ""))[:100].strip()
        message = str(data.get("message", ""))[:1000].strip()

        if not name or not message:
            return jsonify({
                "ok": False,
                "error": "Заполни имя и сообщение"
            }), 400

        messages = []
        if os.path.exists(MESSAGES_FILE):
            try:
                with open(MESSAGES_FILE, "r",
                          encoding="utf-8") as f:
                    messages = json.load(f)
            except Exception:
                pass

        messages.append({
            "name": name,
            "email": email,
            "message": message,
            "time": datetime.datetime.now().isoformat(),
        })
        with open(MESSAGES_FILE, "w",
                  encoding="utf-8") as f:
            json.dump(messages, f, ensure_ascii=False,
                      indent=2)

        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)