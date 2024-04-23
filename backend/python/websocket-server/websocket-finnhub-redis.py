import json

import redis
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

redis_client = redis.StrictRedis(host='adi.dev.modernisc.com', port=6379, db=0, password="mypassword",
                                 decode_responses=True)

current_subscription = None


@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@socketio.on('message')
def handle_message(data):
    symbol = data['symbol']
    handle_candle_message(symbol)


def handle_candle_message(symbol):
    global current_subscription
    try:
        redis_pubsub = redis_client.pubsub()
        if current_subscription is not None or current_subscription != symbol:
            if(current_subscription is not None):
                redis_pubsub.unsubscribe(current_subscription)
            current_subscription = symbol

        redis_pubsub.subscribe(str(current_subscription))
        for message in redis_pubsub.listen():
            if message['type'] == 'message':
                candle_data = json.loads(message['data'])
                if(candle_data['s'] == 'BINANCE:BTCUSDT'):
                    socketio.emit('BINANCE:BTCUSDT', candle_data)
                if (candle_data['s'] == 'AAPL'):
                    socketio.emit('AAPL', candle_data)

    except Exception as e:
        print("Error:", e)


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=False)
