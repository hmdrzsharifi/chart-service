import {FINNHUB_DATA_ADDRESS, FMP_DATA_ADDRESS} from "./constants.js";


export async function fetchCandleDataFinnhub(symbol, symbolCategory, tf, from, to) {

    const requestBody = {
        "Ticker": symbol,
        "symbolCategory": symbolCategory,
        "TimeFrame": tf,
        "from": from,
        "to": to
    };
    console.log({requestBody})

    const resultData = [];
    try {
        const response = await fetch(FINNHUB_DATA_ADDRESS +'/fetchCandleData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        if (json.length > 0) {
            json.forEach((entry) => {
                resultData.push(mapObjectFinnhub(entry));
            });
        }
        console.log({resultData})
        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        throw error; // Re-throw the error for the calling code to handle
    }
}

export async function fetchInitialDataFMP(symbol, tf, from, to) {

    const requestBody = {
        "Ticker": symbol,
        "TimeFrame": tf,
        "from": from,
        "to": to
    };
    console.log({requestBody})

    const resultData = [];
    try {
        const response = await fetch(FMP_DATA_ADDRESS +'/fetchCandleData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        if (json.length > 0) {
            json.forEach((entry) => {
                resultData.push(mapObjectFMP(entry));
            });
        }
        console.log({resultData})
        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        throw error; // Re-throw the error for the calling code to handle
    }
}
function mapObjectFinnhub(originalObject) {
    return {
        time: new Date(originalObject.t * 1000),
        open: originalObject.o,
        high: originalObject.h,
        low: originalObject.l,
        close: originalObject.c,
        volume: originalObject.v,
    };
}

function mapObjectFMP(originalObject) {
    return {
        time: new Date(originalObject.date),
        open: originalObject.open,
        high: originalObject.high,
        low: originalObject.low,
        close: originalObject.close,
        volume: originalObject.volume
    };
}