import datetime
import json

import pandas as pd
import psycopg2
import websocket

pd.set_option('display.float_format', '{:.8f}'.format)

#CONNECTION = "postgres://postgres:postgres@localhost:5432/chart"
CONNECTION = "postgres://postgres:postgres@adi.dev.modernisc.com:5432/chart"
conn = psycopg2.connect(CONNECTION)
cursor = conn.cursor()

class WebSocketClient:
    def __init__(self, url):
        self.url = url
        self.ws = None

    def connect(self):
        while True:
            try:
                print("Connecting to", self.url)
                self.ws = websocket.WebSocketApp(self.url,
                                                 on_message=self.on_message,
                                                 on_error=self.on_error,
                                                 on_close=self.on_close)
                self.ws.on_open = self.on_open
                self.ws.run_forever()
            except Exception as e:
                print("Connection error:", e)
                print("Retrying in 5 seconds...")
                time.sleep(5)

    def on_message(self, ws, message):
        print("Received message:", message)
        try:
            msg = None
            msg = json.loads(message)

            cursor = conn.cursor()
            try:
                query = "INSERT INTO raw_trade_data1 (TIME, SYMBOL, PRICE, QUANTITY)" + \
                        " VALUES (%s,%s,%s,%s)"
                for item in msg["data"]:
                    # timestamp = datetime.datetime.fromtimestamp(int(item["t"] / 1000))
                    timestamp = datetime.datetime.utcfromtimestamp(item["t"] / 1000).replace(tzinfo=datetime.timezone.utc)
                    # timestamp = item["t"]
                    # record_to_insert = (timestamp, item["s"], item["p"], item["q"])
                    record_to_insert = (timestamp, item["s"], item["p"], item["v"])
                    cursor.execute(query, record_to_insert)
            except (Exception, psycopg2.Error) as error:
                print(error.pgerror)
            conn.commit()
            print(message)
            msg = message
        except KeyboardInterrupt:
            print("\nStopping due to user request.")


    def on_error(self, ws, error):
        print("Error:", error)


    # def on_close(ws):
    #     print("### closed ###")

    def on_close(self, ws):
        print("Connection closed")

    def on_open(self, ws):
        # ws.send('{"type":"subscribe","symbol":"AAPL"}')
    #     ws.send('{"type":"subscribe","symbol":"AMZN"}')
        ws.send('{"type":"subscribe","symbol":"BINANCE:BTCUSDT"}')
    #     ws.send('{"type":"subscribe","symbol":"IC MARKETS:1"}')


if __name__ == "__main__":
    # websocket.enableTrace(True)
    ws_url = 'wss://ws.finnhub.io?token=co60qgpr01qmuouob0cgco60qgpr01qmuouob0d0'
    client = WebSocketClient(ws_url)
    client.connect()
    # ws = websocket.WebSocketApp("wss://ws.finnhub.io?token=co60qgpr01qmuouob0cgco60qgpr01qmuouob0d0",
    #                             on_message=on_message,
    #                             on_error=on_error,
    #                             on_close=on_close)
    # ws.on_open = on_open
    # ws.run_forever(ping_interval = 10, ping_timeout = 9)
