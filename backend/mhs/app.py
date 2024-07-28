# app.py
import os
from flask import Flask
from flask_cors import CORS

from config.base_config import BaseConfig
from config.logging_config import setup_logging
from config.cache_config import configure_cache
from rest.fmp_resource import main

# Dynamically load the configuration
config_name = os.getenv('FLASK_CONFIG', 'config.BaseConfig')
app = Flask(__name__)
app.config.from_object(config_name)

logger = setup_logging()

CORS(app, resources={r'*': {'origins': '*'}})
configure_cache(app)

app.register_blueprint(main)

if __name__ == '__main__':
    host = app.config['HOST']
    port = app.config['PORT']
    debug = app.config['DEBUG']
    use_reloader = app.config['USE_RELOADER']
    app.run(host=host, port=port, debug=debug, use_reloader=use_reloader)
