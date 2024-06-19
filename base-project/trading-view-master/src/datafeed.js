import {
    subscribeOnStream,
    unsubscribeFromStream,
} from './streaming.js';

import {DATA_ADDRESS} from "./constants.js";

const url = DATA_ADDRESS;

const lastBarsCache = new Map();
export {lastBarsCache};

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
    supports_search: true,
    supports_group_request: false,
    supports_marks: true,
    supports_timescale_marks: true,
    supports_time: true,

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
    ],
};

// Obtains all symbols for all exchanges supported by CryptoCompare API
let symbolMap = new Map();

async function getAllSymbols() {
    try {
        const response = await fetch(url + '/getAllSymbols', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        let allSymbols = []
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

export default {

    onReady: (callback) => {
        setTimeout(() => callback(configurationData));
    },

    async searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
        try {
            let symbols = await getAllSymbols();
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
        } catch (error) {
            console.error('There was an error searching the symbols:', error);
            onResultReadyCallback([]);
        }
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
            symbolCategory = 'CRT'
        }
        const symbolInfo = {
            ticker: symbolName.replace('_USD', 'USDT'),
            name: symbolName,
            description: symbolName,
            type: symbolCategory,
            session: '24x7',
            timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
            exchange: symbolCategory,
            minmov: 1,
            pricescale: 10000,
            has_intraday: true,
            has_no_volume: false,
            visible_plots_set: true,
            has_weekly_and_monthly: false,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: 0,
            data_status: 'streaming',
        };

        // console.log('[resolveSymbol]: Symbol resolved', symbolName);
        setTimeout(() => onSymbolResolvedCallback(symbolInfo));

    },

    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        const {from, to, firstDataRequest, countBack} = periodParams;
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

        const symbolCategory = symbolInfo.type;
        let ticker = '';
        if (symbolCategory === 'CRT') {
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

        const requestBody = {
            "Ticker": ticker,
            "TimeFrame": reqResolution,
            "from": from,
            "to": to
        };
        let resultData = [];
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

            if (firstDataRequest) {
                lastBarsCache.set(symbolCategory + ':' + rawSymbol.replace('USDT', '_USD'), {
                    ...resultData[resultData.length - 1],
                });
            }

            // console.log(`[getBars]: returned ${resultData.length} bar(s)`);
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
        // console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
        let symbolCategory = symbolInfo.type;
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
            lastBarsCache.get(symbolCategory + ':' + rawSymbol.replace('USDT', '_USD')),
        );
    },

    unsubscribeBars: (subscriberUID) => {
        // console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
        unsubscribeFromStream(subscriberUID);
    },

    // getMarks: async (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
    //     const marks = [
    //         {
    //             id: '1',
    //             time: 1718683616,
    //             color: 'red',
    //             text: 'A',
    //             label: 'A',
    //             labelFontColor: '#FFFFFF',
    //             minSize: 14
    //         },
    //         {
    //             id: '2',
    //             time: 1717388035,
    //             color: 'blue',
    //             text: 'B',
    //             label: 'B',
    //             labelFontColor: '#FFFFFF',
    //             minSize: 14
    //         }
    //     ];
    //     onDataCallback(marks);
    // },
    // getMarks: async (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
    //     try {
    //         const response = await fetch(url + '/fetchMarks', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 symbol: "BINANCE:BTCUSDT",
    //                 from: startDate,
    //                 to: endDate,
    //                 resolution: "D"
    //             }),
    //         });
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //
    //         const marks = await response.json();
    //         onDataCallback(marks);
    //     } catch (error) {
    //         console.error('There was an error fetching the marks:', error);
    //         onDataCallback([]);
    //     }
    // },



    getTimescaleMarks(symbolInfo, startDate, endDate, onDataCallback, resolution) {
        if (configurationData.supports_timescale_marks) {
            let Arr = [];
            Arr.push({
                id: 1,
                time: 1718710709,
                color: 'green',
                label: 'Buy',
                tooltip: 'Aasdadffgdfgdfg',
                minSize: 25
            })
            // const marks = [
            //     {
            //         id: 1,
            //         time: 1718683616,
            //         color: 'red',
            //         text: 'Aasdadffgdfgdfg',
            //         label: 'Y',
            //         labelFontColor: '#ffffff',
            //         minSize: 14
            //     },
            //     {
            //         id: 2,
            //         time: 1717388035,
            //         color: 'blue',
            //         text: 'sfgertgfetgegg',
            //         label: 'B',
            //         labelFontColor: '#ffffff',
            //         minSize: 25
            //     }
            // ];
            onDataCallback(Arr);
        }
    },

    // getServerTime(callback) {
    //     if (configurationData.supports_time) {
    //         const self = this
    //         setTimeout(function () {
    //             callback(self.getServerTime())
    //         }, 10)
    //     }
    // }
};
