import {
    subscribeOnStream,
    unsubscribeFromStream,
} from './streaming.js';

import {DATA_ADDRESS} from "./constants.js";

const url = DATA_ADDRESS;

const lastBarsCache = new Map();
export {lastBarsCache}; // Named export for lastBarsCache

// DatafeedConfiguration implementation

function mapObjectFinnhub(originalObject) {
    return {
        // time: timeToTz(originalObject.t, "Asia/Tehran"),
        time: new Date(originalObject.t * 1000),
        open: originalObject.o,
        high: originalObject.h,
        low: originalObject.l,
        close: originalObject.c,
    };
}

function mapSymbolResult(originalObject) {
    let type;

    if (originalObject.categoryName == 'CRT') {
        type = 'CRT';
    }
    if (originalObject.categoryName == 'FX') {
        type = 'FX';
    }
    if (originalObject.categoryName == 'CMD') {
        type = 'CMD';
    }
    if (originalObject.categoryName == 'IND') {
        type = 'IND';
    }
    if (originalObject.categoryName == 'ETF') {
        type = 'ETF';
    }
    if (originalObject.categoryName == 'STC') {
        type = 'STC';
    }
    return {
        symbol: originalObject.symbol,
        full_name: originalObject.symbol,
        description: originalObject.symbol,
        // exchange:'BINANCE',
        exchange: '',
        type: type,
    };
}

const configurationData = {
    // Represents the resolutions for bars supported by your datafeed
    supported_resolutions: ['1', '5', '15', '30', '60', '1D', '1W', '1M'],

    // The `exchanges` arguments are used for the `searchSymbols` method if a user selects the exchange
    exchanges: [{
        value: '',
        name: '',
        desc: '',
    },
    ],
    // The `symbols_types` arguments are used for the `searchSymbols` method if a user selects this symbol type
    symbols_types: [{
        name: 'CRT',
        value: 'CRT',
    },
        {
            name: 'FX',
            value: 'FX',
        },
        {
            name: 'STC',
            value: 'STC',
        },

    ],
};

// Obtains all symbols for all exchanges supported by CryptoCompare API
async function getAllSymbols() {
    let allSymbols = [];
    try {
        const response = await fetch('http://91.92.108.4:4444/api/v1/services/all/symbols', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        // console.log({json})

        json.forEach((entry) => {
            allSymbols.push(mapSymbolResult(entry));
        });
        // console.log({allSymbols})
        return allSymbols;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        throw error; // Re-throw the error for the calling code to handle
    }

}

export default {
    // lastBarsCache : lastBarsCache,

    onReady: (callback) => {
        console.log('[onReady]: Method call');
        setTimeout(() => callback(configurationData));
    },

    searchSymbols: async (
        userInput,
        exchange,
        symbolType,
        onResultReadyCallback,
    ) => {
        console.log('[searchSymbols]: Method call');
        let symbols = await getAllSymbols();
        symbols.filter(value => value.type == symbolType)
        onResultReadyCallback(symbols);
    },

    resolveSymbol: async (
        symbolName,
        onSymbolResolvedCallback,
        onResolveErrorCallback,
        extension
    ) => {
        console.log('[resolveSymbol]: Method call', symbolName);
        // Symbol information object
        const symbolInfo = {
            ticker: symbolName.replace('_USD', 'USDT'),
            name: symbolName,
            description: symbolName,
            type: 'CRT',
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: 'crypto',
            minmov: 1,
            pricescale: 100,
            has_intraday: true,
            has_no_volume: true,
            has_weekly_and_monthly: false,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: 2,
            data_status: 'streaming',
        };

        console.log('[resolveSymbol]: Symbol resolved', symbolName);
        onSymbolResolvedCallback(symbolInfo);
    },

    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        const {from, to, firstDataRequest} = periodParams;
        let reqResolution;

        if (resolution === '1') {
            reqResolution = '1M';
        } else if (resolution === '5') {
            reqResolution = '5M';
        } else if (resolution === '15') {
            reqResolution = '15M';
        } else if (resolution === '30') {
            reqResolution = '30M';
        } else if (resolution === '60') {
            reqResolution = '1H';
        } else if (resolution === '1D') {
            reqResolution = 'D';
        } else if (resolution === '1W') {
            reqResolution = 'W';
        } else if (resolution === '1M') {
            reqResolution = 'M';
        } else {
            console.log("Unsupported resolution!");
        }

        // let fromDate;

        /*switch (resolution) {
            case "1":
                fromDate = Math.floor(new Date().getTime() / 1000) - (1000 * 60);
                break;
            case "5":
                fromDate = Math.floor(new Date().getTime() / 1000) - (1000 * 300);
                break;
            case "15":
                fromDate = Math.floor(new Date().getTime() / 1000) - (1000 * 900);
                break;
            case "30":
                fromDate = Math.floor(new Date().getTime() / 1000) - (1000 * 1800);
                break;
            case "60":
                fromDate = Math.floor(new Date().getTime() / 1000) - (1000 * 3600);
                break;
            case "1D":
                fromDate = Math.floor(new Date().getTime() / 1000) - (1000 * 24 * 3600);
                break;
            case "1W":
                fromDate = Math.floor(new Date().getTime() / 1000) - (1000 * 7 * 24 * 3600);
                break;
            case "1M":
                //todo for 30 and 31 days
                fromDate = Math.floor(new Date().getTime() / 1000) - (1000 * 30 * 24 * 3600);
                break;

            default:
                fromDate = Math.floor(new Date().getTime() / 1000) - (1000 * 24 * 3600)
        }*/

        let rawData = window.tvWidget.symbolInterval().symbol.split(':')
        let rawSymbol;
        if (rawData.length == 1) {
            rawSymbol = rawData[0];
        }
        if (rawData.length == 2) {
            rawSymbol = rawData[1].replace('_USD', 'USDT')
        }
        if (rawData.length == 3) {
            rawSymbol = rawData[2].replace('_USD', 'USDT')
        }

        const requestBody = {
            "Ticker": 'BINANCE:' + rawSymbol,
            "TimeFrame": reqResolution,
            "from": from,
            "to": to
        };
        const resultData = [];
        try {
            const response = await fetch(url + '/fetchCandleData', {
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

            json.forEach((entry) => {
                resultData.push(mapObjectFinnhub(entry));
            });

            if (firstDataRequest) {
                lastBarsCache.set('BINANCE:' + rawSymbol, {
                    ...resultData[resultData.length - 1],
                });
            }

            console.log(`[getBars]: returned ${resultData.length} bar(s)`);
            onHistoryCallback(resultData, {
                noData: false,
            });
        } catch (error) {
            console.error('There was an error fetching the candle data:', error);
            throw error; // Re-throw the error for the calling code to handle
        }
    },

    subscribeBars: (
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback,
    ) => {
        console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
        let rawData = window.tvWidget.symbolInterval().symbol.split(':')
        let rawSymbol;
        if (rawData.length == 1) {
            rawSymbol = rawData[0]
        }
        if (rawData.length == 2) {
            rawSymbol = rawData[1].replace('_USD', 'USDT')
        }
        if (rawData.length == 3) {
            rawSymbol = rawData[2].replace('_USD', 'USDT')
        }

        subscribeOnStream(
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscriberUID,
            onResetCacheNeededCallback,
            lastBarsCache.get('BINANCE:' + rawSymbol),
        );
    },

    unsubscribeBars: (subscriberUID) => {
        console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
        unsubscribeFromStream(subscriberUID);
    },
};
