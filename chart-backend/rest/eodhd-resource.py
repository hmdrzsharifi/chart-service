from flask import Flask, Blueprint, request
from flask_cors import CORS
import pandas as pd

from eodhd import APIClient

pd.set_option('display.float_format', '{:.8f}'.format)

app = Flask(__name__)
CORS(app, resources={r'*': {'origins': '*'}})


@app.route('/fetchCandleData', methods=['POST'])
def fetch_candle_data():
    request_data = request.json
    symbol = request_data.get('Ticker')
    tf = request_data.get('TimeFrame')
    from_time = request_data.get('from')
    to_time = request_data.get('to')

    response_data = api.get_historical_data(symbol, tf, from_time, to_time)
    response = response_data.to_json(orient='records', lines=True).splitlines()

    return response


if __name__ == '__main__':
    api = APIClient("62c547eb00d445.30059582")
    app.run(host='0.0.0.0', port=5000, debug=True)
