package com.example.chart.websocket.ticker;

import com.example.chart.model.SymbolData;
import com.example.chart.repository.TradeDataRepositoryImpl;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
    private final TradeDataRepositoryImpl jdbcTradeRepository;
    private WebSocketClient client;

    @Value("${symbols}")
    private List<String> symbols;

    public WebSocketManager(TradeDataRepositoryImpl jdbcTradeRepository) {
        this.jdbcTradeRepository = jdbcTradeRepository;
    }

    public void connect() {
        client = new WebSocketClient(URI.create("wss://ws.finnhub.io?token=co600h1r01qmuouoaj70co600h1r01qmuouoaj7g")) {
            @Override
            public void onOpen(ServerHandshake serverHandshake) {
                System.out.println("Connected to server.");

                for (String symbol : symbols) {
                    JSONObject BTCUSDTMessage = new JSONObject();
                    BTCUSDTMessage.put("type", "subscribe");
                    BTCUSDTMessage.put("symbol", symbol);
                    send(BTCUSDTMessage.toString());
                }
            }

            @Override
            public void onMessage(String data) {
                System.out.println("Received data: " + data);

                saveData(data);
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

    @Transactional
    void saveData(String jsonData) {
        try {
            JSONObject jsonObject = new JSONObject(jsonData);
            JSONArray dataArray = jsonObject.getJSONArray("data");

            List<SymbolData> symbolDataList = new ArrayList<>();
            for (int i = 0; i < dataArray.length(); i++) {
                JSONObject dataObject = dataArray.getJSONObject(i);
                double price = dataObject.getDouble("p");
                String symbol = dataObject.getString("s");
                long time = dataObject.getLong("t");
                double volume = dataObject.getDouble("v");
                Timestamp timestamp = new Timestamp(time);

                SymbolData symbolData = new SymbolData(price, symbol, timestamp, volume);
                symbolDataList.add(symbolData);
            }

            for (SymbolData symbolData : symbolDataList) {
                System.out.println(symbolData);
                jdbcTradeRepository.save(symbolData);
            }

        } catch (JSONException exp) {
            exp.printStackTrace();
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
