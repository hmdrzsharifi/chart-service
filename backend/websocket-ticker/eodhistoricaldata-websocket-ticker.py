import datetime
import json

import pandas as pd
import psycopg2
from eodhd import WebSocketClient

pd.set_option('display.float_format', '{:.8f}'.format)

client = WebSocketClient(
    api_key="62c547eb00d445.30059582",
    endpoint="crypto",
    symbols=["BTC-USD"],
    display_stream=False,
    display_candle_1m=True,
    display_candle_5m=False,
    display_candle_1h=False,
)
client.start()

# CONNECTION = "postgres://postgres:postgres@adi.dev.modernisc.com:5432/chart"
# connection = psycopg2.connect(user="postgres",
#                               password=config("db_pass"),
#                               host="127.0.0.1",
#                               port="5432",
#                               database="postgres")
CONNECTION = "postgres://postgres:postgres@localhost:5432/chart"
conn = psycopg2.connect(CONNECTION)
cursor = conn.cursor()

try:
    msg = None
    while client.running:
        if msg is not None and client.message != msg:
            msg = json.loads(client.message)

            cursor = conn.cursor()
            try:
                query = "INSERT INTO raw_trade_data (TIME, SYMBOL, PRICE, QUANTITY)"+ \
                     " VALUES (%s,%s,%s,%s)"
                timestamp = datetime.datetime.fromtimestamp(int(msg["t"] / 1000))
                record_to_insert = (timestamp, msg["s"], msg["p"], msg["q"])
                cursor.execute(query, record_to_insert)
            except (Exception, psycopg2.Error) as error:
                print(error.pgerror)
            conn.commit()
            print(client.message)
        msg = client.message
except KeyboardInterrupt:
    print("\nStopping due to user request.")
    client.stop()

if __name__ == '__main__':
    SECRET = "62c547eb00d445.30059582"
    # api = APIClient("62c547eb00d445.30059582")
    # app.run(host='0.0.0.0', port=5000, debug=True)
