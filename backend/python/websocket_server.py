#!/usr/bin/env python
import ast
import asyncio
import json

from websockets.server import serve


async def handler(websocket):
    try:
        file_path = 'websocket-data.json'
        try:
            with open(file_path, 'r') as file:
                # Read the file line by line
                for line in file:
                    # Parse each line as JSON
                    try:
                        data = ast.literal_eval(line)
                        print("Data loaded successfully:")

                        message_to_send = data
                        await websocket.send(json.dumps(message_to_send))
                        await asyncio.sleep(1)

                    except json.JSONDecodeError as e:
                        print(f"Error decoding JSON: {e}")
        except FileNotFoundError:
            print(f"File not found: {file_path}")

    except serve.exceptions.ConnectionClosedOK:
        print("WebSocket connection closed.")

async def main():
    async with serve(handler, "192.168.95.128", 8002):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())
