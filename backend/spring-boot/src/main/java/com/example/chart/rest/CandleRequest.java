package com.example.chart.rest;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandleRequest {

    private String symbol;
    private String tf;
    private long from_time;
    private long to_time;
}
