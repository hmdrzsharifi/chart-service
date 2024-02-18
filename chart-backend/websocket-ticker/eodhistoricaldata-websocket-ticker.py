import time
import pandas as pd
from eodhd import WebSocketClient

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

 try:
     msg = None
     while client.running:
         if msg is not None and client.message != msg:
             print(client.message)
             // todo insert into timescaledb
         msg = client.message
 except KeyboardInterrupt:
     print("\nStopping due to user request.")
     client.stop()