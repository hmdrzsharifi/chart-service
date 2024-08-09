class Config:
    SYMBOLS_API_URL = 'http://91.92.108.4:4444/api/v1/services/all/symbols'
    FINNHUB_API_KEY = 'cppbtv9r01qn2da2dd6gcppbtv9r01qn2da2dd70'
    HOST = '0.0.0.0'
    PORT = 5000
    DEBUG = False
    # SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:mysql@adi.dev.modernisc.com/app_db'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:password@localhost/centralized'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
