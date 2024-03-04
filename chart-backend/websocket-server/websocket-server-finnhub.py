import json
import threading

import websocket
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

ws_connection = dict()
ws_connection_lock = threading.Lock()


def on_message(ws, message):
    print('Received message from WebSocket:', message)
    socketio.send({'server_message': json.dumps(message)})
    # send_candle_1m_to_client(message)


def on_error(ws, error):
    print("Error:", error)


def on_close(ws):
    print("### WebSocket closed ###")


def on_open(ws):
    print("### WebSocket opened ###")

    # Save the WebSocket connection globally
    global ws_connection
    with ws_connection_lock:
        ws_connection = ws

    # Example: Subscribe to some data
    ws.send('{"type":"subscribe","symbol":"AAPL"}')
    ws.send('{"type":"subscribe","symbol":"AMZN"}')
    ws.send('{"type":"subscribe","symbol":"BINANCE:BTCUSDT"}')


# WebSocket thread
def websocket_thread():
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("wss://ws.finnhub.io?token=cneoim9r01qq13fns8b0cneoim9r01qq13fns8bg",
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)
    ws.on_open = on_open
    # ws_connection  = ws
    ws.run_forever()


# Flask-SocketIO events
@socketio.on('connect')
def handle_connect():
    print('Client connected')


@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@socketio.on('message')
def handle_message(message):
    print("hiii")
    # if ws_connection:
    global ws_connection

    print(ws_connection)
    # Send message to WebSocket if it's connected
    with ws_connection_lock:
        if ws_connection:
            try:
                ws_connection.send(message)
            except AttributeError as e:
                print("AttributeError:", e)
                print("WebSocket connection is not ready yet.")


if __name__ == '__main__':
    # Start WebSocket thread
    websocket_thread = threading.Thread(target=websocket_thread)
    websocket_thread.start()

    # Start Flask-SocketIO app
    socketio.run(app, host='0.0.0.0', port=8000, debug=True)
