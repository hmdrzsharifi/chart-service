# routes.py
from flask import Blueprint, jsonify, request, current_app
import requests
import logging
from .utils import generate_cache_key, normalize_dates, convert_timestamp_to_date, convert_to_utc
from .cache_config import cache

logger = logging.getLogger('my_flask_app')

main = Blueprint('main', __name__)

@main.route('/getAllSymbols', methods=['GET'])
@cache.cached(timeout=86400, key_prefix=lambda: generate_cache_key('get_all_symbols'))
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

@main.route('/fetchCandleData', methods=['POST'])
@cache.cached(timeout=86400, key_prefix=lambda: generate_cache_key('fetch_candle_data', request.json.get('Ticker'), request.json.get('TimeFrame'), request.json.get('from'), request.json.get('to')))
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
        historical_data_sorted = sorted(historical_data, key=lambda x: x['date'])
        if time_frame not in ['D', 'W', 'M']:
            for entry in historical_data_sorted:
                entry['date'] = convert_to_utc(entry['date'])

        logger.info('Fetch Candles: %s %s %d %s %s', symbol, time_frame, len(historical_data_sorted), from_date, to_date)
        return jsonify(historical_data_sorted)
    else:
        return jsonify({"error": "Failed to retrieve data"}), response.status_code

@main.route('/fetchEarnings', methods=['POST'])
def fetch_earnings():
    request_data = request.json
    symbol = request_data.get('Ticker').lower()
    from_date = request_data.get('from')
    to_date = request_data.get('to')

    formatted_from_date = convert_timestamp_to_date(from_date)
    formatted_to_date = convert_timestamp_to_date(to_date)
    api_key = current_app.config['FMP_API_KEY']

    url = f"https://financialmodelingprep.com/api/v3/historical/earning_calendar/{symbol}&apikey={api_key}"

    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        return jsonify(data)
    else:
        return jsonify({"error": "Failed to retrieve data"}), response.status_code

@main.route('/clearCache', methods=['GET'])
def clear_cache():
    cache.clear()
    logger.debug("Cache cleared")
    return "Cache cleared", 200
