// import {WEBSOCKET_ADDRESS} from "./constants";

const socket = io("http://91.92.108.4:5555");
import {
    lastBarsCache
} from './datafeed.js';
socket.on("connect", () => {
    console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

socket.on("disconnect", () => {
    console.log(socket.id); // undefined
});

socket.on('symbolUpdate', (message) => {
    // console.log("###########", message.symbol)

    let rawData = window.tvWidget.symbolInterval().symbol.split(':')
    let rawSymbol
    if (rawData.length == 1) {
        rawSymbol = rawData[0].replace('USDT', '_USD')
    }
   /* if (rawData[0] == 'BINANCE') {
        rawSymbol = rawData[1].replace('USDT', '_USD')
    }
    if (rawData[0] == 'OANDA') {
        rawSymbol = rawData[1]
    }
    if (rawData[0] == 'CRYPTO') {
        rawSymbol = rawData[1].replace('USDT', '_USD')
    }*/

    if (message.symbol === rawSymbol) {
        // console.log(message)
        handleRealTimeCandleCex(message, rawSymbol)
    }

   });

function handleRealTimeCandleCex(message) {
    const tradePrice = parseFloat(message.ask);
    const tradeTime = parseInt(message.timestamp);

    const parsedSymbol = {
        exchange: 'crypto',
        fromSymbol: 'BTCUSDT',
        toSymbol: 'USDT',
    };
    const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
    const subscriptionItem = channelToSubscription.get(channelString);
    // if (subscriptionItem.lastDailyBar) {
        let lastBar = subscriptionItem.lastDailyBar
        console.log({lastBar})
        let resolution =subscriptionItem.resolution
        console.log({resolution})
        let resolution1
        if (resolution == '1D') {
            // 1 day in minutes === 1440
            resolution1 = 1440
        }
        let coeff = resolution1 * 60
        console.log({coeff})
        let rounded = Math.floor(tradeTime / coeff) * coeff

        // let lastBarSec = lastBar.time / 1000
        // console.log({lastBarSec})
        /*    let resolution =subscriptionItem.resolution
            const lastBar = subscriptionItem.lastDailyBar
            // if (lastBar == undefined) return
            let resolution1
            if (resolution.includes('1D')) {
                // 1 day in minutes === 1440
                resolution1 = 1440
            }
            // if (resolution.includes('1')) {
            //     // 1 week in minutes === 10080
            //     resolution = 1
            // }
            if (resolution.includes('W')) {
                // 1 week in minutes === 10080
                resolution1 = 10080
            }
            let coeff = resolution * 60
            // console.log({coeff})
            let rounded = Math.floor(tradeTime / coeff) * coeff
            let lastBarSec = subscriptionItem.lastDailyBar.time / 1000

            let bar;
            if (rounded > lastBarSec) {
                // create a new candle, use last close as open **PERSONAL CHOICE**
                bar = {
                    // time: rounded * 1000,
                    // time: message.timestamp,
                    open: tradePrice,
                    high: tradePrice,
                    low: tradePrice,
                    close: tradePrice,
                    // volume: tradeVolume
                }
            } else {
                // update lastBar candle!
                if (tradePrice < lastBar.low) {
                    lastBar.low = tradePrice
                } else if (tradePrice > lastBar.high) {
                    lastBar.high = tradePrice
                }
                // lastBar.volume += tradeVolume
                // lastBar.close = tradePrice
                bar = lastBar
            }*/

        let bar
        bar = {
            // time: rounded * 1000,
            // time: message.timestamp,
            open: tradePrice,
            high: tradePrice,
            low: tradePrice,
            close: tradePrice,
            // volume: tradeVolume
        }
        console.log('[socket] Generate new bar', bar);
        console.log('[socket] Update the latest bar by price', tradePrice);
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
        fromSymbol: 'BTCUSDT',
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
    console.log(
        '[subscribeBars]: Subscribe to streaming. Channel:',
        channelString
    );
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
                console.log(
                    '[unsubscribeBars]: Unsubscribe from streaming. Channel:',
                    channelString
                );
                const subRequest = {
                    action: 'SubRemove',
                    subs: [channelString],
                };
                socket.send(JSON.stringify(subRequest));
                channelToSubscription.delete(channelString);
                break;
            }
        }
    }
}