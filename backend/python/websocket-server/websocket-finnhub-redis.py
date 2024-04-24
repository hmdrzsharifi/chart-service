import json
import redis
from flask import Flask
from flask_socketio import SocketIO
from multiprocessing import Process

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
        current_symbol = symbol
        redis_pubsub = redis_client.pubsub()
        redis_pubsub.subscribe("crypto", "stock")
        for message in redis_pubsub.listen():
            if message['type'] == 'message':
                candle_data = json.loads(message['data'])
                if candle_data['s'] == str(current_symbol):
                    socketio.emit('message', candle_data)

    except Exception as e:
        print("Error:", e)


if __name__ == '__main__':
    # Start a separate process for the Flask app
    flask_process = Process(target=socketio.run, kwargs={'app': app, 'host': '172.31.13.30', 'port': 8000, 'debug': False})

    # Start a separate process for handling Redis messages
    redis_process = Process(target=handle_candle_message)

    # Start both processes
    flask_process.start()
    redis_process.start()

    # Wait for both processes to finish
    flask_process.join()
    redis_process.join()






