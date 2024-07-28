import logging
import finnhub
import pandas as pd
from flask import Flask, request, jsonify, current_app
from flask_cors import CORS
import json
from flask_caching import Cache
import hashlib
from datetime import datetime, timedelta
import requests


pd.set_option('display.float_format', '{:.8f}'.format)

app = Flask(__name__)
CORS(app, resources={r'*': {'origins': '*'}})
app.config.from_object('config.Config')  # Load configuration from base_config.py


# Configure caching
cache = Cache(app, config={'CACHE_TYPE': 'simple'})


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
def get_all_symbols():
    url = current_app.config['SYMBOLS_API_URL']
    try:
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as exp:
        current_app.logger.error(f"Error fetching symbols: {exp}")
        return jsonify({"error": "Failed to fetch symbols"}), 500


def normalize_dates(from_timestamp, to_timestamp, timeframe):
    from_date = datetime.utcfromtimestamp(from_timestamp)
    to_date = datetime.utcfromtimestamp(to_timestamp)

    if timeframe == '1M':
        # Normalize to the nearest 5 minutes interval
        from_date = from_date.replace(second=0, microsecond=0, minute=(from_date.minute // 5) * 5)
        to_date = to_date.replace(second=0, microsecond=0, minute=(to_date.minute // 5) * 5)
    elif timeframe == '5M':
        from_date = from_date.replace(second=0, microsecond=0)
        to_date = to_date.replace(second=0, microsecond=0)
    elif timeframe == '15M':
        from_date = from_date.replace(second=0, microsecond=0, minute=(from_date.minute // 15) * 15)
        to_date = to_date.replace(second=0, microsecond=0, minute=(to_date.minute // 15) * 15)
    elif timeframe == '30M':
        from_date = from_date.replace(second=0, microsecond=0, minute=(from_date.minute // 30) * 30)
        to_date = to_date.replace(second=0, microsecond=0, minute=(to_date.minute // 30) * 30)
    elif timeframe == '1H':
        from_date = from_date.replace(minute=0, second=0, microsecond=0)
        to_date = to_date.replace(minute=0, second=0, microsecond=0)
    elif timeframe == 'D':
        from_date = from_date.replace(hour=0, minute=0, second=0, microsecond=0)
        to_date = to_date.replace(hour=0, minute=0, second=0, microsecond=0)
    elif timeframe == 'W':
        from_date = from_date - timedelta(days=from_date.weekday())
        from_date = from_date.replace(hour=0, minute=0, second=0, microsecond=0)
        to_date = to_date - timedelta(days=to_date.weekday())
        to_date = to_date.replace(hour=0, minute=0, second=0, microsecond=0)
    elif timeframe == 'M':
        from_date = from_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        to_date = to_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    return int(from_date.timestamp()), int(to_date.timestamp())

def generate_cache_key_fetch_candle_data():
    request_data = request.json
    symbol = request_data.get('Ticker').lower()
    time_frame = request_data.get('TimeFrame')
    from_date = request_data.get('from')
    to_date = request_data.get('to')

    normalized_from, normalized_to = normalize_dates(from_date, to_date, time_frame)

    return f"{symbol}_{time_frame}_{normalized_from}_{normalized_to}"

@app.route('/fetchCandleData', methods=['POST'])
# @cache.cached(timeout=86400, key_prefix=generate_cache_key_fetch_candle_data)  # Cache for 5 minutes
def fetch_candle_data():
    request_data = request.json
    symbol = request_data.get('Ticker')
    symbolCategory = request_data.get('symbolCategory')
    time_frame = request_data.get('TimeFrame')
    from_time = request_data.get('from')
    to_time = request_data.get('to')

    if time_frame == '1M': time_frame = '1'
    if time_frame == '5M': time_frame = '5'
    if time_frame == '15M': time_frame = '15'
    if time_frame == '30M': time_frame = '30'
    if time_frame == '1H': time_frame = '60'
    if time_frame == 'D': time_frame = 'D'

    finnhub_client = finnhub.Client(api_key=current_app.config['FINNHUB_API_KEY'])

    if symbolCategory in ['CRT', 'FX']:
        source, pair = symbol.split(":")
    else:
        source = symbol

    if source == 'BINANCE':
        res = finnhub_client.crypto_candles(symbol, time_frame, from_time, to_time)
    elif source == 'OANDA' or symbolCategory == 'IND':
        res = finnhub_client.forex_candles(symbol, time_frame, from_time, to_time)
    else:
        res = None
        print("Unknown source or symbol category")

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
    host = app.config['HOST']
    port = app.config['PORT']
    debug = app.config['DEBUG']
    app.run(host=host, port=6000, debug=debug)

