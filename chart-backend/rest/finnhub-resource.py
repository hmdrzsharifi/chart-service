import json

import finnhub
import pandas as pd

finnhub_client = finnhub.Client(api_key="cneoim9r01qq13fns8b0cneoim9r01qq13fns8bg")

# Stock candles
res = finnhub_client.stock_candles('AAPL', 'D', 1590988249, 1591852249)
# Convert to JSON
print(res)
json_result = json.dumps(res)
#
# # Print JSON result
print(json_result)
#
# # Convert each row to JSON
# json_results = []
# for row in res:
#     json_results.append(json.dumps(row))
#
# # Print JSON results
# for json_result in json_results:
#     print(json_result)
#
# #Convert to Pandas Dataframe
# print(pd.DataFrame(res))