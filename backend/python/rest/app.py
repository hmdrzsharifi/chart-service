# app.py
from flask import Flask
from flask_cors import CORS
from .config import Config
from .logging_config import setup_logging
from .cache_config import configure_cache
from .routes import main

logger = setup_logging()

app = Flask(__name__)
CORS(app, resources={r'*': {'origins': '*'}})
app.config.from_object(Config)

configure_cache(app)

app.register_blueprint(main)

if __name__ == '__main__':
    host = app.config['HOST']
    port = app.config['PORT']
    debug = app.config['DEBUG']
    app.run(host=host, port=port, debug=debug, use_reloader=True)
