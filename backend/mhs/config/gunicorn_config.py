# gunicorn_config.py
from base_config import BaseConfig

bind = f"{BaseConfig.HOST}:{BaseConfig.PORT}"
workers = 4  # Adjust the number of workers as needed
