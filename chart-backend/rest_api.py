from flask import Flask, jsonify, request
from flask_cors import CORS

import pandas as pd
from eodhd import APIClient

app = Flask(__name__)
CORS(app, resources={r'*': {'origins': '*'}})

# Routes
@app.route('/fetchCandleDataDummy', methods=['POST'])
def fetch_candle_data_dummy():
    try:
        # Read the TSV file into a pandas DataFrame
        df = pd.read_csv('rest-data.tsv', sep='\t')

        # Convert DataFrame to JSON
        json_data = df.to_json(orient='records')

        return jsonify({'data': json_data})

    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

@app.route('/fetchCandleData', methods=['POST'])
def fetch_candle_data():
    request_data = request.json
    symbol = request_data.get('Ticker')
    tf = request_data.get('TimeFrame')
    from_time = request_data.get('from')
    to_time = request_data.get('to')

    response_data = api.get_historical_data(symbol, tf, from_time, to_time)

    return jsonify(response_data)

if __name__ == '__main__':

    api = APIClient("62c547eb00d445.30059582")

    app.run(host='0.0.0.0', port=8080, debug=True)
