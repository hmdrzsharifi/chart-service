package com.example.chart.webSocket;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONObject;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.net.URI;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class WebSocketManager {

    private WebSocketClient client;

    private final ExecutorService executorService = Executors.newSingleThreadExecutor();

//    @PostConstruct
    public void connect() {
        client = new WebSocketClient(URI.create("wss://ws.finnhub.io?token=cneoim9r01qq13fns8b0cneoim9r01qq13fns8bg")) {
            @Override
            public void onOpen(ServerHandshake serverHandshake) {
                System.out.println("Connected to server.");
//				JSONObject APPLEMessage = new JSONObject();
//				APPLEMessage.put("type", "subscribe");
//				APPLEMessage.put("symbol", "AAPL");
//				send(APPLEMessage.toString());
                JSONObject BTCUSDTMessage = new JSONObject();
                BTCUSDTMessage.put("type", "subscribe");
                BTCUSDTMessage.put("symbol", "BINANCE:BTCUSDT");
                send(BTCUSDTMessage.toString());

            }

            @Override
            public void onMessage(String s) {
                System.out.println("Received data: " + s);
            }

            @Override
            public void onClose(int i, String s, boolean b) {
                System.out.println("Connection closed. Trying to reconnect...");
                reconnectWebSocket();
            }

            @Override
            public void onError(Exception e) {
                e.printStackTrace();
            }
        };
        client.connect();
    }
//    public void reconnectWebSocket(){
//        client.reconnect();
//    }

    private void reconnectWebSocket() {
        executorService.submit(() -> {
            while (!client.isOpen()) {
                try {
                    Thread.sleep(60000); // sleep for one minute
                    client.reconnect();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });
    }

    @PreDestroy
    public void cleanUp() {
        executorService.shutdown();
        client.close();
    }

}
