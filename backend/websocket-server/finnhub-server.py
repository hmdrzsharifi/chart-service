import json
import threading
import websocket
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")


@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('message')
def handle_message(message):
    print('Received message:', message)


def websocket_thread():
    def on_message(ws, message):
        try:
            msg = json.loads(message)
            for item in msg["data"]:
                print('Received message:', item)
                socketio.emit('message', item)  # Emit the message to all connected clients
        except KeyboardInterrupt:
            print("\nStopping due to user request.")

    def on_error(ws, error):
        print(error)

    def on_close(ws):
        print("### closed ###")

    def on_open(ws):
        ws.send('{"type":"subscribe","symbol":"BINANCE:BTCUSDT"}')

    # websocket.enableTrace(True)  # Disable verbose tracing
    ws = websocket.WebSocketApp("wss://ws.finnhub.io?token=co60qgpr01qmuouob0cgco60qgpr01qmuouob0d0",
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)
    ws.on_open = on_open
    ws.run_forever(reconnect=5)


if __name__ == "__main__":
    websocket_thread = threading.Thread(target=websocket_thread)
    websocket_thread.start()
    socketio.run(app, host='0.0.0.0', port=8000, debug=False)
