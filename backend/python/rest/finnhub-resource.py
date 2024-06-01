import logging
import finnhub
import pandas as pd
from flask import Flask, request
from flask_cors import CORS
import json
from flask_caching import Cache
import hashlib
import datetime
import requests


pd.set_option('display.float_format', '{:.8f}'.format)

app = Flask(__name__)
CORS(app, resources={r'*': {'origins': '*'}})

# Configure caching
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

# redis level 1 caching
# cache = Cache(app, config={
# 'CACHE_TYPE': 'redis',
# 'CACHE_REDIS_URL': 'redis://:mypassword@adi.dev.modernisc.com:6379/0',
# 'CACHE_DEFAULT_TIMEOUT': 300
# })

# def make_cache_key():
#     logging.debug("make_cache_key function called")
#     request_data = request.get_json()
#     if request_data:
#         from_time = request_data.get('from')
#         to_time = request_data.get('to')
#
#         # Convert timestamps to human-readable dates
#         from_date = datetime.datetime.fromtimestamp(from_time).strftime('%Y-%m-%d')
#         to_date = datetime.datetime.fromtimestamp(to_time).strftime('%Y-%m-%d')
#
#         # Use the dates along with other request parameters to generate the key
#         key_data = {
#             'Ticker': request_data.get('Ticker'),
#             'TimeFrame': request_data.get('TimeFrame'),
#             'from_date': from_date,
#             'to_date': to_date
#         }
#
#         key = json.dumps(key_data, sort_keys=True)  # Sort keys for consistency
#         cache_key = hashlib.md5(key.encode('utf-8')).hexdigest()
#         logging.debug(f"Generated cache key: {cache_key}")
#         return cache_key
#     return None

def make_getSymbols_cache_key_():
    logging.debug("make_getSymbols_cache_key_ function called")
    args = request.args  # For GET requests
    if args:
        key = json.dumps(request.args, sort_keys=True)  # Sort keys for consistency
    else:
        key = 'static_key_for_all_symbols'  # Static key when there are no query parameters
    cache_key = hashlib.md5(key.encode('utf-8')).hexdigest()
    logging.debug(f"Generated cache key: {cache_key}")
    return cache_key

@app.route('/getAllSymbols', methods=['GET'])
@cache.cached(timeout=86400, key_prefix=make_getSymbols_cache_key_) # Cache for 1 day
def getAllSymbols():
    url = 'http://91.92.108.4:4444/api/v1/services/all/symbols'
    response = requests.get(url)

    if response.status_code == 200:
        return response.json()  # Use jsonify to return a proper JSON response
    else:
        response.raise_for_status()


@app.route('/fetchCandleData', methods=['POST'])
# @cache.cached(timeout=300, key_prefix=make_cache_key)  # Cache for 5 minutes
def fetch_candle_data():
    request_data = request.json
    symbol = request_data.get('Ticker')
    time_frame = request_data.get('TimeFrame')
    from_time = request_data.get('from')
    to_time = request_data.get('to')

    if time_frame == '1M': time_frame = '1'
    if time_frame == '5M': time_frame = '5'
    if time_frame == '15M': time_frame = '15'
    if time_frame == '30M': time_frame = '30'
    if time_frame == '1H': time_frame = '60'

    finnhub_client = finnhub.Client(api_key="co60qgpr01qmuouob0cgco60qgpr01qmuouob0d0")
    print(request_data)
    # Stock candles
    res = finnhub_client.stock_candles(symbol, time_frame, from_time, to_time)

    if res.get('s') == "ok":
        df = pd.DataFrame(res)
        # Convert to JSON
        json_data = df.to_json(orient='records')
    else:
        json_data = json.dumps(res)
    return json_data


@app.route('/clearCache', methods=['GET'])
def clear_cache():
    cache.clear()
    logging.debug("Cache cleared")
    return "Cache cleared", 200


if __name__ == '__main__':
    SECRET = "co60qgpr01qmuouob0cgco60qgpr01qmuouob0d0"
    app.run(host='0.0.0.0', port=5000, debug=False)

