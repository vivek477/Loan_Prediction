"""Gunicorn entrypoint — imports the Flask app from UI/server/app.py."""

from pathlib import Path
import runpy

_server = Path(__file__).resolve().parent / "UI" / "server" / "app.py"
app = runpy.run_path(str(_server))["app"]

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=False)
