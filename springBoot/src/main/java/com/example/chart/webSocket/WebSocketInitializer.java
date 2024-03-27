package com.example.chart.webSocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.stereotype.Component;

@Component
public class WebSocketInitializer {

    private final WebSocketManager webSocketManager;

    @Autowired
    public WebSocketInitializer(WebSocketManager webSocketManager) {
        this.webSocketManager = webSocketManager;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        webSocketManager.connect();
    }
}