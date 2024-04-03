package com.example.chart.repository;

import com.example.chart.model.CandleData;
import com.example.chart.model.SymbolData;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Objects;

@Repository
public class TradeDataRepositoryImpl implements TradeDataRepository {

    private final JdbcTemplate jdbcTemplate;

    public TradeDataRepositoryImpl(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public int save(SymbolData symbolData) {
        return jdbcTemplate.update(
                "INSERT INTO raw_trade_data (TIME, SYMBOL, PRICE, QUANTITY) VALUES (?,?,?,?)",
                symbolData.getTime(), symbolData.getSymbol(), symbolData.getPrice(), symbolData.getVolume());
    }

    @Override
    public CandleData findCandleOneMinute(String symbol, String timeframe) {
        String tableName = "";
        if (Objects.equals(timeframe, "1m")) {
            tableName = "one_minute_candle";
        }
        String sql = "SELECT symbol, EXTRACT(EPOCH FROM bucket) AS unix_timestamp, open, high, low, close, volume " +
                "FROM " + tableName + " " +
                "WHERE symbol = ? " +
                "ORDER BY bucket DESC LIMIT 1";


        List<CandleData> result = jdbcTemplate.query(sql, new Object[]{symbol}, new YourRowMapper());
        return result.isEmpty() ? null : result.get(0);
    }

    private static class YourRowMapper implements RowMapper<CandleData> {
        @Override
        public CandleData mapRow(ResultSet rs, int rowNum) throws SQLException {
            CandleData data = new CandleData();
            data.setSymbol(rs.getString("symbol"));
            data.setUnix_timestamp(Double.parseDouble(rs.getString("unix_timestamp")));
            data.setOpen(Double.parseDouble(rs.getString("open")));
            data.setHigh(Double.parseDouble(rs.getString("high")));
            data.setLow(Double.parseDouble(rs.getString("low")));
            data.setClose(Double.parseDouble(rs.getString("close")));
            data.setVolume(Double.parseDouble(rs.getString("volume")));
            return data;
        }
    }
}
