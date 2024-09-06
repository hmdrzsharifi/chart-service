import {TWELVE_DATA_ADDRESS} from "./constants.js";

let symbolMap = new Map();
export {symbolMap};

export async function fetchCandleData(requestBody, url) {
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
                // resultData.push(symbolCategory === 'STC' || symbolCategory === 'ETF'? mapObjectFMP(entry) : mapObjectFinnhub(entry));
                resultData.push(mapObjectTwelve(entry));
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
        const response = await fetch(TWELVE_DATA_ADDRESS + '/getAllSymbols', {
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

export async function fetchEarnings(symbol, from, to) {
    const requestBody = {
        "ticker": symbol,
        "from": from,
        "to": to
    };
    const resultData = [];
    try {
        const response = await fetch(TWELVE_DATA_ADDRESS +'/fetchEarnings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            // throw new Error(`HTTP error! status: ${response.status}`);
            return [];
        }

        const resultData = await response.json();

        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        return error; // Re-throw the error for the calling code to handle
    }
}

export async function fetchDividends(symbol, from, to) {
    const requestBody = {
        "ticker": symbol,
        "from": from,
        "to": to
    };
    const resultData = [];
    try {
        const response = await fetch(TWELVE_DATA_ADDRESS +'/fetchDividends', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            // throw new Error(`HTTP error! status: ${response.status}`);
            return [];
        }

        const resultData = await response.json();

        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        return error; // Re-throw the error for the calling code to handle
    }
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


export function mapObjectTwelve(originalObject) {
    return {
        time: new Date(originalObject.datetime + 'Z'),
        open: originalObject.open,
        high: originalObject.high,
        low: originalObject.low,
        close: originalObject.close,
        // volume: originalObject.volume
    };
}