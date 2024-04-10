import json
import psycopg2
from flask import Flask
from flask_socketio import SocketIO
import threading
from datetime import datetime, timezone
import pytz
from datetime import datetime
import time
from datetime import datetime

# import time

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
    timeframe = json['timeFrame']
    handle_candle_message(symbol, timeframe)


def handle_candle_message(symbol, timeframe):
    print(symbol)
    cursor = conn.cursor()
    try:
        # query_1m = (f"SELECT symbol, EXTRACT(EPOCH FROM bucket) AS unix_timestamp, open, high, low, close, volume "
        #          f"FROM one_minute_candle "
        #          f"WHERE symbol = %s "
        #          f"ORDER BY bucket"
        #          f" DESC LIMIT 1")

        # query_5s = ("SELECT symbol, TO_TIMESTAMP(EXTRACT(EPOCH FROM bucket)) AT TIME ZONE current_setting('TIMEZONE') AS local_timestamp, open, high, low, close, volume "
        query_5s = ("SELECT symbol, (EXTRACT(EPOCH FROM bucket) WITH  TIME ZONE 'UTC') AS unix_timestamp, open, high, low, close, volume "
                    "FROM ("
                    "   SELECT symbol, bucket, open, high, low, close, volume, ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY bucket DESC) AS rn "
                    "FROM five_seconds_candle1 WHERE symbol = %s "
                    ") AS sub "
                    "WHERE rn = 1;")

        cursor.execute(query_5s, (symbol,))

        last_candle = cursor.fetchone()
        print("candle data ", last_candle)
        print("########################################")

        # print(last_candle[1])
        # print(last_candle[0])
        # print(last_candle[2])
        # print(last_candle[3])
        # print(last_candle[4])
        # print(last_candle[5])
        # print(last_candle[6])

        dt_utc = pytz.utc.localize(last_candle[1])
        timestamp_utc = int(dt_utc.timestamp())

        result = {
            # "t": int(time.mktime(last_candle[1].timetuple()))
            "t": timestamp_utc,
            "m": last_candle[0],
            "o": last_candle[2],
            "h": last_candle[3],
            "l": last_candle[4],
            "c": last_candle[5],
            "v": last_candle[6]
        }

        socketio.send({'server_message':  json.dumps(result)})

        # time.sleep(5)
        threading.Timer(5, handle_candle_message, args=(symbol, timeframe)).start()

    # socketio.emit({'message': last_candle})
    except (Exception, psycopg2.Error) as error:
        print(error.pgerror)
    # conn.close()

    # finally:
    #     # conn.commit()
    #     # cursor.close()
    #     time.sleep(5)  # Add a 5-second interval before the next call

if __name__ == '__main__':
    CONNECTION = "postgres://postgres:postgres@adi.dev.modernisc.com:5432/chart"
    # CONNECTION = "postgres://postgres:postgres@localhost:5432/chart"
    conn = psycopg2.connect(CONNECTION)
    cursor = conn.cursor()

    socketio.run(app, host='0.0.0.0', port=8000, debug=False)
