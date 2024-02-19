from flask import Flask
from flask_socketio import SocketIO, emit, send
import psycopg2

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
    handle_candle_message(data)


def handle_candle_message(message):
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM chart WHERE symbol = ? AND date = ?",
                       (message[0], message[1]))
        data = cursor.fetchall()
        socketio.send({'server_message': data})
        socketio.emit({'message': data})
    except (Exception, psycopg2.Error) as error:
        print(error.pgerror)
    conn.close()



if __name__ == '__main__':
    CONNECTION = "postgres://postgres:postgres@adi.dev.modernisc.com:5432/chart"
conn = psycopg2.connect(CONNECTION)
cursor = conn.cursor()

socketio.run(app, host='0.0.0.0', port=8004, debug=False)
