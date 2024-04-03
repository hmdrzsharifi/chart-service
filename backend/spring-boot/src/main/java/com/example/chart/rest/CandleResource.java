package com.example.chart.rest;

import com.example.chart.model.CandleData;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chart")
public class CandleResource {

    private final RestTemplate restTemplate;
    private Gson gson;

    public CandleResource(RestTemplate restTemplate, Gson gson) {
        this.restTemplate = restTemplate;
        this.gson = new GsonBuilder().create();
    }

    @Value("${candle_url.finnhub}")
    private String candle_url;

    @Value("${token.finnhub}")
    private String token;


    @PostMapping
    public List<String> getCandleData(@RequestBody CandleRequest request) throws JsonProcessingException {

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json");

        String url = candle_url + "?token=" + token + "&symbol=" +
                request.getSymbol().toUpperCase() + "&resolution=" + request.getTf() +
                "&from=" + request.getFrom_time() + "&to=" + request.getTo_time();

        HttpEntity<String> requestEntity = new HttpEntity<>(headers);

        ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);

        String result = responseEntity.getBody();

        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(result);

        List<JsonNode> cList = new ArrayList<>();
        List<JsonNode> hList = new ArrayList<>();
        List<JsonNode> lList = new ArrayList<>();
        List<JsonNode> oList = new ArrayList<>();
        List<JsonNode> vList = new ArrayList<>();
        List<JsonNode> tList = new ArrayList<>();
        String s = jsonNode.get("s").asText();

        for (JsonNode node : jsonNode.get("c")) {
            cList.add(node);
        }
        for (JsonNode node : jsonNode.get("h")) {
            hList.add(node);
        }
        for (JsonNode node : jsonNode.get("l")) {
            lList.add(node);
        }
        for (JsonNode node : jsonNode.get("o")) {
            oList.add(node);
        }
        for (JsonNode node : jsonNode.get("v")) {
            vList.add(node);
        }
        for (JsonNode node : jsonNode.get("t")) {
            tList.add(node);
        }

        List<String> res = new ArrayList<>();
        for (int i = 0; i < cList.size(); i++) {
            StringBuilder builder = new StringBuilder();
            builder.append("{");
            builder.append("\"c\":").append(cList.get(i)).append(",");
            builder.append("\"h\":").append(hList.get(i)).append(",");
            builder.append("\"l\":").append(lList.get(i)).append(",");
            builder.append("\"o\":").append(oList.get(i)).append(",");
            builder.append("\"s\":\"").append(s).append("\",");
            builder.append("\"t\":").append(tList.get(i)).append(",");
            builder.append("\"v\":").append(vList.get(i));
            builder.append("}");
            res.add(builder.toString());
        }
        System.out.println(res);


/*        ObjectMapper mapper = new ObjectMapper();
        ArrayNode jsonNodes = mapper.createArrayNode();
        for (Map<String, Object> row : gson.fromJson(result, StockCandles.class)) {
            ObjectNode node = mapper.createObjectNode(row);
            jsonNodes.add(node);
        }

        String json_data = jsonNodes.toString();*/

        return res;
//
//        finnhub_client = finnhub.Client(api_key=SECRET)
//
//    # Stock candles
//        res = finnhub_client.stock_candles(symbol, tf, from_time, to_time)

    }
}
