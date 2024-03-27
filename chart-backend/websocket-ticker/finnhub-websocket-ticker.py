import datetime
import json

import pandas as pd
import psycopg2
import websocket

pd.set_option('display.float_format', '{:.8f}'.format)

CONNECTION = "postgres://postgres:postgres@adi.dev.modernisc.com:5432/finnhub"
conn = psycopg2.connect(CONNECTION)
cursor = conn.cursor()

def on_message(ws, message):
    print(message)
    try:
        msg = json.loads(message)

        cursor = conn.cursor()
        try:
            query = "INSERT INTO raw_trade_data (TIME, SYMBOL, PRICE, QUANTITY)" + \
                    " VALUES (%s,%s,%s,%s)"
            for item in msg["data"]:
                timestamp = datetime.datetime.fromtimestamp(int(item["t"] / 1000))
                record_to_insert = (timestamp, item["s"], item["p"], item["v"])
                cursor.execute(query, record_to_insert)
        except (Exception, psycopg2.Error) as error:
            print(error.pgerror)
        conn.commit()
    except KeyboardInterrupt:
        print("\nStopping due to user request.")

def on_error(ws, error):
    print(error)


def on_close(ws):
    print("### closed ###")


def on_open(ws):
    ws.send('{"type":"subscribe","symbol":"AAPL"}')
    # ws.send('{"type":"subscribe","symbol":"AMZN"}')
    # ws.send('{"type":"subscribe","symbol":"BINANCE:BTCUSDT"}')
    # ws.send('{"type":"subscribe","symbol":"IC MARKETS:1"}')


if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("wss://ws.finnhub.io?token=co1c0lhr01qgulhr2shgco1c0lhr01qgulhr2si0",
                                on_message=on_message,
                                on_error=on_error,
                                on_close=on_close)
    ws.on_open = on_open
    ws.run_forever(reconnect=5)
