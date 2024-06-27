import {
    subscribeOnStream,
    unsubscribeFromStream,
} from './streaming.js';

import {FMP_DATA_ADDRESS} from "./constants.js";
import {fetchCandleDataFinnhub, fetchInitialDataFMP} from "./helpers.js";
import { finnhubSymbols } from './finnhub-symbols.js';

const lastBarsCache = new Map();
export {lastBarsCache};

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
            ticker: symbolName.replace('_USD', 'USD'),
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

        let rawData = window.tvWidget.symbolInterval().symbol.split(':')
        let rawSymbol;
        if (rawData.length == 1) {
            rawSymbol = rawData[0];
        }
        if (rawData.length == 2) {
            rawSymbol = rawData[1].replace('_USD', 'USD')
        }
        if (rawData.length == 3) {
            rawSymbol = rawData[2].replace('_USD', 'USD')
        }

        const symbolCategory = symbolInfo.type;
        let ticker = '';
        if (symbolCategory === 'CRT') {
            ticker = rawSymbol
        }
        if (symbolCategory == "FX" || symbolCategory == "STC" || symbolCategory == "ETF") {
            ticker = rawSymbol
        }

        if (symbolCategory == "CMD") {
            ticker = 'OANDA' + ':' + rawSymbol
        }
        if (symbolCategory == "IND") {
            console.log({rawSymbol})
            if (rawSymbol == "DJIUSD") {
                ticker = "OANDA:DJI_USD"
            }
        }

        let resultData = [];

        try {
            if (finnhubSymbols.hasOwnProperty(ticker)) {
                console.log({ticker})
                if (rawSymbol == "DJIUSD") {
                    ticker = "^DJI"
                }
                resultData = await fetchCandleDataFinnhub(ticker, reqResolution, from, to);
            } else {
                console.log("FMP")
                console.log({ticker})
                resultData = await fetchInitialDataFMP(ticker, reqResolution, from, to);

            }

            if (firstDataRequest) {
                lastBarsCache.set(symbolCategory + ':' + rawSymbol.replace('USD', '_USD'), {
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
            lastBarsCache.get(symbolCategory + ':' + rawSymbol.replace('USD', '_USD')),
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

/*
    async getTimescaleMarks(symbolInfo, startDate, endDate, onDataCallback, resolution) {
        if (configurationData.supports_timescale_marks) {
            try {
                const response = await fetch(FMP_DATA_ADDRESS + '/fetchMarks', {
                    method: 'POST', headers: {
                        'Content-Type': 'application/json',
                    }, body: JSON.stringify({
                        symbol: "BINANCE:BTCUSDT", from: startDate, to: endDate, resolution: "D"
                    }),
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const colors = ['green', 'red', 'yellow', 'blue'];
                const timeScaleMarkShape = ["circle" , "earningUp" , "earningDown" , "earning"];
                const marks = await response.json();

                // گروه‌بندی بر اساس روز و ماه
                const groupedMarks = marks.reduce((acc, mark) => {
                    const date = new Date(mark.date);
                    const dayMonth = `${date.getUTCMonth() + 1}/${date.getUTCDate()}`; // گرفتن ماه و روز
                    if (!acc[dayMonth]) {
                        acc[dayMonth] = [];
                    }
                    acc[dayMonth].push(mark);
                    return acc;
                }, {});

                // ایجاد لیست نهایی
                const newMarks = Object.keys(groupedMarks).map((dayMonth, index) => {
                    const combinedText = groupedMarks[dayMonth]
                        .map(mark => mark.text)
                        .join('\n\n--------------------\n\n'); // اضافه کردن خط جداکننده بین متن‌ها

                    const combinedTitle = groupedMarks[dayMonth]
                        .map(mark => mark.title)
                        .join('\n\n--------------------\n\n'); // اضافه کردن خط جداکننده بین عناوین
                    // استفاده از اولین تاریخ در گروه برای تبدیل به timestamp
                    const firstDate = groupedMarks[dayMonth][0].date;

                    return {
                        id: index + 1,
                        time: Math.floor(new Date(firstDate).getTime() / 1000), // تبدیل تاریخ به timestamp
                        color: colors[Math.floor(Math.random() * colors.length)], // تولید رنگ تصادفی از میان چهار رنگ
                        label: groupedMarks[dayMonth][0].symbol, // فرض می‌کنیم همه مارک‌ها دارای یک سیمبل هستند
                        tooltip: [combinedTitle, combinedText], // قرار دادن title و text ترکیب شده در tooltip
                        minSize: 25,
                        shape:timeScaleMarkShape[Math.floor(Math.random() * timeScaleMarkShape.length)]
                    };
                });

                onDataCallback(newMarks);

            } catch (error) {
                console.error('There was an error fetching the marks:', error);
                onDataCallback([]);
            }
        }
    },
*/

    // getServerTime(callback) {
    //     if (configurationData.supports_time) {
    //         const self = this
    //         setTimeout(function () {
    //             callback(self.getServerTime())
    //         }, 10)
    //     }
    // }
};
