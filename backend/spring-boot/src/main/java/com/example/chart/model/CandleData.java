package com.example.chart.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CandleData {

    private String symbol;
    private double unix_timestamp;
    private double open;
    private double high;
    private double low;
    private double close;
    private double volume;
}
