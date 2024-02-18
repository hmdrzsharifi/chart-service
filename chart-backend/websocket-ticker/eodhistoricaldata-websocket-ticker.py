import time
import pandas as pd
from eodhd import WebSocketClient
import psycopg2

pd.set_option('display.float_format', '{:.8f}'.format)

client = WebSocketClient(
    api_key="62c547eb00d445.30059582",
    endpoint="crypto",
    symbols=["BTC-USD"],
    display_stream=True,
    display_candle_1m=False,
    display_candle_5m=False,
    display_candle_1h=False,
)
client.start()


CONNECTION = "postgres://username:password@host:port/dbname"
conn = psycopg2.connect(CONNECTION)
cursor = conn.cursor()
# use the cursor to interact with your database
cursor.execute("SELECT 'hello world'")
print(cursor.fetchone())

sensors = [('a', 'floor'), ('a', 'ceiling'), ('b', 'floor'), ('b', 'ceiling')]
cursor = conn.cursor()
for sensor in sensors:
  try:
    cursor.execute("INSERT INTO sensors (type, location) VALUES (%s, %s);",
                (sensor[0], sensor[1]))
  except (Exception, psycopg2.Error) as error:
    print(error.pgerror)
conn.commit()


try:
    msg = None
    while client.running:
        if msg is not None and client.message != msg:
            print(client.message)
        msg = client.message
except KeyboardInterrupt:
    print("\nStopping due to user request.")
    client.stop()
