import hashlib
import json
import logging
import time
from datetime import datetime, timedelta

import finnhub
import pandas as pd
import requests
from flask import Flask, request, jsonify, current_app, Response
from flask_caching import Cache
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

pd.set_option('display.float_format', '{:.8f}'.format)

app = Flask(__name__)
CORS(app, resources={r'*': {'origins': '*'}})
app.config.from_object('config.Config')  # Load configuration from base_config.py
# db = SQLAlchemy(app)

# Configure caching
cache = Cache(app, config={'CACHE_TYPE': 'simple'})


# redis level 1 caching
# cache = Cache(app, config={
# 'CACHE_TYPE': 'redis',
# 'CACHE_REDIS_URL': 'redis://:mypassword@adi.dev.modernisc.com:6379/0',
# 'CACHE_DEFAULT_TIMEOUT': 300
# })


# class Chart(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     ownerSource = db.Column(db.String(255), nullable=False)
#     ownerId = db.Column(db.String(255), nullable=False)
#     name = db.Column(db.String(255), nullable=False)
#     content = db.Column(db.Text, nullable=False)
#     lastModified = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
#     symbol = db.Column(db.String(255), nullable=False)
#     resolution = db.Column(db.String(255), nullable=False)


def common_response(data):
    return jsonify(data)


def common_error(message):
    return jsonify({'status': 'error', 'message': message}), 400


def parseRequest(request):
    # This is a placeholder. Implement your request parsing logic here.
    return {'error': None, 'response': None, 'clientId': 'someClientId', 'userId': 'someUserId'}


@app.route('/1.0/charts', methods=['GET', 'POST', 'DELETE'])
def process_request():
    clientId = request.args.get('client')
    userId = request.args.get('user')
    chartId = request.args.get('chart')

    if request.method == 'GET':
        return get_chart_content(clientId, userId, chartId)

    if request.method == 'DELETE':
        if chartId == '':
            return common_error('Wrong chart id')
        else:
            return remove_chart(clientId, userId, chartId)

    if request.method == 'POST':
        chartName = request.form.get('name')
        symbol = request.form.get('symbol')
        resolution = request.form.get('resolution')
        content = request.form.get('content')
        if chartId == None:
            return save_chart(clientId, userId, chartName, symbol, resolution, content)
        else:
            return rewrite_chart(clientId, userId, chartId, chartName, symbol, resolution, content)
    else:
        return common_error('Wrong request')


def response(content):
    result = Response(content)
    result.headers["Access-Control-Allow-Origin"] = "*"
    result.headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS"
    result.headers["Content-Type"] = "application/json"
    return result


# def get_chart_content(clientId, userId, chartId):
#     if chartId == None:
#         return getAllUserCharts(clientId, userId)
#     else:
#         chart = Chart.query.filter_by(id=chartId, ownerSource=clientId, ownerId=userId).first()
#         result = json.dumps({'status': 'ok', 'data': {'id': chart.id, 'name': chart.name,
#                                                       'timestamp': time.mktime(chart.lastModified.timetuple()),
#                                                       'content': chart.content}})
#         return response(result)
#

# def getAllUserCharts(clientId, userId):
#     chartsList = Chart.query.filter_by(ownerSource=clientId, ownerId=userId)
#     result = map(
#         lambda x: {'id': x.id, 'name': x.name, 'timestamp': time.mktime(x.lastModified.timetuple()), 'symbol': x.symbol,
#                    'resolution': x.resolution}, chartsList)
#     return response(json.dumps({'status': "ok", 'data': list(result)}))


# def remove_chart(clientId, userId, chartId):
#     chart = Chart.query.filter_by(ownerSource=clientId, ownerId=userId, id=chartId).first()
#     if chart:
#         db.session.delete(chart)
#         db.session.commit()
#         return common_response({'status': 'ok'})
#     else:
#         return common_error('Chart not found')


# def save_chart(clientId, userId, chartName, symbol, resolution, content):
#     new_chart = Chart(
#         ownerSource=clientId,
#         ownerId=userId,
#         name=chartName,
#         content=content,
#         lastModified=datetime.utcnow(),
#         symbol=symbol,
#         resolution=resolution
#     )
#     db.session.add(new_chart)
#     db.session.commit()
#     return common_response({'status': 'ok', 'id': new_chart.id})


# def rewrite_chart(clientId, userId, chartId, chartName, symbol, resolution, content):
#     chart = Chart.query.filter_by(ownerSource=clientId, ownerId=userId, id=chartId).first()
#     if chart:
#         chart.lastModified = datetime.utcnow()
#         chart.content = content
#         chart.name = chartName
#         chart.symbol = symbol
#         chart.resolution = resolution
#
#         db.session.commit()
#         return common_response({'status': 'ok'})
#     else:
#         return common_error('Chart not found')


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

def generate_cache_key_fetch_candle_data():
    request_data = request.json
    symbol = request_data.get('Ticker').lower()
    time_frame = request_data.get('TimeFrame')
    from_date = request_data.get('from')
    to_date = request_data.get('to')

    normalized_from, normalized_to = normalize_dates(from_date, to_date, time_frame)

    return f"{symbol}_{time_frame}_{normalized_from}_{normalized_to}"


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

@app.route('/fetchCandleData', methods=['POST'])
@cache.cached(timeout=86400, key_prefix=generate_cache_key_fetch_candle_data)  # Cache for 5 minutes
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

    finnhub_client = finnhub.Client(api_key=current_app.config['FINNHUB_API_KEY'])
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
    # with app.app_context():
        # db.create_all()
    host = app.config['HOST']
    port = app.config['PORT']
    debug = app.config['DEBUG']
    app.run(host=host, port=8000, debug=debug)
