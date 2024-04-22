import json

import redis
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)


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
        candle_data = redis_client.lpop(symbol)
        # candle_data = redis_client.lindex(symbol, -1) //get last data in list
        if candle_data:
            candle_data = json.loads(candle_data.decode())
            socketio.emit('message', candle_data)
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=False)
