import {WEBSOCKET_ADDRESS} from "./constants.js";
import {lastBarsCache} from "./datafeed.js";

const channelToSubscription = new Map();

function initializeWebSocket() {
    const socket = io(WEBSOCKET_ADDRESS);

    socket.on("connect", () => {
        // console.log("WebSocket connected with ID:", socket.id);
    });

    socket.on("disconnect", () => {
        // console.log("WebSocket disconnected:", socket.id);
    });

    socket.on('symbolUpdate', (message) => {
        const { symbol } = window.tvWidget.symbolInterval();
        const messageSymbol = message.symbol? message.symbol.replace('_USD', '/USD') : '';

        if (symbol && messageSymbol === symbol) {
            handleRealTimeCandleCex(message, symbol);
        }
    });
}

/*function handleRealTimeCandleCex(message, symbol) {
    const tradePrice = parseFloat(message.ask);
    const tradeVolume = message.volume;
    const tradeTime = message.timestamp / 1000;

    const parsedSymbol = {
        exchange: 'crypto',
        fromSymbol: message.symbol,
        toSymbol: 'USDT',
    };
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    const subscriptionItem = channelToSubscription.get(channelString);
    // const symbolCategory =  window.tvWidget._options.symbolCategory; // For Server
    const symbolCategory = message.categoryName; // For Test

    lastBarsCache.get(symbolCategory + ':' + symbol)
    let lastBar = lastBarsCache.get(symbolCategory + ':' + symbol);
    // let lastBar = subscriptionItem.lastDailyBar
    // let resolution = subscriptionItem.resolution
    let resolution = window.tvWidget.symbolInterval().interval

    let timeFrame;
    switch (resolution) {
        case "1":
            timeFrame = 1;
            break;
        case "5":
            timeFrame = 5;
            break;
        case "15":
            timeFrame = 15;
            break;
        case "30":
            timeFrame = 30;
            break;
        case "45":
            timeFrame = 45;
            break;
        case "60":
            timeFrame = 60;
            break;
        case "120":
            timeFrame = 120;
            break;
        case "240":
            timeFrame = 240;
            break;
        case "1D":
            // 1 day in minutes === 1440
            timeFrame = 1440;
            break;
        case "1W":
            // 1 week in minutes === 10080
            timeFrame = 10080;
            break;
        case "1M":
            // 1 month (31 days) in minutes === 44640
            //todo for month 30 and 31 days
            timeFrame = 44640;
            break;

        default:
            // 1 day in minutes === 1440
            timeFrame = 1440;
    }

    let coeff = timeFrame * 60;
    let rounded = Math.floor(tradeTime / coeff) * coeff;
    let lastBarSec = lastBar.time / 1000;

    let bar;
    if (rounded > lastBarSec) {
        // create a new candle
        bar = {
            time: message.timestamp,
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
            volume: tradeVolume
        };
        lastBarsCache.set(symbolCategory + ':' + symbol, bar); // Update cache
    } else {
        // update lastBar candle!
        if (tradePrice < lastBar.low) {
            lastBar.low = tradePrice;
        } else if (tradePrice > lastBar.high) {
            lastBar.high = tradePrice;
        }
        lastBar.volume += tradeVolume;
        lastBar.close = tradePrice;
        bar = lastBar;

        lastBarsCache.set(symbolCategory + ':' + symbol, lastBar);
    }

    subscriptionItem.lastDailyBar = bar;

    // Send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
}*/

function handleRealTimeCandleCex(message, symbol) {
    const tradePrice = parseFloat(message.ask);
    const tradeVolume = message.volume;
    // const tradeTime = message.timestamp / 1000; // For Finnhub and FMP
    const tradeTime = message.timestamp; // For TewlveData
    const parsedSymbol = {
        exchange: 'crypto',
        fromSymbol: message.symbol,
        toSymbol: 'USDT',
    };
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    const subscriptionItem = channelToSubscription.get(channelString);
    //const symbolCategory =  window.tvWidget._options.symbolCategory; // For Server
    const symbolCategory = message.categoryName; // For Test

    let lastBar = lastBarsCache.get(symbolCategory + ':' + symbol);
    let resolution = window.tvWidget.symbolInterval().interval;

    let timeFrame;
    switch (resolution) {
        case "1": timeFrame = 1; break;
        case "5": timeFrame = 5; break;
        case "15": timeFrame = 15; break;
        case "30": timeFrame = 30; break;
        case "45": timeFrame = 45; break;
        case "60": timeFrame = 60; break;
        case "120": timeFrame = 120; break;
        case "240": timeFrame = 240; break;
        case "D": timeFrame = 1440; break;
        case "1W": timeFrame = 10080; break;
        case "1M": timeFrame = 44640; break;
        default: timeFrame = 1440;
    }

    let coeff = timeFrame * 60;
    let rounded = Math.floor(tradeTime / coeff) * coeff;
    let lastBarSec =lastBar.time/1000;

    let bar;
        if (rounded > lastBarSec) {
        console.log("candle new time", message.timestamp)
        // create a new candle
        bar = {
            //time: message.timestamp, // For Finnhub and FMP
            time: message.timestamp * 1000,
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
            // volume: tradeVolume
        };
        lastBarsCache.set(symbolCategory + ':' + symbol, bar); // Update cache
    } else {
        // update lastBar candle
        if (tradePrice < lastBar.low) {
            lastBar.low = tradePrice;
        } else if (tradePrice > lastBar.high) {
            lastBar.high = tradePrice;
        }
        lastBar.volume += tradeVolume;
        lastBar.close = tradePrice;
        bar = lastBar;

        lastBarsCache.set(symbolCategory + ':' + symbol, lastBar);
    }

    subscriptionItem.lastDailyBar = bar;

    // Send data to every subscriber of that symbol
    subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
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