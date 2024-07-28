# cache_config.py
from flask_caching import Cache

cache = Cache()

def configure_cache(app):
    cache.init_app(app, config={'CACHE_TYPE': 'simple'})
    # cache.init_app(app, config={'CACHE_TYPE': app.config['CACHE_TYPE'],
    #                             'CACHE_REDIS_URL': app.config['CACHE_REDIS_URL'],
    #                             'CACHE_DEFAULT_TIMEOUT': app.config['CACHE_DEFAULT_TIMEOUT']})
