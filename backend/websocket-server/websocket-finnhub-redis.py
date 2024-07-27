from flask import Flask
from flask_socketio import SocketIO
from threading import Thread
import redis
import json


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize Redis client for subscription
# redis_client = redis.StrictRedis(host='adi.dev.modernisc.com', port=6379, db=0, password="mypassword", decode_responses=True)
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0, password="", decode_responses=True)
redis_subscriber = redis_client.pubsub()

# Define a thread for subscribing to Redis channels
redis_subscriber_thread = Thread()

# Subscribe to Redis channels and broadcast messages to WebSocket clients
def subscribe_to_redis_channels():
    redis_subscriber.subscribe('crypto', 'stock')
    for message in redis_subscriber.listen():
        if message['type'] == 'message':
            # Broadcast the message to WebSocket clients
            symbol_data = json.loads(message['data'])
            print(symbol_data)
            socketio.emit('message', symbol_data)

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    global redis_subscriber_thread  # Declare as global
    print('Client connected')
    # Start the Redis subscription thread when a client connects
    if not redis_subscriber_thread.is_alive():
        redis_subscriber_thread = Thread(target=subscribe_to_redis_channels)
        redis_subscriber_thread.start()

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=False)