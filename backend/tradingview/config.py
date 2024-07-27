class Config:
    SYMBOLS_API_URL = 'http://91.92.108.4:4444/api/v1/services/all/symbols'
    FINNHUB_API_KEY = 'co60qgpr01qmuouob0cgco60qgpr01qmuouob0d0'
    HOST = '0.0.0.0'
    PORT = 5000
    DEBUG = False
    # SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:mysql@adi.dev.modernisc.com/app_db'
    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:password@localhost/centralized'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
