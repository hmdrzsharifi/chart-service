import {DATA_ADDRESS} from "../config/constants";
import {useEffect, useRef} from "react";
import {TrendLineType} from "../type/TrendLineType";

const url = DATA_ADDRESS;
export async function fetchCandleData(symbol:any, tf:any, from:any, to:any) {
    const requestBody = {
        "Ticker": symbol,
        "TimeFrame": tf,
        "from": from,
        "to": to
    };
    const resultData:any = [];
    try {
        const response = await fetch(url+'/fetchCandleData', {
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
        // if (json.) {
        //
        // }
        // const jsonData = JSON.parse(json);
        json.forEach((entry:any) => {
            resultData.push(mapObjectFinnhub(entry));
        });

        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        throw error; // Re-throw the error for the calling code to handle
    }

}

export async function fetchSymbolData(symbol:string) {
    const requestBody = {
        symbol
    };
    const resultData:any = [];
    try {
        const response = await fetch(url+'/getSymbol', {
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

        // const jsonData = JSON.parse(json);
        json.forEach((entry:any) => {
            resultData.push(mapObjectFinnhub(entry));
        });

        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        throw error; // Re-throw the error for the calling code to handle
    }

}

export async function fetchCexSymbols(){
    // http://185.148.147.219:3333/api/v1/services/all/symbols
}

function mapObject(originalObject:any) {
    return {
        date: new Date(originalObject.date),
        open: originalObject.open,
        high: originalObject.high,
        low: originalObject.low,
        close: originalObject.close,
        volume: originalObject.volume,
        split: "",
        dividend: "",
        absoluteChange: "",
        percentChange:""
    };
}

function mapObjectFinnhub(originalObject:any) {
    return {
        date: new Date(originalObject.t * 1000),
        open: originalObject.o,
        high: originalObject.h,
        low: originalObject.l,
        close: originalObject.c,
        volume: originalObject.v,
        split: "",
        dividend: "",
        absoluteChange: "",
        percentChange:""
    };
}

export const useEventListener = (eventName:any, handler:any, element = window) => {
    const savedHandler = useRef();
    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);
    useEffect(() => {
        // @ts-ignore
        const eventListener = (event:any) => savedHandler?.current(event);
        element.addEventListener(eventName, eventListener);
        return () => {
            element.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element]);
};

export const changeIndicatorsColor =
    (
        themeMode: 'dark' | 'light',
        trends: TrendLineType[],
        setTrends: any,
        retracements: any,
        setRetracements: any
    ) => {
    const tempTrends = trends.map(item => {
        return {...item,
            appearance: {
                strokeStyle: themeMode === 'dark' ? '#fff' : '#000',
                edgeFill: themeMode === 'dark' ? '#fff' : '#000',
                edgeStroke: themeMode === 'dark' ? '#000' : '#fff',
            }
        }
    })
    setTrends(tempTrends)

    const tempRetracements = retracements.map((item: any) => {
        return {...item,
            appearance: {
                strokeStyle: themeMode === 'dark' ? '#fff' : '#000',
                fontFill: themeMode === 'dark' ? '#fff' : '#000',
                edgeStroke: themeMode === 'dark' ? '#fff' : '#000',
                edgeFill: themeMode === 'dark' ? '#000' : '#fff',
                nsEdgeFill: themeMode === 'dark' ? '#fff' : '#000',
            }
        }
    })
    setRetracements(tempRetracements)
}

function isWithinOneMinute(websocketCandleDate: any, lastCandleDate: any) {
    let lastTimeMinute = lastCandleDate.getMinutes().toString();
    let websocketCandleDateMinute = websocketCandleDate.getMinutes().toString();
    if (websocketCandleDateMinute.length === 1) websocketCandleDateMinute = '0' + websocketCandleDateMinute // if less than 10 ( 2 => 02)

    // generate current second for websocket data (ex: 12 or 05)
    let second = websocketCandleDate.getSeconds().toString();
    if (second.length === 1) second = '0' + second // if less than 10 ( 2 => 02)\

    if (lastTimeMinute == +websocketCandleDateMinute) {
        return true;
    } else {
        return false;
    }
}

function convert_to_datetime(dateStr: string): Date {
    return new Date(dateStr);
}

