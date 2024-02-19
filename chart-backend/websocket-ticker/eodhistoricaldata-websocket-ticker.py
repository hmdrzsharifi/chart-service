import time
import pandas as pd
from eodhd import WebSocketClient
import psycopg2

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

CONNECTION = "postgres://postgres:postgres@adi.dev.modernisc.com:5432/chart"
conn = psycopg2.connect(CONNECTION)
cursor = conn.cursor()

try:
    msg = None
    while client.running:
        if msg is not None and client.message != msg:
            candle_1m = json.loads(client.message)

            cursor = conn.cursor()
            try:
                cursor.execute("INSERT INTO stock_prices_1m (symbol, date, open, high, low, close, volume) VALUES (%s, %s, %s, %s, %s, %s, %s);",
                               (candle_1m[0], candle_1m[1], candle_1m[2], candle_1m[3], candle_1m[4], candle_1m[5], candle_1m[6]))
            except (Exception, psycopg2.Error) as error:
                print(error.pgerror)
            conn.commit()
            print(client.message)
        msg = client.message
except KeyboardInterrupt:
    print("\nStopping due to user request.")
    client.stop()
