import json

import redis
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

redis_client = redis.StrictRedis(host='adi.dev.modernisc.com', port=6379, db=0, password="mypassword",
                                 decode_responses=True)

current_symbol = None


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
    try:
        global current_symbol
        redis_pubsub = redis_client.pubsub()
        redis_pubsub.subscribe("crypto", "stock")
        current_symbol = symbol
        for message in redis_pubsub.listen():
            if message['type'] == 'message':
                candle_data = json.loads(message['data'])
                if candle_data['s'] == str(current_symbol):
                    socketio.emit('message', candle_data)

    except Exception as e:
        print("Error:", e)


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=False)
