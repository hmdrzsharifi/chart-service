package com.example.chart.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SymbolData {

    private double price;
    private String symbol;
    private Timestamp time;
    private double volume;


    @Override
    public String toString() {
        return "TradeData{" +
                "price=" + price +
                ", symbol='" + symbol + '\'' +
                ", time=" + time +
                ", volume=" + volume +
                '}';
    }
}
