package com.example.chart.repository;

import com.example.chart.model.CandleData;
import com.example.chart.model.TradeData;

public interface TradeDataRepository {

    int save(TradeData tradeData);

    CandleData findCandleOneMinute(String symbol, String timeframe);
}
