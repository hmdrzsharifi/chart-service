import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {StockChart} from "./chart/StockChart";

import Toolbar from "./layout/toolbar";
import Footer from "./layout/footer";
import Sidebar from "./layout/sidebar";
import {NO_OF_CANDLES, WEBSOCKET_ADDRESS} from "./config/constants";
import {createTheme, CssBaseline, ThemeProvider} from '@mui/material';
import useStore from "./util/store";
import {fetchCandleData} from "./util/utils";
import io from 'socket.io-client';
import useDesignStore from "./util/designStore";
import {TimeFrame} from "./type/Enum";
import getDesignTokens from "./config/theme";


function App() {

    const [data, setData] = useState<any>([]);
    const [lastTime, setLastTime] = useState<any>(new Date());
    const {symbol, timeFrame} = useStore();
    const {openSideBar, themeMode} = useDesignStore();

    const handleRealTimeTick = (websocketData: any) => {
        let websocketCandleDate = new Date(websocketData.t);
        console.log({websocketCandleDate})
        let websocketCandle = {
            "date": websocketCandleDate,
            "open": parseFloat(websocketData.o),
            "high": parseFloat(websocketData.h),
            "low": parseFloat(websocketData.l),
            "close": parseFloat(websocketData.c),
            "volume": parseFloat(websocketData.v),
            "split": "",
            "dividend": "",
            "absoluteChange": "",
            "percentChange": ""
        };

        // const lastCandleDate = stateRef?.current?.slice(-1)[0]?.date

        if (timeFrame == TimeFrame.M1) {
            if (isWithinOneMinute(websocketCandleDate)) {
                console.log("update")
                setData((data: any[]) => [...data.slice(0, data.length - 1), websocketCandle])
            } else {
                console.log("new")
                setLastTime(new Date())
                fetchLastData(websocketCandle)
            }
        }

    }

    const stateRef: React.MutableRefObject<any> = useRef();
    stateRef.current = lastTime;

    function isWithinOneMinute(websocketCandleDate: any) {
        let lastTimeMinute = stateRef?.current.getMinutes().toString();
        let websocketCandleDateMinute = websocketCandleDate.getMinutes().toString();
        if (websocketCandleDateMinute.length === 1) websocketCandleDateMinute = '0' + websocketCandleDateMinute // if less than 10 ( 2 => 02)

        // generate current second for websocket data (ex: 12 or 05)
        let second = websocketCandleDate.getSeconds().toString();
        if (second.length === 1) second = '0' + second // if less than 10 ( 2 => 02)\

        console.log(`lastTimeMinute: ${lastTimeMinute} - websocketCandleDateMinute: ${websocketCandleDateMinute}`)
        console.log("lastTimeMinute == +websocketCandleDateMinute", lastTimeMinute == +websocketCandleDateMinute)

        if (lastTimeMinute == +websocketCandleDateMinute) {
            return true;
        } else {
            return false;
        }
    }

    function convert_to_datetime(dateStr:string) : Date{
        return new Date(dateStr);

    }

    /*useEffect(() => {
        const socket = io('your_server_url');
        socket.on('price_update', (newPriceData) => {
            // Update the last candle with new price data
            setData((prevData) => {
                const updatedData = [...prevData];
                const lastCandle = updatedData[updatedData.length - 1];
                if (lastCandle) {
                    // Update candle with new price data
                    lastCandle.close = newPriceData.close;
                    if (newPriceData.high > lastCandle.high) {
                        lastCandle.high = newPriceData.high;
                    }
                    if (newPriceData.low < lastCandle.low) {
                        lastCandle.low = newPriceData.low;
                    }
                    // Optional: Update open to first price received
                    if (!lastCandle.open) {
                        lastCandle.open = newPriceData.open;
                    }
                }
                return updatedData;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);*/


    useEffect(() => {
        // Initialize socket connection
        const newSocket = io(WEBSOCKET_ADDRESS);

        const fetchDataAndConnectWebSocket = async () => {
            await fetchInitialData();
            connectWebSocket(newSocket);
        };
        fetchDataAndConnectWebSocket();

        // Cleanup function
        return () => {
            console.log("******************* cleanup")
            newSocket.disconnect(); // Disconnect the socket
        };
    }, [symbol, timeFrame]);


    // const connectWebSocket = async () => {
    const connectWebSocket = (socket: any) => {

        // Set up event handlers
        socket.on('connect', () => {
            console.log('Connected to server');
            console.log('#############################################', symbol)
            const msg = {
                symbol: symbol
                // timeFrame: '5s'
            }

            socket.emit('message', msg);

        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        socket.on('message', (message: any) => {
            // console.log('Received message:', message);
            let websocketData = JSON.parse(message.server_message);
            if (websocketData.m === symbol) {
                handleRealTimeTick(websocketData)
            }
        });

    };

    const handleNewTick = (message: any) => {
        /*const cleanedMessage = message.replace(/\[|\]/g, '');
        const lastHyphenIndex = cleanedMessage.lastIndexOf("-");
        const ltp = parseFloat(cleanedMessage.substring(lastHyphenIndex + 1));
        lastTickPrice.current = ltp;*/

        setData((prevData: any) => {
            if (!prevData || prevData.length === 0) return null;
            const newData = [...prevData];
            const lastCandle = {...newData[newData.length - 1]};
            const currentTime = new Date();

            // Calculate the start time for the next candle based on the last candle's date
            // const timeFrameMinutes = parseInt(timeFrame.replace('minute', ''), 10);
            const nextCandleStartTime = new Date(lastCandle.date);
            // nextCandleStartTime.setMinutes(nextCandleStartTime.getMinutes() + timeFrameMinutes);

            if (currentTime >= nextCandleStartTime) {
                // Time to start a new candle
                // console.log("appending new candle");
                // console.log("appending new candle", message);
                // let originalData = JSON.parse(message);
                let originalData = JSON.parse(message.server_message);
                let date = new Date(originalData.t);
                let newCandle = {
                    "date": date,
                    "open": parseFloat(originalData.o),
                    "high": parseFloat(originalData.h),
                    "low": parseFloat(originalData.l),
                    "close": parseFloat(originalData.c),
                    "volume": parseFloat(originalData.v),
                    "split": "",
                    "dividend": "",
                    "absoluteChange": "",
                    "percentChange": ""
                };

                /*const newCandle = {
                    date: nextCandleStartTime,
                    open: ltp,
                    high: ltp,
                    low: ltp,
                    close: ltp,
                    volume: 0 // Adjust the volume as necessary
                };*/
                newData.push(newCandle);
            } else {
                // Update the last candle with the new LTP
                // lastCandle.close = ltp;
                // lastCandle.high = Math.max(lastCandle.high, ltp);
                // lastCandle.low = Math.min(lastCandle.low, ltp);
                newData[newData.length - 1] = lastCandle;
            }

            return newData;
        });
    };

    const fetchInitialData = async () => {
        try {
            let from;

            switch (timeFrame) {
                case "1M":
                    from = Math.floor(new Date().getTime() / 1000) - (NO_OF_CANDLES * 60);
                    break;
                case "D":
                    from = Math.floor(new Date().getTime() / 1000) - (NO_OF_CANDLES * 24 * 3600);
                    break;

                //todo add other time frame

                default:
                    from = Math.floor(new Date().getTime() / 1000) - (NO_OF_CANDLES * 24 * 3600)
            }

            const candleData = await fetchCandleData(symbol, timeFrame, from, Math.floor(new Date().getTime() / 1000));
            // const candleData = await fetchCandleData(symbol, "d", "2023-08-20", "2024-02-03");
            console.log(candleData)

            setData(candleData)
        } catch (error) {
            console.error('Error fetching candle data:', error);
        }
    };

    const fetchLastData = async (newCandle: any) => {
        try {
            let from;
            let to;


            switch (timeFrame) {
                case "1M":
                    from = Math.floor(newCandle.date.getTime() / 1000) - 120;
                    to = Math.floor(newCandle.date.getTime() / 1000);
                    break;
                case "D":
                    from = Math.floor(newCandle.date.getTime() / 1000) - (1 * 24 * 3600);
                    break;

                //todo add other time frame

                default:
                    from = Math.floor(newCandle.date.getTime() / 1000) - (1 * 24 * 3600)
            }

            console.log({from})
            console.log({to})

            const result = await fetchCandleData(symbol, timeFrame, from, to);
            console.log('result1', result)
            // result.sort((a: any, b: any) =>  a.date.getTime() - b.date.getTime());
            console.log('result', result)
            // sort on date
            let singleResult = result[0];
            singleResult = [singleResult, newCandle]
            console.log('fetch result', singleResult)
            // const candleData = result ? [result[0], newCandle] : newCandle;
            // const candleData = await fetchCandleData(symbol, "d", "2023-08-20", "2024-02-03");
            setData((data: any[]) => [...data.slice(0, data.length - 1), ...singleResult])
        } catch (error) {
            console.error('Error fetching candle data:', error);
        }
    };

    const theme = React.useMemo(() => createTheme(getDesignTokens(themeMode)), [themeMode]);

    if (data == null) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <div className="app-container">
                    <Toolbar
                        style={{
                            borderBottom: 'solid 1px',
                            background: getDesignTokens(themeMode).palette.backgroundBar,
                            borderColor: getDesignTokens(themeMode).palette.borderBar
                            }}
                    />
                    <div className="chart-container">
                        <Sidebar style={{
                            borderRight: 'solid 1px',
                            width: openSideBar ? '40px' : '0',
                            background: getDesignTokens(themeMode).palette.backgroundBar,
                            borderColor: getDesignTokens(themeMode).palette.borderBar
                        }}/>
                        <div className="chart" style={{width: '100%',
                            background: getDesignTokens(themeMode).palette.chartBackground
                        }}>
                            <StockChart data={data} setData={setData} theme={theme}
                                        height={window.innerHeight - 100}
                                        ratio={3}
                                        width={window.innerWidth - 45}/>
                        </div>
                    </div>
                    <Footer style={{
                        borderTop: 'solid 1px',
                        background: getDesignTokens(themeMode).palette.backgroundBar,
                        borderColor: getDesignTokens(themeMode).palette.borderBar
                    }}/>
                </div>
            </ThemeProvider>
        </>
    );
}

export default App;
