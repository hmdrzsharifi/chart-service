package com.example.chart.websocket.ticker;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class WebSocketInitializer {

    private final WebSocketManager webSocketManager;

    public WebSocketInitializer(WebSocketManager webSocketManager) {
        this.webSocketManager = webSocketManager;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        webSocketManager.connect();
    }
}