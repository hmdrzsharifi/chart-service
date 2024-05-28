import time
from datetime import datetime, timedelta

import requests
import schedule


def fetch_and_cache_candle_data():
    tickers = ['BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'BINANCE:LTCUSDT']

    url = "http://localhost:5000/fetchCandleData"
    to_date = datetime.now()
    from_date = to_date - timedelta(days=150)

    from_timestamp = int(from_date.timestamp())
    to_timestamp = int(to_date.timestamp())

    headers = {'Content-Type': 'application/json'}

    for ticker in tickers:
        payload = {
            'Ticker': ticker,
            'TimeFrame': 'D',
            'from': from_timestamp,
            'to': to_timestamp
        }

        response = requests.post(url, json=payload, headers=headers)

        if response.status_code == 200:
            print(f"Data fetched and cache filled successfully for {ticker}")
        else:
            print(f"Failed to fetch data for {ticker}: {response.status_code} - {response.text}")


# Schedule the job to run every 30 seconds
schedule.every(30).seconds.do(fetch_and_cache_candle_data)

if __name__ == "__main__":
    print("Scheduler started")
    while True:
        schedule.run_pending()
        time.sleep(1)
