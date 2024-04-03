package com.example.chart.websocket.server;

import com.corundumstudio.socketio.SocketIOServer;
import com.example.chart.model.CandleData;
import com.example.chart.repository.TradeDataRepositoryImpl;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.LinkedHashMap;
import java.util.concurrent.CompletableFuture;

@Service
public class SocketIOService {

    private final SocketIOServer server;
    private final TradeDataRepositoryImpl jdbcTradeRepository;

    public SocketIOService(SocketIOServer server, TradeDataRepositoryImpl jdbcTradeRepository) {
        this.server = server;
        this.jdbcTradeRepository = jdbcTradeRepository;
    }

    @PostConstruct
    public void setupListeners() {
        server.addEventListener("message", Object.class, (client, data, ackSender) -> {
            System.out.println("Received message: " + data);
            CandleData tradeData = jdbcTradeRepository.findCandleOneMinute((String) ((LinkedHashMap) data).get("symbol"), (String) ((LinkedHashMap) data).get("timeframe"));
            sendMessage(tradeData);
        });
    }

    public CompletableFuture<String> sendMessage(Object message) {
        CompletableFuture<String> future = new CompletableFuture<>();
        server.getBroadcastOperations().sendEvent("message", message);
        return future;
    }

}
