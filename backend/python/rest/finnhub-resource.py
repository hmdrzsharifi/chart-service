import logging
import finnhub
import pandas as pd
from flask import Flask, request
from flask_cors import CORS
import json
from flask_caching import Cache
import hashlib

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
def make_cache_key():
    logging.debug("make_cache_key function called")
    request_data = request.get_json()
    if request_data:
        key = json.dumps(request_data, sort_keys=True)  # Sort keys for consistency
        cache_key = hashlib.md5(key.encode('utf-8')).hexdigest()
        logging.debug(f"Generated cache key: {cache_key}")
        return cache_key
    return None

@app.route('/fetchCandleData', methods=['POST'])
@cache.cached(timeout=300, key_prefix=make_cache_key)  # Cache for 5 minutes
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

    finnhub_client = finnhub.Client(api_key=SECRET)
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

if __name__ == '__main__':
    SECRET = "co60qgpr01qmuouob0cgco60qgpr01qmuouob0d0"
    app.run(host='0.0.0.0', port=5000, debug=False)
