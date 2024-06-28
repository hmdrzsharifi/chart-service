import {SYMBOLS_API_URL} from "../config/constants";
import {useEffect, useRef} from "react";
import {TrendLineType} from "../type/TrendLineType";
import {SymbolList} from "../type/SymbolType";
import getDesignTokens from "../config/theme";

const API_URL_FMP = process.env.REACT_APP_FMP_DATA_ADDRESS;
const API_URL_FINNHUB = process.env.REACT_APP_FINNHUB_DATA_ADDRESS;
export async function fetchCandleDataFinnhub(symbol:any, tf:any, from:any, to:any) {
    const requestBody = {
        "Ticker": symbol,
        "TimeFrame": tf,
        "from": from,
        "to": to
    };
    const resultData:any = [];
    try {
        const response = await fetch(API_URL_FINNHUB +'/fetchCandleData', {
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
        json.forEach((entry:any) => {
            resultData.push(mapObjectFinnhub(entry));
        });

        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        throw error; // Re-throw the error for the calling code to handle
    }

}

export async function fetchCandleDataFMP(symbol:any, tf:any, from:any, to:any) {
    const requestBody = {
        "Ticker": symbol,
        "TimeFrame": tf,
        "from": from,
        "to": to
    };
    const resultData:any = [];
    try {
        const response = await fetch(API_URL_FMP +'/fetchCandleData', {
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
        json.forEach((entry:any) => {
            resultData.push(mapObjectFMP(entry));
        });

        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        throw error; // Re-throw the error for the calling code to handle
    }
}

export async function fetchEarningsFMP(symbol:any, from:any, to:any) {
    const requestBody = {
        "Ticker": symbol,
        "from": from,
        "to": to
    };
    const resultData:any = [];
    try {
        const response = await fetch(API_URL_FMP +'/fetchEarnings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resultData = await response.json();
        // json.forEach((entry:any) => {
        //     resultData.push(mapObjectFMP(entry));
        // });

        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        throw error; // Re-throw the error for the calling code to handle
    }
}

export async function fetchCexSymbols(){
    const resultData:SymbolList[] = [];
    try {
        const response = await fetch(SYMBOLS_API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
        }
            // body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json = await response.json();
        console.log({json})

        // const jsonData = JSON.parse(json);
        json.forEach((entry:any) => {
            resultData.push(<SymbolList>mapSymbolResult(entry));
        });
        // console.log({resultData})
        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        throw error; // Re-throw the error for the calling code to handle
    }

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

function mapObjectFMP(originalObject:any) {
    return {
        date: new Date(originalObject.date),
        open: originalObject.open,
        high: originalObject.high,
        low: originalObject.low,
        close: originalObject.close,
        volume: originalObject.volume,
    };
}

function mapSymbolResult(originalObject:any) {
    return {
        categoryName:originalObject.categoryName,
        symbol:originalObject.symbol,
        icon:originalObject.icon
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


export const xAndYColors = (
    themeMode: 'dark' | 'light',
) => {
    return {
        tickLabelFill: getDesignTokens(themeMode).palette.lineColor,
        tickStrokeStyle: getDesignTokens(themeMode).palette.lineColor,
        strokeStyle: getDesignTokens(themeMode).palette.lineColor,
        gridLinesStrokeStyle: getDesignTokens(themeMode).palette.grindLineColor,
    }
}
