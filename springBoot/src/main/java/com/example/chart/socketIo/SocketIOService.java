package com.example.chart.socketIo;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.concurrent.CompletableFuture;

@Service
public class SocketIOService {

    private final SocketIOServer server;

    public SocketIOService(SocketIOServer server) {
        this.server = server;
    }

    @PostConstruct
    public void setupListeners() {
        server.addEventListener("message", Object.class, (client, data, ackSender) -> {
            System.out.println("Received message: " + data);
            sendMessage(data.toString());
        });
    }


    public CompletableFuture<String> sendMessage(String message) {
        CompletableFuture<String> future = new CompletableFuture<>();
        server.getBroadcastOperations().sendEvent("message", message);
        return future;
    }

}
