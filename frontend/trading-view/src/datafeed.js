import {
    subscribeOnStream,
    unsubscribeFromStream,
} from './streaming.js';

import {
    getAllSymbols,
    fetchCandleData,
    fetchEarnings,
    fetchDividends,
    symbolMap
} from "./helpers.js";

import {TWELVE_DATA_ADDRESS} from "./constants.js";

const lastBarsCache = new Map();
export {lastBarsCache};


const configurationData = {
    // Represents the resolutions for bars supported by your datafeed
    supported_resolutions: ['1', '5', '15', '30', '45', '60', '120', '240', '1D', '1W', '1M'],

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
        { name: 'ALL', value: 'ALL' },
        { name: 'CRT', value: 'CRT' },
        { name: 'FX', value: 'FX' },
        { name: 'STC', value: 'STC' },
        { name: 'IND', value: 'IND' },
        { name: 'ETF', value: 'ETF' },
        { name: 'CMD', value: 'CMD' },
    ],
};

export default {
    onReady: (callback) => {
        setTimeout(() => callback(configurationData));
    },

    searchSymbols: async (userInput, exchange, symbolType, onResultReadyCallback) => {
        let allSymbols = await getAllSymbols();
        let matchingSymbols;
        if (symbolType === 'ALL') {
            matchingSymbols = allSymbols.filter(value =>
                value.symbol.toLowerCase().includes(userInput.toLowerCase()) &&
                (!exchange || value.exchange === exchange)
            );
        } else if (symbolType === 'STC' || symbolType === 'CRT' || symbolType === 'FX' ||
            symbolType === 'IND' || symbolType === 'ETF' || symbolType === 'CMD') {
            matchingSymbols = allSymbols.filter(value =>
                value.type === symbolType &&
                value.symbol.toLowerCase().includes(userInput.toLowerCase()) &&
                (!exchange || value.exchange === exchange)
            );
        } else {
            matchingSymbols = allSymbols.filter(value =>
                value.symbol.toLowerCase().includes(userInput.toLowerCase()) &&
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
            ticker: symbolName.replace('_', '/'),
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
            has_empty_bars: false
        };

        // console.log('[resolveSymbol]: Symbol resolved', symbolName);
        setTimeout(() => onSymbolResolvedCallback(symbolInfo));

    },

    getBars: async (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
        const { from, to, firstDataRequest, countBack } = periodParams;
        const resolutionMapping = {
            '1': '1M',
            '5': '5M',
            '15': '15M',
            '30': '30M',
            '45': '45M',
            '60': '1H',
            '120': '2H',
            '240': '4H',
            '1D': 'D',
            '1W': 'W',
            '1M': 'M'
        };
        const reqResolution = resolutionMapping[resolution];

        const {symbol} = window.tvWidget.symbolInterval();
        const symbolParts = symbol.split(':');
        let ticker = (symbolParts.length === 1 && symbolParts[0]) ? symbolParts[0] : null;

        // const symbolCategory =  window.tvWidget._options.symbolCategory; // For Server
        const symbolCategory = symbolInfo.type; // For Test

        const indexMappings = {
            'NDX/USD': 'NDX',
            'ASX/AUD': 'AXJO',
            'NIK/JPY': 'N225',
            'DAX/EUR': 'GDAXI',
            'DJI/USD': 'DJI',
            'F40/EUR': 'FCHI',
            'FTS/GBP': 'FTSE',
            'HK33/HKD': 'HSI',
            'SG30/SGD': 'STI',
            'CN50/USD': 'XIN0',
            'SPX/USD': 'SPX',
            'EU50/EUR': 'EU500',
        };

        const cmdMappings = {
            'BRN/USD': 'XBR/USD',
        };

        if (symbolCategory == 'IND') {
            ticker = indexMappings[ticker];
        }

        if (symbolCategory == 'CMD') {
             if (cmdMappings[ticker]) {
                 ticker = cmdMappings[ticker]
             } else {
                 ticker = ticker;
             }
        }

        let resultData = [];
        const requestBody = {
            "ticker": ticker,
            // "symbolCategory": symbolCategory,
            "timeFrame": reqResolution,
            "from": from,
            "to": to
        };
        resultData = await fetchCandleData(requestBody, TWELVE_DATA_ADDRESS);

        if (firstDataRequest) {
            lastBarsCache.set(symbolCategory + ':' + ticker, {
                ...resultData[resultData.length - 1],
            });

            /*if (symbolCategory == "STC" || symbolCategory == "ETF") {
                lastBarsCache.set(symbolCategory + ':' + normalizedSymbol, {
                    ...resultData[resultData.length - 1],
                });
            } else {
                lastBarsCache.set(symbolCategory + ':' + normalizedSymbol.replace('USDT', '_USD'), {
                    ...resultData[resultData.length - 1],
                });
            }*/
        }

        // console.log(`[getBars]: returned ${resultData.length} bar(s)`);
        onHistoryCallback(resultData, {
            noData: false,
        });

    },

    subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback,) => {
        // console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
        // let symbolCategory =  window.tvWidget._options.symbolCategory; // For Server
        let symbolCategory = symbolInfo.type; // For Test
        let rawData = window.tvWidget.symbolInterval().symbol.split(':')
        let rawSymbol;
        if (rawData.length == 1) {
            rawSymbol = rawData[0]
        }

        function last() {
            return lastBarsCache.get(symbolCategory + ':' + rawSymbol)

            /*
                        if (symbolCategory == "STC" || symbolCategory == "ETF") {
                            return lastBarsCache.get(symbolCategory + ':' + rawSymbol)
                        } else {
                            return lastBarsCache.get(symbolCategory + ':' + rawSymbol.replace('USDT', '_USD'))
                        }
            */
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
            let idCounter = 1;
            // Convert to Date objects
            const startDateObj = new Date(startDate * 1000);
            const endDateObj = new Date(endDate * 1000);
            const earningsData = await fetchEarnings(symbolInfo.name, startDateObj, endDateObj);
            const dividendsData = await fetchDividends(symbolInfo.name, startDateObj, endDateObj);
            // Process earnings data and add to earningsMarks
            earningsData.forEach(earnings => {
                earningsMarks.push({
                    id: idCounter, // or any unique identifier
                    time: new Date(earnings.date).getTime() / 1000, // convert date to seconds timestamp
                    color: earnings.eps >= earnings.epsEstimated ? "green" : "red", // choose a color based on your logic
                    tooltip: `EPS: ${earnings.eps}, Revenue: ${earnings.revenue}`, // show text in tooltip
                    // imageUrl: `https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC.svg`, // all need to photo
                    shape: earnings.eps >= earnings.epsEstimated ? `earningUp` : `earningDown`, //"circle" | "earningUp" | "earningDown" | "earning"
                    label: 'E', // example label, customize as needed
                    labelFontColor: '#FFFFFF', // example font color
                    minSize: 14 // example size, adjust as needed
                });
                idCounter++;
            });
            dividendsData.forEach(dividends => {
                earningsMarks.push({
                    id: idCounter, // or any unique identifier
                    time: new Date(dividends.date).getTime() / 1000, // convert date to seconds timestamp
                    color: dividends.dividend >= 0 ? "green" : "red", // choose a color based on your logic
                    tooltip: `Dividend: ${dividends.dividend}, Date: ${dividends.date}`, // show text in tooltip
                    // imageUrl: `https://s3-symbol-logo.tradingview.com/crypto/XTVCBTC.svg`, // all need to photo
                    shape: `circle`, //"circle" | "earningUp" | "earningDown" | "earning"
                    label: 'D', // example label, customize as needed
                    labelFontColor: '#FFFFFF', // example font color
                    minSize: 14 // example size, adjust as needed
                });
                idCounter++;
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
