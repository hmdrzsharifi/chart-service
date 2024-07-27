# gunicorn_config.py
from config import Config

bind = f"{Config.HOST}:{Config.PORT}"
workers = 4  # Adjust the number of workers as needed
