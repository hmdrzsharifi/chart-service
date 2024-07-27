import pandas as pd
from flask import Blueprint, Flask, request, jsonify, current_app
from flask_cors import CORS
import hashlib
import datetime
import requests
from datetime import datetime, timedelta
import pytz
import json
import logging
from cache_config import configure_cache, cache
from logging_config import setup_logging


pd.set_option('display.float_format', '{:.8f}'.format)

logger = setup_logging()

app = Flask(__name__)
CORS(app, resources={r'*': {'origins': '*'}})
app.config.from_object('config.Config')  # Load configuration from config.py

configure_cache(app)


def generate_cache_key_get_all_symbols():
    logging.debug("Generating cache key.")
    args = request.args  # For GET requests
    if args:
        key = json.dumps(request.args, sort_keys=True)  # Sort keys for consistency
    else:
        key = 'static_key_for_all_symbols'  # Static key when there are no query parameters

    cache_key = hashlib.md5(key.encode('utf-8')).hexdigest()
    logging.debug(f"Generated cache key: {cache_key}")
    return cache_key

@app.route('/getAllSymbols', methods=['GET'])
@cache.cached(timeout=86400, key_prefix=generate_cache_key_get_all_symbols)  # Cache for 1 day
def get_all_symbols():
    logger.info('Fetching all symbols.')

    url = current_app.config['SYMBOLS_API_URL']
    try:
        response = requests.get(url)
        response.raise_for_status()
        symbols = response.json()
        logger.debug(f"Successfully fetched symbols: {symbols}")
        return jsonify(symbols)
    except requests.RequestException as exp:
        logger.error(f"Error fetching symbols: {exp}")
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
    symbol = request_data.get('Ticker').lower()
    symbolCategory = request_data.get('symbolCategory')
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

    # if symbolCategory in ['CRT', 'FX']:
    #     source, pair = symbol.split(":")
    # else:
    #     source = symbol

    if time_frame == 'D':
        url = f"https://financialmodelingprep.com/api/v3/historical-price-full/{symbol}?from={formatted_from_date}&to={formatted_to_date}&apikey={api_key}"
    else:
        url = f"https://financialmodelingprep.com/api/v3/historical-chart/{time_frame}/{symbol}?from={formatted_from_date}&to={formatted_to_date}&apikey={api_key}"

    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        historical_data = data['historical'] if time_frame == 'D' else data
        historical_data_sorted = sorted(historical_data,
                                        key=lambda x: x['date'])  # Replace 'date' with the appropriate key to sort by
        if time_frame not in ['D', 'W', 'M']:
            for entry in historical_data_sorted:
                # entry['date'] = convert_to_utc(entry['date'])
                entry['date'] = convert_to_utc(entry['date'])

        logger.info('Fetch Candles: %s %s %d %s %s', symbol, time_frame, len(historical_data_sorted), from_date,
                    to_date)
        return jsonify(historical_data_sorted)
    else:
        return jsonify({"error": "Failed to retrieve data"}), response.status_code


def convert_to_utc(date_string, timezone='US/Eastern'):
    local = pytz.timezone(timezone)
    naive = datetime.strptime(date_string, '%Y-%m-%d %H:%M:%S')
    local_dt = local.localize(naive, is_dst=None)
    utc_dt = local_dt.astimezone(pytz.utc)
    return utc_dt.strftime('%Y-%m-%d %H:%M:%S')


def convert_iso_to_date(iso_string):
    # Parse the ISO 8601 string to a datetime object
    dt = datetime.fromisoformat(iso_string.replace('Z', '+00:00'))
    # Format the datetime object to a date string (YYYY-MM-DD)
    date_string = dt.strftime('%Y-%m-%d')
    return date_string

def fetch_earnings_cache_key():
    request_data = request.json
    return generate_cache_key(
        prefix='earnings',
        symbol=request_data.get('Ticker', '').lower(),
        from_date = (convert_iso_to_date(request_data.get('from'))),
        to_date = (convert_iso_to_date(request_data.get('to')))
    )
@app.route('/fetchEarnings', methods=['POST'])
@cache.cached(timeout=86400, key_prefix=fetch_earnings_cache_key)
def fetch_earnings():
    try:
        request_data = request.json
        symbol = request_data.get('Ticker').lower()
        from_date = request_data.get('from')
        to_date = request_data.get('to')

        if not symbol or not from_date or not to_date:
            logger.error("Missing required parameters: 'Ticker', 'from', or 'to'")
            return jsonify({"error": "Missing required parameters: 'Ticker', 'from', or 'to'"}), 400

        formatted_from_date = convert_iso_to_date(from_date)
        formatted_to_date = convert_iso_to_date(to_date)
        api_key = current_app.config['FMP_API_KEY']

        url = f"https://financialmodelingprep.com/api/v3/historical/earning_calendar/{symbol}?apikey={api_key}"

        response = requests.get(url)

        if response.status_code != 200:
            logger.error(f"Failed to retrieve data: {response.status_code} - {response.text}")
            return jsonify({"error": "Failed to retrieve data"}), response.status_code

        data = response.json()

        filtered_data = [
            entry for entry in data
            if formatted_from_date <= entry['date'] <= formatted_to_date
        ]

        logger.info(f"Successfully fetched and filtered earnings data for {symbol}")
        return jsonify(filtered_data)
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An internal error occurred"}), 500


def generate_cache_key(prefix, symbol, from_date, to_date):
    key_data = f"{prefix}_{symbol}_{from_date}_{to_date}"
    return hashlib.md5(key_data.encode('utf-8')).hexdigest()

def fetch_dividends_cache_key():
    request_data = request.json
    return generate_cache_key(
        prefix='dividends',
        symbol=request_data.get('Ticker', '').lower(),
        from_date = (convert_iso_to_date(request_data.get('from'))),
        to_date = (convert_iso_to_date(request_data.get('to')))
    )
def normalize_date_to_day(date):
    return date.replace(hour=0, minute=0, second=0, microsecond=0)

@app.route('/fetchDividends', methods=['POST'])
@cache.cached(timeout=86400, key_prefix=fetch_dividends_cache_key)
def fetch_dividends():
    try:
        request_data = request.json
        symbol = request_data.get('Ticker')
        from_date = request_data.get('from')
        to_date = request_data.get('to')

        if not symbol or not from_date or not to_date:
            logger.error("Missing required parameters: 'Ticker', 'from', or 'to'")
            return jsonify({"error": "Missing required parameters: 'Ticker', 'from', or 'to'"}), 400

        formatted_from_date = convert_iso_to_date(from_date)
        formatted_to_date = convert_iso_to_date(to_date)
        api_key = current_app.config['FMP_API_KEY']

        url = f"https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from={formatted_from_date}&to={formatted_to_date}&apikey={api_key}"

        response = requests.get(url)

        if response.status_code != 200:
            logger.error(f"Failed to retrieve data: {response.status_code} - {response.text}")
            return jsonify({"error": "Failed to retrieve data"}), response.status_code

        data = response.json()

        filtered_data = [
            entry for entry in data
            if symbol == entry['symbol']
        ]

        logger.info(f"Successfully fetched and filtered earnings data for {symbol}")
        return jsonify(filtered_data)
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An internal error occurred"}), 500


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


if __name__ == '__main__':
    host = app.config['HOST']
    port = app.config['PORT']
    debug = app.config['DEBUG']

app.run(host=host, port=port, debug=debug, use_reloader=True)
