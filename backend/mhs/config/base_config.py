class BaseConfig:
    ENV = 'development'
    SYMBOLS_API_URL = 'http://185.148.147.219:4444/api/v1/services/all/symbols'
    FINNHUB_API_KEY = 'cppbtv9r01qn2da2dd6gcppbtv9r01qn2da2dd70'
    FMP_API_KEY = 'fng76oNvOTV9fiNj1QlDCoU1gbZCNtrh'
    HOST = '0.0.0.0'
    PORT = 5000
    DEBUG = True
    USE_RELOADER = False

    # Database
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:mysql@adi.dev.modernisc.com/app_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Cache Configurations
    CACHE_TYPE = 'simple'
    # CACHE_TYPE = 'redis'
    # CACHE_REDIS_URL = 'redis://:mypassword@adi.dev.modernisc.com:6379/0'
    # CACHE_DEFAULT_TIMEOUT = 300

# class Config:
#     SYMBOLS_API_URL = "https://default-url.com/api"
#
# class DevelopmentConfig(Config):
#     DEBUG = True
#     SYMBOLS_API_URL = "https://dev-url.com/api"
#
# class TestingConfig(Config):
#     TESTING = True
#     SYMBOLS_API_URL = "https://test-url.com/api"
#
# class ProductionConfig(Config):
#     DEBUG = False
#     SYMBOLS_API_URL = "https://prod-url.com/api"