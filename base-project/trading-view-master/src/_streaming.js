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
        let rawData = window.tvWidget.symbolInterval().symbol.split(':');
        let rawSymbol;
        if (rawData.length === 1) {
            rawSymbol = rawData[0].replace('USDT', '_USD');
        }

        if (message.symbol === rawSymbol) {
            handleRealTimeCandleCex(message, rawSymbol);
        }
    });
}

function handleRealTimeCandleCex(message, rawSymbol) {
    const tradePrice = parseFloat(message.ask);
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
        case "60":
            timeFrame = 60;
            break;
        case "1D":
            timeFrame = 1440;
            break;
        case "1W":
            timeFrame = 10080;
            break;
        case "1M":
            timeFrame = 44640;
            break;
        default:
            timeFrame = 1440;
    }

    let coeff = timeFrame * 60;
    let rounded = Math.floor(tradeTime / coeff) * coeff;
    let lastBarSec = lastBar.time / 1000;

    let bar;
    if (rounded > lastBarSec) {

        // create a new candle, use last close as open **PERSONAL CHOICE**
        bar = {
            time: rounded * 1000, // Convert back to milliseconds
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
        toSymbol: 'USDT',
    };
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    let subscriptionItem = channelToSubscription.get(channelString);
    if (subscriptionItem) {
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
    initializeWebSocket();
}

export function unsubscribeFromStream(subscriberUID) {
    for (const channelString of channelToSubscription.keys()) {
        const subscriptionItem = channelToSubscription.get(channelString);
        const handlerIndex = subscriptionItem.handlers.findIndex(
            (handler) => handler.id === subscriberUID
        );

        if (handlerIndex !== -1) {
            subscriptionItem.handlers.splice(handlerIndex, 1);

            if (subscriptionItem.handlers.length === 0) {
                const subRequest = {
                    action: 'SubRemove',
                    subs: [channelString],
                };
                channelToSubscription.delete(channelString);
                break;
            }
        }
    }
}
