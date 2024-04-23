import json
from datetime import time
import websocket
import redis

redis_client = redis.StrictRedis(host='adi.dev.modernisc.com', port=6379, db=0 , password="mypassword" , decode_responses=True)

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
            for item in msg["data"]:
                if(item["s"] == "BINANCE:BTCUSDT"):
                    # redis_client.lpush('BINANCE:BTCUSDT', json.dumps(item))
                    redis_client.publish("BINANCE:BTCUSDT", json.dumps(item))
                    print("Message BINANCE:BTCUSDT saved to Redis")
                if(item["s"] == "AAPL"):
                    # redis_client.lpush('AAPL', json.dumps(item))
                    redis_client.publish("AAPL", json.dumps(item))
                    print("Message AAPL saved to Redis")


        except KeyboardInterrupt:
            print("\nStopping due to user request.")

    def on_error(self, ws, error):
        print("Error:", error)

    def on_close(self, ws):
        print("Connection closed")

    def on_open(self, ws):
        ws.send('{"type":"subscribe","symbol":"AAPL"}')
        # ws.send('{"type":"subscribe","symbol":"AMZN"}')
        ws.send('{"type":"subscribe","symbol":"BINANCE:BTCUSDT"}')
        # ws.send('{"type":"subscribe","symbol":"IC MARKETS:1"}')

if __name__ == "__main__":
    ws_url = 'wss://ws.finnhub.io?token=co60qgpr01qmuouob0cgco60qgpr01qmuouob0d0'
    client = WebSocketClient(ws_url)
    client.connect()