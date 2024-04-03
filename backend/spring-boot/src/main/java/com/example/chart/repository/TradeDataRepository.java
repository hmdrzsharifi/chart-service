package com.example.chart.repository;

import com.example.chart.model.CandleData;
import com.example.chart.model.SymbolData;

public interface TradeDataRepository {

    int save(SymbolData symbolData);

    CandleData findCandleOneMinute(String symbol, String timeframe);
}
