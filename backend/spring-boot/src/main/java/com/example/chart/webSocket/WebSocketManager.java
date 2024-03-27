package com.example.chart.webSocket;

import com.example.chart.model.TradeData;
import com.example.chart.repository.JdbcTradeRepository;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.stereotype.Component;

import javax.annotation.PreDestroy;
import java.net.URI;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
public class WebSocketManager {

    private final ExecutorService executorService = Executors.newSingleThreadExecutor();
    private final JdbcTradeRepository jdbcTradeRepository;
    private WebSocketClient client;

    public WebSocketManager(JdbcTradeRepository jdbcTradeRepository) {
        this.jdbcTradeRepository = jdbcTradeRepository;
    }

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
            public void onMessage(String jsonData) {
                System.out.println("Received data: " + jsonData);
                saveData(jsonData);
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

    private void saveData(String jsonData) {
        try {
            JSONObject jsonObject = new JSONObject(jsonData);
            JSONArray dataArray = jsonObject.getJSONArray("data");

            List<TradeData> tradeDataList = new ArrayList<>();
            for (int i = 0; i < dataArray.length(); i++) {
                JSONObject dataObject = dataArray.getJSONObject(i);
                double price = dataObject.getDouble("p");
                String symbol = dataObject.getString("s");
                long time = dataObject.getLong("t");
                double volume = dataObject.getDouble("v");
                Timestamp timestamp = new Timestamp(time);

                TradeData tradeData = new TradeData(price, symbol, timestamp, volume);
                tradeDataList.add(tradeData);
            }
            for (TradeData tradeData : tradeDataList) {
                System.out.println(tradeData);
                jdbcTradeRepository.save(tradeData);
            }

        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

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
