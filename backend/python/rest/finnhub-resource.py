import finnhub
import pandas as pd
from flask import Flask, request
from flask_cors import CORS
import json

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


if __name__ == '__main__':
    SECRET = "co60qgpr01qmuouob0cgco60qgpr01qmuouob0d0"
    app.run(host='0.0.0.0', port=5000, debug=False)
