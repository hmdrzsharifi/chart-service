import {SYMBOLS_API_URL} from "../config/constants";
import {useEffect, useRef} from "react";
import {TrendLineType} from "../type/TrendLineType";
import {SymbolList} from "../type/SymbolType";
import getDesignTokens from "../config/theme";
import {StudiesChart} from "../type/Enum";

const API_URL_TWELVEDATA = process.env.REACT_APP_TWELVE_DATA_ADDRESS;

export async function fetchCandleDataTwelveData(symbol:any, tf:any, from:any, to:any) {
    const requestBody = {
        "ticker": symbol,
        "timeFrame": tf,
        "from": from,
        "to": to
    };
    const resultData:any = [];
    try {
        const response = await fetch(API_URL_TWELVEDATA +'/fetchCandleData', {
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
            resultData.push(mapObjectTwelve(entry));
        });

        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        throw error; // Re-throw the error for the calling code to handle
    }
}

export async function fetchEarnings(symbol:any, from:any, to:any) {
    const requestBody = {
        "ticker": symbol,
        "from": from,
        "to": to
    };
    const resultData:any = [];
    try {
        const response = await fetch(API_URL_TWELVEDATA +'/fetchEarnings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            // throw new Error(`HTTP error! status: ${response.status}`);
            return [];
        }

        const resultData = await response.json();
        // json.forEach((entry:any) => {
        //     resultData.push(mapObjectFMP(entry));
        // });

        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        return error; // Re-throw the error for the calling code to handle
    }
}

export async function fetchDividends(symbol:any, from:any, to:any) {
    const requestBody = {
        "ticker": symbol,
        "from": from,
        "to": to
    };
    const resultData:any = [];
    try {
        const response = await fetch(API_URL_TWELVEDATA +'/fetchDividends', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })
        if (!response.ok) {
            // throw new Error(`HTTP error! status: ${response.status}`);
            return [];
        }

        const resultData = await response.json();

        return resultData;
    } catch (error) {
        console.error('There was an error fetching the candle data:', error);
        return error; // Re-throw the error for the calling code to handle
    }
}

export async function fetchCexSymbols(){
    const resultData:SymbolList[] = [];
    try {
        const response = await fetch(SYMBOLS_API_URL + '/getAllSymbols', {
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

function mapObjectTwelve(originalObject:any) {
    return {
        date: new Date(originalObject.datetime),  // Append 'Z' to indicate UTC
        open: originalObject.open,
        high: originalObject.high,
        low: originalObject.low,
        close: originalObject.close,
        // volume: originalObject.volume,
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

export const studyChartHeight = (studiesCharts: any[]):number => {
    const size = 9 - (studiesCharts.length +
        (studiesCharts.includes(StudiesChart.STOCHASTIC_OSCILLATOR) ? 2 : 0) +
        (studiesCharts.includes(StudiesChart.FORCE_INDEX) ? 1 : 0) +
        (studiesCharts.includes(StudiesChart.RSI_AND_ATR) ? 1 : 0))

    return 50 + (size * 10)
}
