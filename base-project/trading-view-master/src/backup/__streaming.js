import {WEBSOCKET_ADDRESS} from "./_constants.js";
import {lastBarsCache} from "./__datafeed.js";

function initializeWebSocket() {
    const socket = io(WEBSOCKET_ADDRESS);

    socket.on("connect", () => {
        // console.log("WebSocket connected with ID:", socket.id);
    });

    socket.on("disconnect", () => {
        // console.log("WebSocket disconnected:", socket.id);
    });

    socket.on('symbolUpdate', (message) => {
        // console.log(message)
        let rawData = window.tvWidget.symbolInterval().symbol.split(':');
        let rawSymbol;
        if (rawData.length === 1) {
            // rawSymbol = rawData[0].replace('USD', '_USD'); // fro FMP
            rawSymbol = rawData[0].replace('USDT', '_USD');
        }

        // console.log("rawSymbol",rawSymbol )
        // console.log("message.symbol",message.symbol )
        // console.log(message.symbol == rawSymbol)
        if (message.symbol === rawSymbol) {
            // console.log("CEX YES")

            handleRealTimeCandleCex(message, rawSymbol);
        }
    });
}

/*
function handleRealTimeCandleCex(message, rawSymbol) {
    const tradePrice = parseFloat(message.ask);
    const tradeVolume = parseFloat(message.volume);
    const tradeTime = message.timestamp / 1000;

    const parsedSymbol = {
        exchange: 'crypto',
        fromSymbol: message.symbol,
        toSymbol: 'USDT',
    };
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    const subscriptionItem = channelToSubscription.get(channelString);
    const symbolCategory = message.categoryName;

    let lastBar = lastBarsCache.get(symbolCategory + ':' + rawSymbol);
    let resolution = window.tvWidget.symbolInterval().interval;
    const timeFrame = getResolution(resolution);

    let coeff = timeFrame * 60; // Coefficient to round to the nearest timeframe
    let rounded = Math.floor(tradeTime / coeff) * coeff; // Default rounding


    // Adjust rounding for daily resolution
    // if (resolution === 'D') {
    //     const date = new Date(tradeTime * 1000);
    //     date.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
    //     rounded = date.getTime() / 1000;
    // }

    let lastBarSec = lastBar.time / 1000;

    let bar;
    if (rounded > lastBarSec) {
        console.log('Creating new candle');

        // Create a new candle, use the last close as open
        bar = {
            time: rounded * 1000, // Use the rounded time for the new candle
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
            volume: tradeVolume
        };
        lastBarsCache.set(symbolCategory + ':' + rawSymbol, bar); // Update cache
        console.log('[socket] Generate new bar', bar);
    } else {
        // Update the last bar
        console.log('Updating existing candle');

        // Update the high and low prices
        if (tradePrice < lastBar.low) {
            lastBar.low = tradePrice;
        } else if (tradePrice > lastBar.high) {
            lastBar.high = tradePrice;
        }
        // Update the volume and close price
        lastBar.volume += tradeVolume;
        lastBar.close = tradePrice;
        // lastBar.time = rounded * 1000;
        bar = lastBar;

        lastBarsCache.set(symbolCategory + ':' + rawSymbol, bar);
        console.log('[socket] Update the latest bar by price', tradePrice);
    }

    subscriptionItem.lastDailyBar = bar;

    // Send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
}
*/

/*
function handleRealTimeCandleCex(message, rawSymbol) {
    const tradePrice = parseFloat(message.ask);
    const tradeVolume = parseFloat(message.volume);
    const tradeTime = message.timestamp / 1000;

    const parsedSymbol = {
        exchange: 'crypto',
        fromSymbol: message.symbol,
        toSymbol: 'USDT',
    };
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    const subscriptionItem = channelToSubscription.get(channelString);
    const symbolCategory = message.categoryName;

    let lastBar = lastBarsCache.get(symbolCategory + ':' + rawSymbol);
    let resolution = window.tvWidget.symbolInterval().interval;
    const timeFrame = getResolution(resolution);

    let coeff = timeFrame * 60; // Coefficient to round to the nearest timeframe
    let rounded = Math.floor(tradeTime / coeff) * coeff; // Default rounding

    let lastBarSec = lastBar.time / 1000;

    let bar;
    if (rounded > lastBarSec) {
        console.log('Creating new candle');

        // Create a new candle, use the last close as open
        bar = {
            time: rounded * 1000, // Use the rounded time for the new candle
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
            volume: tradeVolume
        };
        lastBarsCache.set(symbolCategory + ':' + rawSymbol, bar); // Update cache
    } else {
        // Update the last bar
        console.log('Updating existing candle');

        // Update the high and low prices
        if (tradePrice < lastBar.low) {
            lastBar.low = tradePrice;
        } else if (tradePrice > lastBar.high) {
            lastBar.high = tradePrice;
        }
        // Update the volume and close price
        lastBar.volume += tradeVolume;
        lastBar.close = tradePrice;
        lastBar.time = rounded * 1000;
        bar = lastBar;

        lastBarsCache.set(symbolCategory + ':' + rawSymbol, lastBar);
    }

    // Retrieve last bar from cache again to check consistency
    let cachedLastBar = lastBarsCache.get(symbolCategory + ':' + rawSymbol);
    subscriptionItem.lastDailyBar = bar;

    // Send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
}
*/

/*
function handleRealTimeCandleCex(message, rawSymbol) {
    const tradePrice = parseFloat(message.ask);
    const tradeVolume = parseFloat(message.volume);
    // const tradeTime = message.timestamp / 1000;
    const tradeTime =  new Date(message.timestamp /1000);

    const parsedSymbol = {
        exchange: 'crypto',
        fromSymbol: message.symbol,
        toSymbol: 'USDT',
    };
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    const subscriptionItem = channelToSubscription.get(channelString);
    const symbolCategory = message.categoryName;

    let lastBar = lastBarsCache.get(symbolCategory + ':' + rawSymbol);
    let resolution = window.tvWidget.symbolInterval().interval;
    const timeFrame = getResolution(resolution);

    let coeff = timeFrame * 60; // Coefficient to round to the nearest timeframe
    let rounded = Math.floor(tradeTime / coeff) * coeff; // Default rounding

    // Adjust rounding for daily resolution
    // if (resolution === '1D') {
    //     const date = new Date(tradeTime * 1000);
    //     date.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
    //     rounded = date.getTime() / 1000;
    // }

    console.log('Trade time:', tradeTime);
    console.log('Rounded time:', rounded);

    if (lastBar) {
        let lastBarSec = lastBar.time / 1000;
        console.log('Last bar time:', lastBarSec);
    } else {
        console.log('No last bar found in cache');
    }

    let bar;
    if (!lastBar || rounded > lastBar.time / 1000) {
        console.log('Creating new candle');

        // Create a new candle
        bar = {
            time: rounded * 1000, // Use the rounded time for the new candle
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
            volume: tradeVolume
        };
        lastBarsCache.set(symbolCategory + ':' + rawSymbol, bar); // Update cache
        console.log('[socket] Generate new bar', bar);
    } else {
        // Update the last bar
        console.log('Updating existing candle');

        // Create a new object to avoid mutating the cached bar directly
        bar = {
            ...lastBar,
            high: Math.max(lastBar.high, tradePrice),
            low: Math.min(lastBar.low, tradePrice),
            close: tradePrice,
            volume: lastBar.volume + tradeVolume
        };

        lastBarsCache.set(symbolCategory + ':' + rawSymbol, bar);
        console.log('[socket] Update the latest bar by price', tradePrice);
    }

    // Retrieve last bar from cache again to check consistency
    let cachedLastBar = lastBarsCache.get(symbolCategory + ':' + rawSymbol);
    console.log('Cached last bar time:', cachedLastBar.time / 1000);

    subscriptionItem.lastDailyBar = bar;

    // Send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
}

*/

function handleRealTimeCandleCex(message, rawSymbol) {
    const tradePrice = parseFloat(message.ask);
    const tradeVolume = parseFloat(message.volume);
    const tradeTime = message.timestamp / 1000; // Convert to seconds

    const parsedSymbol = {
        exchange: 'crypto',
        fromSymbol: message.symbol,
        toSymbol: 'USDT',
    };
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    const subscriptionItem = channelToSubscription.get(channelString);
    const symbolCategory = message.categoryName;

    let lastBar = lastBarsCache.get(symbolCategory + ':' + rawSymbol);
    let resolution = window.tvWidget.symbolInterval().interval;
    const timeFrame = getResolution(resolution);

    let coeff = timeFrame * 60; // Coefficient to round to the nearest timeframe
    let rounded = Math.floor(tradeTime / coeff) * coeff; // Default rounding

    // Adjust rounding for daily resolution
    if (resolution === 'D') {
        const date = new Date(tradeTime * 1000);
        date.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
        rounded = date.getTime() / 1000;
    }

    let lastBarSec = lastBar ? lastBar.time / 1000 : 0; // Handle case where lastBar is undefined

    let bar;
    if (rounded > lastBarSec) {
        console.log('Creating new candle');

        // Create a new candle, use the last close as open
        bar = {
            time: rounded * 1000, // Use the rounded time for the new candle
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
            volume: tradeVolume
        };
        // lastBarsCache.set(symbolCategory + ':' + rawSymbol, bar); // Update cache
    } else {
        // Update the last bar
        console.log('Updating existing candle');

        // Update the high and low prices
        if (tradePrice < lastBar.low) {
            lastBar.low = tradePrice;
        } else if (tradePrice > lastBar.high) {
            lastBar.high = tradePrice;
        }
        // Update the volume and close price
        lastBar.volume += tradeVolume;
        lastBar.close = tradePrice;
        // lastBar.time = rounded * 1000; // Update the time property
        bar = lastBar;

        lastBarsCache.set(symbolCategory + ':' + rawSymbol, bar);
    }

    // Retrieve last bar from cache again to check consistency
    subscriptionItem.lastDailyBar = bar;

    // Send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
}

/*
function handleRealTimeCandleCex(message, rawSymbol) {
    const tradePrice = parseFloat(message.ask);
    const tradeVolume = parseFloat(message.volume);
    const tradeTime = message.timestamp / 1000; // Convert to seconds

    const parsedSymbol = {
        exchange: 'crypto',
        fromSymbol: message.symbol,
        toSymbol: 'USDT',
    };
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    const subscriptionItem = channelToSubscription.get(channelString);
    const symbolCategory = message.categoryName;

    let lastBar = lastBarsCache.get(symbolCategory + ':' + rawSymbol);
    let resolution = window.tvWidget.symbolInterval().interval;
    const timeFrame = getResolution(resolution);

    let coeff = timeFrame * 60; // Coefficient to round to the nearest timeframe
    let rounded = Math.floor(tradeTime / coeff) * coeff; // Default rounding

    let lastBarSec = lastBar ? lastBar.time / 1000 : 0; // Handle case where lastBar is undefined

    let bar;
    if (rounded > lastBarSec) {
        console.log('Creating new candle');

        // Create a new candle, use the last close as open
        bar = {
            time: rounded * 1000, // Use the rounded time for the new candle
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
            volume: tradeVolume
        };
        lastBarsCache.set(symbolCategory + ':' + rawSymbol, bar); // Update cache
    } else {
        // Update the last bar
        console.log('Updating existing candle');

        // Update the high and low prices
        if (tradePrice < lastBar.low) {
            lastBar.low = tradePrice;
        } else if (tradePrice > lastBar.high) {
            lastBar.high = tradePrice;
        }
        // Update the volume and close price
        lastBar.volume += tradeVolume;
        lastBar.close = tradePrice;
        lastBar.time = rounded * 1000; // Update the time
        bar = lastBar;

        lastBarsCache.set(symbolCategory + ':' + rawSymbol, bar);
    }

    // Retrieve last bar from cache again to check consistency
    let cachedLastBar = lastBarsCache.get(symbolCategory + ':' + rawSymbol);
    console.log('Cached last bar:', cachedLastBar);
    subscriptionItem.lastDailyBar = bar;

    // Send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
}
*/

/*
function handleRealTimeCandleCex(message, rawSymbol) {
    // const tradePrice = parseFloat(message.ask);
    const tradePrice = message.ask;
    const tradeVolume = message.volume;
    const tradeTime = message.timestamp / 1000;

    const parsedSymbol = {
        exchange: 'crypto',
        fromSymbol: message.symbol,
        // toSymbol: 'USD', // for FMP
        toSymbol: 'USDT',
    };
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    const subscriptionItem = channelToSubscription.get(channelString);
    const symbolCategory = message.categoryName;

    lastBarsCache.get(symbolCategory + ':' + rawSymbol)
    let lastBar = lastBarsCache.get(symbolCategory + ':' + rawSymbol);
    // let lastBar = subscriptionItem.lastDailyBar

    // let resolution = subscriptionItem.resolution
    let resolution = window.tvWidget.symbolInterval().interval;
    const timeFrame = getResolution(resolution);

    let coeff = timeFrame * 60;
    let rounded = Math.floor(tradeTime / coeff) * coeff;
    let lastBarSec = lastBar.time / 1000;

    let bar;
    if (rounded > lastBarSec) {
        console.log('Creating new candle');

        // create a new candle, use last close as open **PERSONAL CHOICE**
        bar = {
            // time: message.timestamp,
            time: rounded * 1000,
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
            volume: tradeVolume
        };
        lastBarsCache.set(symbolCategory + ':' + rawSymbol, bar); // Update cache
        // console.log('[socket] Generate new bar', bar);
    } else {
        // update lastBar candle!
        console.log('Updating existing candle');

        if (tradePrice < lastBar.low) {
            lastBar.low = tradePrice;
        } else if (tradePrice > lastBar.high) {
            lastBar.high = tradePrice;
        }
        lastBar.volume += tradeVolume;
        lastBar.close = tradePrice;
        bar = lastBar;

        lastBarsCache.set(symbolCategory + ':' + rawSymbol, lastBar);
        // console.log('[socket] Update the latest bar by price', tradePrice);
    }

    subscriptionItem.lastDailyBar = bar;

    // Send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
}
*/


/*
function handleRealTimeCandleCex(message, rawSymbol) {
    const tradePrice = parseFloat(message.ask);
    const tradeVolume = message.volume;
    const tradeTime = message.time / 1000;

    const parsedSymbol = {
        exchange: 'crypto',
        fromSymbol: message.symbol,
        toSymbol: 'USDT',
    };
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    const subscriptionItem = channelToSubscription.get(channelString);
    const symbolCategory = message.categoryName;

    let lastBar = lastBarsCache.get(symbolCategory + ':' + rawSymbol);
    let resolution = window.tvWidget.symbolInterval().interval;
    const timeFrame = getResolution(resolution);

    let coeff = timeFrame * 60; // Coefficient to round to the nearest timeframe
    let rounded = Math.floor(tradeTime / coeff) * coeff; // Default rounding

    // Adjust rounding for daily resolution
    if (resolution === '1D') {
        const date = new Date(tradeTime * 1000);
        date.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
        rounded = date.getTime() / 1000;
    }

    let lastBarSec = lastBar.time / 1000;

    let bar;
    if (rounded > lastBarSec) {
        console.log('Creating new candle');

        // Create a new candle, use the last close as open
        bar = {
            time: rounded * 1000, // Use the rounded time for the new candle
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
            volume: tradeVolume
        };
        lastBarsCache.set(symbolCategory + ':' + rawSymbol, bar); // Update cache
        console.log('[socket] Generate new bar', bar);
    } else {
        // Update the last bar
        console.log('Updating existing candle');

        // Update the high and low prices
        if (tradePrice < lastBar.low) {
            lastBar.low = tradePrice;
        } else if (tradePrice > lastBar.high) {
            lastBar.high = tradePrice;
        }
        // Update the volume and close price
        lastBar.volume += tradeVolume;
        lastBar.close = tradePrice;
        bar = lastBar;

        lastBarsCache.set(symbolCategory + ':' + rawSymbol, lastBar);
        console.log('[socket] Update the latest bar by price', tradePrice);
    }

    subscriptionItem.lastDailyBar = bar;

    // Send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
}
*/

const getResolution = (timeFrame) => {
    switch (timeFrame) {
        case "1": return 1;
        case "5": return 5;
        case "15": return 15;
        case "30": return 30;
        case "60": return 60;
        case "D": return 1440; // 1 day in minutes === 1440
        case "1W": return 10080;
        case "1M": return 44640;
        default: return 1440;
    }
};

const channelToSubscription = new Map();

function getNextDailyBarTime(barTime) {
    const date = new Date(barTime * 1000);
    date.setDate(date.getDate() + 1);
    return date.getTime() / 1000;
}

export function subscribeOnStream(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback,
    lastDailyBar
) {
    const handler = {
        id: subscriberUID,
        callback: onRealtimeCallback,
    };
    const parsedSymbol = {
        exchange: 'crypto',
        fromSymbol: symbolInfo.name,
        // toSymbol: 'USD', for FMP
        toSymbol: 'USDT',
    };
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    let subscriptionItem = channelToSubscription.get(channelString);
    if (subscriptionItem) {
        // Already subscribed to the channel, use the existing subscription
        subscriptionItem.handlers.push(handler);
        return;
    }
    subscriptionItem = {
        subscriberUID,
        resolution,
        lastDailyBar,
        handlers: [handler],
    };
    channelToSubscription.set(channelString, subscriptionItem);
    // console.log('[subscribeBars]: Subscribe to streaming. Channel:', channelString);
    initializeWebSocket();
    // socket.send(JSON.stringify({'type': 'subscribe', 'symbol': 'BINANCE:BTCUSDT'}))
}

export function unsubscribeFromStream(subscriberUID) {
    // Find a subscription with id === subscriberUID
    for (const channelString of channelToSubscription.keys()) {
        const subscriptionItem = channelToSubscription.get(channelString);
        const handlerIndex = subscriptionItem.handlers.findIndex(
            (handler) => handler.id === subscriberUID
        );

        if (handlerIndex !== -1) {
            // Remove from handlers
            subscriptionItem.handlers.splice(handlerIndex, 1);

            if (subscriptionItem.handlers.length === 0) {
                // Unsubscribe from the channel if it was the last handler
                // console.log('[unsubscribeBars]: Unsubscribe from streaming. Channel:', channelString);
                const subRequest = {
                    action: 'SubRemove',
                    subs: [channelString],
                };
                // socket.send(JSON.stringify(subRequest));
                channelToSubscription.delete(channelString);
                break;
            }
        }
    }
}