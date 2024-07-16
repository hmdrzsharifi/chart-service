import {
    subscribeOnStream,
    unsubscribeFromStream,
} from './streaming.js';

import {DATA_ADDRESS, FMP_DATA_ADDRESS, PLATFORM_ADDRESS} from "./constants.js";
import {
    fetchCandleDataFinnhub,
    fetchInitialDataFMP,
    mapObjectFinnhub,
    mapObjectFMP, getAllSymbols,
    symbolMap
} from "./helpers.js";

const url = DATA_ADDRESS;

const lastBarsCache = new Map();
export {lastBarsCache};

/*function mapObjectFinnhub(originalObject) {
    return {
        time: new Date(originalObject.t * 1000),
        open: originalObject.o,
        high: originalObject.h,
        low: originalObject.l,
        close: originalObject.c,
    };
}*/

/*function mapSymbolResult(originalObject) {
    let type = getType(originalObject.categoryName)
    // let type;

    /!*if (originalObject.categoryName == 'CRT') {
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
    *!/
    return {
        symbol: originalObject.symbol,
        full_name: originalObject.symbol,
        description: originalObject.symbol,
        // exchange:'BINANCE',
        exchange: '',
        type: type,
    };
}*/

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
    symbols_types: [
        {
            name: 'ALL',
            value: 'ALL',
        },
        {
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
        {
            name: 'IND',
            value: 'IND',
        },
    ],
};

// Obtains all symbols for all exchanges supported by CryptoCompare API
// let symbolMap = new Map();

/*async function getAllSymbols() {
    let allSymbols = [];
    try {
        const response = await fetch(PLATFORM_ADDRESS + '/api/v1/services/all/symbols', {
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
}*/

export default {

    onReady: (callback) => {
        setTimeout(() => callback(configurationData));
    },

    searchSymbols: async (
        userInput,
        exchange,
        symbolType,
        onResultReadyCallback,
    ) => {
        // console.log('[searchSymbols]: Method call');
        let symbols = await getAllSymbols();
        // symbols.filter(value => value.type == symbolType)
        let filteredSymbols;
        if (symbolType === 'ALL') {
            filteredSymbols = symbols.filter(value =>
                value.symbol.toLowerCase().includes(userInput.toLowerCase()) &&
                (!exchange || value.exchange === exchange)
            );
        } else {
            filteredSymbols = symbols.filter(value =>
                value.symbol.toLowerCase().includes(userInput.toLowerCase()) &&
                value.type === symbolType &&
                (!exchange || value.exchange === exchange)
            );
        }
        onResultReadyCallback(filteredSymbols);
    },

    resolveSymbol: async (
        symbolName,
        onSymbolResolvedCallback,
        onResolveErrorCallback,
        extension
    ) => {
        // console.log('[resolveSymbol]: Method call', symbolName);
        // Symbol information object
        let symbolCategory;
        if (symbolMap.has(symbolName)) {
            symbolCategory = symbolMap.get(symbolName).type
        } else {
            //symbolCategory = window.tvWidget._options.symbolCategory // For Server
            symbolCategory = 'CRT' // For Test
        }
        const symbolInfo = {
            ticker: symbolName.replace('_USD', 'USDT'),
            name: symbolName,
            description: symbolName,
            type: symbolCategory,
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: symbolCategory,
            minmov: 1,
            pricescale: 10000,
            has_intraday: true,
            visible_plots_set: true,
            has_weekly_and_monthly: false,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: 2,
            data_status: 'streaming',
        };

        // console.log('[resolveSymbol]: Symbol resolved', symbolName);
        setTimeout(() => onSymbolResolvedCallback(symbolInfo));

    },

    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        const {from, to, firstDataRequest, countBack} = periodParams;

        const resolutionMapping = {
            '1': '1M',
            '5': '5M',
            '15': '15M',
            '30': '30M',
            '60': '1H',
            '1D': 'D',
            '1W': 'W',
            '1M': 'M'
        };

        const reqResolution = resolutionMapping[resolution];

        /*        let reqResolution;

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

        // const symbolCategory =  window.tvWidget._options.symbolCategory; // For Server
        const symbolCategory = symbolInfo.type; // For Test

        let ticker = '';

        switch (symbolCategory) {
            case 'CRT':
                ticker = 'BINANCE' + ':' + rawSymbol
                break;
            case 'FX':
                ticker = 'OANDA' + ':' + rawSymbol
                break;
            case 'STC':
                ticker = rawSymbol
                break;
            case 'ETF':
                ticker = rawSymbol
                break;
            case 'CMD':
                ticker = 'OANDA' + ':' + rawSymbol
                break;
            case 'IND':
                if (rawSymbol == "DJIUSDT") {
                    ticker = "^DJI"
                }
                break;
            default:
                console.error(`Unknown symbol category: ${symbolCategory}`);
        }

        /*if (symbolCategory === 'CRT') {
            ticker = 'BINANCE' + ':' + rawSymbol
        }
        if (symbolCategory == "FX") {
            ticker = 'OANDA' + ':' + rawSymbol
        }
        if (symbolCategory == "STC") {
            ticker = rawSymbol
        }
        if (symbolCategory == "ETF") {
            ticker = rawSymbol
        }
        if (symbolCategory == "CMD") {
            ticker = 'OANDA' + ':' + rawSymbol
        }
        if (symbolCategory == "IND") {
            if (rawSymbol == "DJIUSDT") {
                ticker = "^DJI"
            }
        }
*/

        let resultData = [];
        if (['CRT', 'CMD', 'FX', 'IND'].includes(symbolCategory)) {
            const requestBody = {
                "Ticker": ticker,
                "symbolCategory": symbolCategory,
                "TimeFrame": reqResolution,
                "from": from,
                "to": to
            };
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
                // if (json.s == 'no_data')
                if (json.length > 0) {
                    json.forEach((entry) => {
                        resultData.push(mapObjectFinnhub(entry));
                    });
                }
            } catch (error) {
                console.error('There was an error fetching the candle data:', error);
                throw error; // Re-throw the error for the calling code to handle
            }
        } else if (['STC', 'ETF'].includes(symbolCategory)) {
            console.log("FMP");
            const requestBody = {
                "Ticker": ticker,
                "symbolCategory": symbolCategory,
                "TimeFrame": reqResolution,
                "from": from,
                "to": to
            };
            try {
                const response = await fetch(FMP_DATA_ADDRESS + '/fetchCandleData', {
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
                // if (json.s == 'no_data')
                if (json.length > 0) {
                    json.forEach((entry) => {
                        resultData.push(mapObjectFMP(entry));
                    });
                }
            } catch (error) {
                console.error('There was an error fetching the candle data:', error);
                throw error; // Re-throw the error for the calling code to handle
            }
        } else {
            console.error(`Unsupported symbol category: ${symbolCategory}`);
        }


        if (firstDataRequest) {
            /*lastBarsCache.set(symbolCategory + ':' + rawSymbol.replace('USDT', '_USD'), {
                ...resultData[resultData.length - 1],
            });*/

            if (symbolCategory == "STC" || symbolCategory == "ETF") {
                lastBarsCache.set(symbolCategory + ':' + rawSymbol, {
                    ...resultData[resultData.length - 1],
                });
            } else {
                lastBarsCache.set(symbolCategory + ':' + rawSymbol.replace('USDT', '_USD'), {
                    ...resultData[resultData.length - 1],
                });
            }
        }

        // console.log(`[getBars]: returned ${resultData.length} bar(s)`);
        onHistoryCallback(resultData, {
            noData: false,
        });

    },

    subscribeBars: (
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback,
    ) => {
        // console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
        // let symbolCategory =  window.tvWidget._options.symbolCategory; // For Server
        let symbolCategory = symbolInfo.type; // For Test
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

        function last() {
            if (symbolCategory == "STC" || symbolCategory == "ETF") {
                return lastBarsCache.get(symbolCategory + ':' + rawSymbol)
            } else {
                return lastBarsCache.get(symbolCategory + ':' + rawSymbol.replace('USDT', '_USD'))
            }
            // return lastBarsCache.get(symbolCategory + ':' + rawSymbol)
        }

        subscribeOnStream(
            symbolInfo,
            resolution,
            onRealtimeCallback,
            subscriberUID,
            onResetCacheNeededCallback,
            last(),
        );
    },

    unsubscribeBars: (subscriberUID) => {
        // console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
        unsubscribeFromStream(subscriberUID);
    },
};
