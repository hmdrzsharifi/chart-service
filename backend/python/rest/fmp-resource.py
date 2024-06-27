import logging
import pandas as pd
from flask import Flask, request, jsonify, current_app
from flask_cors import CORS
import json
from flask_caching import Cache
import hashlib
import datetime
import requests
from datetime import datetime
import pytz
import urllib.request as urllib2, json


# from waitress import serve


pd.set_option('display.float_format', '{:.8f}'.format)

app = Flask(__name__)
CORS(app, resources={r'*': {'origins': '*'}})
app.config.from_object('config.Config')  # Load configuration from config.py

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
@cache.cached(timeout=86400, key_prefix=make_getSymbols_cache_key_)  # Cache for 1 day
def get_all_symbols():
    url = current_app.config['SYMBOLS_API_URL']
    try:
        response = requests.get(url)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.RequestException as exp:
        current_app.logger.error(f"Error fetching symbols: {exp}")
        return jsonify({"error": "Failed to fetch symbols"}), 500


# @app.route('/fetchCandleData', methods=['POST'])
# # @cache.cached(timeout=300, key_prefix=make_cache_key)  # Cache for 5 minutes
# def fetch_candle_data():
#     request_data = request.json
#     symbol = request_data.get('Ticker')
#     time_frame = request_data.get('TimeFrame')
#     from_time = request_data.get('from')
#     to_time = request_data.get('to')
#
#     if time_frame == '1M': time_frame = '1'
#     if time_frame == '5M': time_frame = '5'
#     if time_frame == '15M': time_frame = '15'
#     if time_frame == '30M': time_frame = '30'
#     if time_frame == '1H': time_frame = '60'
#
#     finnhub_client = finnhub.Client(api_key=current_app.config['FINNHUB_API_KEY'])
#     print(request_data)
#     # Stock candles
#     res = finnhub_client.stock_candles(symbol, time_frame, from_time, to_time)
#
#     if res.get('s') == "ok":
#         df = pd.DataFrame(res)
#         # Convert to JSON
#         json_data = df.to_json(orient='records')
#     else:
#         json_data = json.dumps(res)
#     return json_data


@app.route('/fetchCandleData', methods=['POST'])
def fetch_candle_data():
    request_data = request.json
    symbol = request_data.get('Ticker').lower()
    time_frame = request_data.get('TimeFrame')
    from_date = request_data.get('from')
    to_date = request_data.get('to')

    formatted_from_date = convert_timestamp_to_date(from_date)
    formatted_to_date = convert_timestamp_to_date(to_date)
    api_key = current_app.config['FMP_API_KEY']

    time_frame_map = {
        '1M': '1min',
        '5M': '5min',
        '15M': '15min',
        '30M': '30min',
        '1H': '1hour',
        'W': '1week',
        'M': '1month'
    }

    time_frame = time_frame_map.get(time_frame, time_frame)

    if time_frame == 'D':
        url = f"https://financialmodelingprep.com/api/v3/historical-price-full/{symbol}?from={formatted_from_date}&to={formatted_to_date}&apikey={api_key}"
    else:
        url = f"https://financialmodelingprep.com/api/v3/historical-chart/{time_frame}/{symbol}?from={formatted_from_date}&to={formatted_to_date}&apikey={api_key}"

    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        historical_data = data['historical'] if time_frame == 'D' else data
        historical_data_sorted = sorted(historical_data, key=lambda x: x['date'])  # Replace 'date' with the appropriate key to sort by
        if time_frame not in ['D', 'W', 'M']:
            for entry in historical_data_sorted:
                entry['date'] = convert_to_utc(entry['date'])

        return jsonify(historical_data_sorted)
    else:
        return jsonify({"error": "Failed to retrieve data"}), response.status_code

@app.route('/clearCache', methods=['GET'])
def clear_cache():
    cache.clear()
    logging.debug("Cache cleared")
    return "Cache cleared", 200

# Function to convert timestamp to date
def convert_timestamp_to_date(from_timestamp):

    # Check if the timestamp is provided
    if from_timestamp is not None:
        # Convert timestamp to datetime object
        date_time_obj = datetime.fromtimestamp(int(from_timestamp))

        # Format the datetime object to a readable date format (e.g., YYYY-MM-DD HH:MM:SS)
        formatted_date = date_time_obj.strftime('%Y-%m-%d')

        return formatted_date
    else:
        return 'Timestamp not provided'

def convert_to_utc(date_str):
    local_tz = pytz.timezone('America/Toronto')  # Assuming the data is in Toronto timezone
    local_dt = local_tz.localize(datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S"))  # Adjust the format as needed
    utc_dt = local_dt.astimezone(pytz.utc)
    return utc_dt.strftime("%Y-%m-%d %H:%M:%S")

# Example usage
if __name__ == '__main__':
    host = app.config['HOST']
    port = app.config['PORT']
    debug = app.config['DEBUG']
    app.run(host=host, port=port, debug=debug)
