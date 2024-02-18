from flask import Flask
from flask_socketio import SocketIO, emit, send


app = Flask(__name__)
socketio = SocketIO(app)


def send_candle_1m_to_client(candle_data):
    socketio.emit('candle_1m', candle_data)


@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@socketio.on('message')
def handle_message(data):
    print('received message: ' + data)


def handle_candle_message(message):
    print("Handling message in main:", message)
    socketio.send({'server_message': message})
    socketio.emit({'message': message})


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8004, debug=False)