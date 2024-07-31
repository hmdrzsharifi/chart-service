import {
    subscribeOnStream,
    unsubscribeFromStream,
} from './streaming.js';

import {
    getAllSymbols,
    fetchCandleData,
    symbolMap,
    fetchEarningsFMP
} from "./helpers.js";

import {FINNHUB_DATA_ADDRESS, FMP_DATA_ADDRESS} from "./constants.js";

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

    // earnings & dividends
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
        {
            name: 'IND',
            value: 'IND',
        },
        {
            name: 'ETF',
            value: 'ETF',
        },
        {
            name: 'CMD',
            value: 'CMD',
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
        let allSymbols = await getAllSymbols();
        let matchingSymbols;
        if (symbolType === 'ALL') {
            matchingSymbols = allSymbols.filter(value =>
                value.symbol.toLowerCase().includes(userInput.toLowerCase()) &&
                (!exchange || value.exchange === exchange)
            );
        } else {
            matchingSymbols = allSymbols.filter(value =>
                value.symbol.toLowerCase().includes(userInput.toLowerCase()) &&
                value.type === symbolType &&
                (!exchange || value.exchange === exchange)
            );
        }
        onResultReadyCallback(matchingSymbols);
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

        /*
        let rawData = window.tvWidget.symbolInterval().symbol.split(':')
        let rawSymbol;
        if (rawData.length == 1) {
            rawSymbol = rawData[0];
        }*/
        /*if (rawData.length == 2) {
            rawSymbol = rawData[1].replace('_USD', 'USDT')
        }
        if (rawData.length == 3) {
            rawSymbol = rawData[2].replace('_USD', 'USDT')
        }*/

        const { symbol } = window.tvWidget.symbolInterval();
        const symbolParts = symbol.split(':');
        const normalizedSymbol = (symbolParts.length === 1 && symbolParts[0]) ? symbolParts[0] : null;

        // const symbolCategory =  window.tvWidget._options.symbolCategory; // For Server
        const symbolCategory = symbolInfo.type; // For Test

        let ticker = '';

        switch (symbolCategory) {
            case 'CRT':
                ticker = 'BINANCE' + ':' + normalizedSymbol
                break;
            case 'FX':
                const forexMappings = {
                    'EURUSDT': 'EUR_USD',
                    'GBPUSDT': 'GBP_USD',
                    'NZDUSDT': 'NZD_USD',
                    'AUDUSDT': 'AUD_USD'
                };
                if (forexMappings[normalizedSymbol]) {
                    ticker = `OANDA:${forexMappings[normalizedSymbol]}`;
                } else {
                    ticker = `OANDA:${normalizedSymbol}`;
                }
                break;
            case 'STC':
                ticker = normalizedSymbol
                break;
            case 'ETF':
                ticker = normalizedSymbol
                break;
            case 'CMD':
                ticker = 'OANDA' + ':' + normalizedSymbol
                break;
            case 'IND':
                const indexMappings = {
                    'DJIUSDT': '^DJI',
                    'NDXUSDT': '^NDX',
                    'SPXUSDT': 'OANDA:SPX500_USD',
                    'ASX_AUD': '^AXJO',
                    'NIK_JPY': '^N225',
                    'CN50USDT': 'XIN9.FGI',
                    'EU50_EUR': '^STOXX50E',
                    'DAX_EUR': '^GDAXI',
                    'HK33_HKD': '^HSI',
                    'SG30_SGD': '^STI',
                    'FTS_GBP': '^FTSE',
                    'F40_EUR': 'OANDA:FR40_EUR',
                };
                ticker = indexMappings[normalizedSymbol];
                break;
            default:
                console.error(`Unknown symbol category: ${symbolCategory}`);
        }

        let resultData = [];
        if (['CRT', 'CMD', 'FX', 'IND'].includes(symbolCategory)) {
            const requestBody = {
                "Ticker": ticker,
                "symbolCategory": symbolCategory,
                "TimeFrame": reqResolution,
                "from": from,
                "to": to
            };
            resultData = await fetchCandleData(symbolCategory, requestBody, FINNHUB_DATA_ADDRESS);

            /*try {
                const response = await fetch(FINNHUB_DATA_ADDRESS + '/fetchCandleData', {
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
            } catch (error) {
                console.error('There was an error fetching the candle data:', error);
                throw error; // Re-throw the error for the calling code to handle
            }*/
        } else if (['STC', 'ETF'].includes(symbolCategory)) {
            // console.log("FMP");
            const requestBody = {
                "Ticker": ticker,
                "symbolCategory": symbolCategory,
                "TimeFrame": reqResolution,
                "from": from,
                "to": to
            };
            resultData = await fetchCandleData(symbolCategory, requestBody, FMP_DATA_ADDRESS);

            /* try {
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
                 if (json.length > 0) {
                     json.forEach((entry) => {
                         resultData.push(mapObjectFMP(entry));
                     });
                 }
             } catch (error) {
                 console.error('There was an error fetching the candle data:', error);
                 throw error; // Re-throw the error for the calling code to handle
             }*/
        } else {
            console.error(`Unsupported symbol category: ${symbolCategory}`);
        }


        if (firstDataRequest) {
            /*lastBarsCache.set(symbolCategory + ':' + rawSymbol.replace('USDT', '_USD'), {
                ...resultData[resultData.length - 1],
            });*/

            if (symbolCategory == "STC" || symbolCategory == "ETF") {
                lastBarsCache.set(symbolCategory + ':' + normalizedSymbol, {
                    ...resultData[resultData.length - 1],
                });
            } else {
                lastBarsCache.set(symbolCategory + ':' + normalizedSymbol.replace('USDT', '_USD'), {
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
       /* if (rawData.length == 2) {
            rawSymbol = rawData[1].replace('_USD', 'USDT')
        }
        if (rawData.length == 3) {
            rawSymbol = rawData[2].replace('_USD', 'USDT')
        }*/

        function last() {
            if (symbolCategory == "STC" || symbolCategory == "ETF") {
                return lastBarsCache.get(symbolCategory + ':' + rawSymbol)
            } else {
                return lastBarsCache.get(symbolCategory + ':' + rawSymbol.replace('USDT', '_USD'))
            }
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

    /*getMarks: async (symbolInfo, startDate, endDate, onDataCallback, resolution) => {
        if (symbolInfo.type === 'STC') {
            let marks = [];
            // Convert to Date objects
            const startDateObj = new Date(startDate * 1000);
            const endDateObj = new Date(endDate * 1000);
            const earningsData = await fetchEarningsFMP(symbolInfo.name, startDateObj, endDateObj);
            // Process earnings data and add to marks
            earningsData.forEach(earnings => {
                marks.push({
                    id: earnings.symbol, // or any unique identifier
                    time: new Date(earnings.date).getTime() / 1000, // convert date to seconds timestamp
                    color: 'red', // choose a color based on your logic
                    text: `Earnings: ${earnings.eps}`, // example text, customize as needed
                    label: 'E', // example label, customize as needed
                    labelFontColor: '#FFFFFF', // example font color
                    minSize: 14 // example size, adjust as needed
                });
            });
            onDataCallback(marks);
        }
    },*/

    async getTimescaleMarks(symbolInfo, startDate, endDate, onDataCallback, resolution) {
        if (symbolInfo.type === 'STC') {
            let earningsMarks = [];
            // Convert to Date objects
            const startDateObj = new Date(startDate * 1000);
            const endDateObj = new Date(endDate * 1000);
            const earningsData = await fetchEarningsFMP(symbolInfo.name, startDateObj, endDateObj);
            // Process earnings data and add to earningsMarks
            earningsData.forEach(earnings => {
                earningsMarks.push({
                    id: earnings.symbol, // or any unique identifier
                    time: new Date(earnings.date).getTime() / 1000, // convert date to seconds timestamp
                    color: earnings.eps >= earnings.epsEstimated ? "green" : "red", // choose a color based on your logic
                    tooltip: `Earnings: ${earnings.eps}`, // show text in tooltip
                    // imageUrl: `https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC.svg`, // all need to photo
                    shape: earnings.eps >= earnings.epsEstimated ? `earningUp` : `earningDown`, //"circle" | "earningUp" | "earningDown" | "earning"
                    label: 'E', // example label, customize as needed
                    labelFontColor: '#FFFFFF', // example font color
                    minSize: 14 // example size, adjust as needed
                });
            });
            onDataCallback(earningsMarks);
        }
    },

    /*getServerTime(callback) {
        if (configurationData.supports_time) {
            const self = this
            setTimeout(function () {
                callback(self.getServerTime())
            }, 10)
        }
    }*/
};
