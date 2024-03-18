import {DATA_ADDRESS} from "../config/constants";
import {useEffect, useRef} from "react";
import {TrendLineType} from "../type/TrendLineType";

export async function fetchCandleData(symbol:any, tf:any, from:any, to:any) {
    const url = DATA_ADDRESS;
    const requestBody = {
        "Ticker": symbol,
        "TimeFrame": tf,
        "from": from,
        "to": to
    };
    const resultData:any = [];
    try {
        const response = await fetch(url, {
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
