import {DATA_ADDRESS} from "../config/constants";

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

        const jsonData = JSON.parse(json.data);
        jsonData.forEach((entry:any) => {
            resultData.push(mapObject(entry));
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