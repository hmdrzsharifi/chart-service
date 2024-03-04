import json
from flask import Flask
from flask_socketio import SocketIO, emit
import websocket

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


def send_candle_1m_to_client(candle_data):
    socketio.emit('candle_1m', candle_data)


@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@socketio.on('message')
def handle_message(json):
    symbol = json['symbol']
    ws.send('{"type":"subscribe","symbol":{"AAPL"}}')
    # timeframe = json['timeFrame']
    # handle_candle_message(symbol, timeframe)


# def handle_candle_message(symbol, timeframe):

    # ws.send('{"type":"subscribe","symbol":"AAPL"}')

    # cursor = conn.cursor()
    # try:
    #     if timeframe == "1m":
    #         table_name = "one_minute_candle"
    #     if timeframe == "1d":
    #         table_name = "one_day_candle"
    #
    #     query = (f"SELECT symbol, EXTRACT(EPOCH FROM bucket) AS unix_timestamp, open, high, low, close, volume "
    #              f"FROM {table_name} "
    #              f"WHERE symbol = %s "
    #              f"ORDER BY bucket"
    #              f" DESC LIMIT 1")
    #     cursor.execute(query, (symbol,))
    #
    #     last_candle = cursor.fetchone()
    #     print("candle data ", last_candle)
    #
    #     print(last_candle[1])
    #     print(last_candle[0])
    #     print(last_candle[2])
    #     print(last_candle[3])
    #     print(last_candle[4])
    #     print(last_candle[5])
    #     print(last_candle[6])
    #
    #     result = {
    #         "t": last_candle[1],
    #         "m": last_candle[0],
    #         "o": last_candle[2],
    #         "h": last_candle[3],
    #         "l": last_candle[4],
    #         "c": last_candle[5],
    #         "v": last_candle[6]
    #     }
    #
    #     socketio.send({'server_message':  json.dumps(result)})
    #     # socketio.emit({'message': last_candle})
    # except (Exception, psycopg2.Error) as error:
    #     print(error.pgerror)


def on_message(ws, message):
    print(message)
    socketio.send({'server_message': message})


def on_error(ws, error):
    print(error)


def on_close(ws):
    print("### closed ###")


# def on_open(ws):
#     ws.send('{"type":"subscribe","symbol":"AAPL"}')
#     ws.send('{"type":"subscribe","symbol":"AMZN"}')
#     ws.send('{"type":"subscribe","symbol":"BINANCE:BTCUSDT"}')
#     ws.send('{"type":"subscribe","symbol":"IC MARKETS:1"}')


if __name__ == '__main__':
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("wss://ws.finnhub.io?token=cneoim9r01qq13fns8b0cneoim9r01qq13fns8bg",
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)
    # ws.on_open = on_open
    ws.run_forever()

    socketio.run(app, host='0.0.0.0', port=8000, debug=False)
