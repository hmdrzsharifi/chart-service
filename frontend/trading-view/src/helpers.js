import {FINNHUB_DATA_ADDRESS, FMP_DATA_ADDRESS} from "./constants.js";


let symbolMap = new Map();
export {symbolMap};

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

export async function fetchCandleData(symbolCategory, requestBody, url) {
    try {
        const response = await fetch(url + '/fetchCandleData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const json = await response.json();
        const resultData = [];
        if (json.length > 0) {
            json.forEach((entry) => {
                resultData.push(symbolCategory === 'STC' || symbolCategory === 'ETF'? mapObjectFMP(entry) : mapObjectFinnhub(entry));
            });
        }
        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        throw error; // Re-throw the error for the calling code to handle
    }
}
export async function getAllSymbols() {
    let allSymbols = [];
    try {
        const response = await fetch(FMP_DATA_ADDRESS + '/getAllSymbols', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();

        json.forEach((entry) => {
            allSymbols.push(mapSymbolResult(entry));
            symbolMap.set(entry.symbol, mapSymbolResult(entry));
        });
        return allSymbols;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        throw error; // Re-throw the error for the calling code to handle
    }
}

function mapSymbolResult(originalObject) {
    let type = getType(originalObject.categoryName)

    return {
        symbol: originalObject.symbol,
        full_name: originalObject.symbol,
        description: originalObject.symbol,
        // exchange:'BINANCE',
        exchange: '',
        type: type,
    };
}

const getType = (categoryName) => {
    switch (categoryName) {
        case 'CRT':
            return 'CRT';
        case 'FX':
            return 'FX';
        case 'CMD':
            return 'CMD';
        case 'IND':
            return 'IND';
        case 'ETF':
            return 'ETF';
        case 'STC':
            return 'STC';
        default:
            return 'CRT';
    }
};


export function mapObjectFinnhub(originalObject) {
    return {
        time: new Date(originalObject.t * 1000),
        open: originalObject.o,
        high: originalObject.h,
        low: originalObject.l,
        close: originalObject.c,
        volume: originalObject.v,
    };
}

export function mapObjectFMP(originalObject) {
    return {
        time: new Date(originalObject.date),
        open: originalObject.open,
        high: originalObject.high,
        low: originalObject.low,
        close: originalObject.close,
        volume: originalObject.volume
    };
}