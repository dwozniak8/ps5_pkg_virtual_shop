#!/bin/sh
set -eu

python - <<'PY'
import json
import os
import pathlib

config_path = pathlib.Path("configs.json")
config = {}

if config_path.exists():
    config = json.loads(config_path.read_text(encoding="utf-8"))

config["docker"] = True

shop_title = os.getenv("SHOP_TITLE")
if shop_title:
    config["shop_title"] = shop_title

app_port = os.getenv("APP_PORT")
if app_port:
    try:
        config["port"] = int(app_port)
    except ValueError:
        pass

scan_on_startup = os.getenv("SCAN_ON_STARTUP")
if scan_on_startup is not None:
    config["scan_on_startup"] = scan_on_startup.strip().lower() in {"1", "true", "yes", "on"}

paths = dict(config.get("paths") or {})
for env_name, env_value in os.environ.items():
    if env_name.startswith("PKG_PATH_") and env_value.strip():
        category_name = env_name[len("PKG_PATH_"):].strip().lower()
        if category_name:
            paths[category_name] = env_value

if paths:
    config["paths"] = paths

config_path.write_text(json.dumps(config, indent=4), encoding="utf-8")
PY

exec python app.py
