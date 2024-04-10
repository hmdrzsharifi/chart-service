import finnhub
import pandas as pd
from flask import Flask, request
from flask_cors import CORS

pd.set_option('display.float_format', '{:.8f}'.format)

app = Flask(__name__)
CORS(app, resources={r'*': {'origins': '*'}})

@app.route('/fetchCandleData', methods=['POST'])
def fetch_candle_data():
    request_data = request.json
    symbol = request_data.get('Ticker')
    time_frame = request_data.get('TimeFrame')
    from_time = request_data.get('from')
    to_time = request_data.get('to')

    if time_frame == '1M': time_frame = '1'

    finnhub_client = finnhub.Client(api_key=SECRET)

    # Stock candles
    res = finnhub_client.stock_candles(symbol, time_frame, from_time, to_time)

    df = pd.DataFrame(res)

    # Convert to JSON
    json_data = df.to_json(orient='records')

    return json_data


if __name__ == '__main__':
    SECRET = "co60qgpr01qmuouob0cgco60qgpr01qmuouob0d0"
    # api = APIClient("62c547eb00d445.30059582")
    app.run(host='0.0.0.0', port=5000, debug=True)
