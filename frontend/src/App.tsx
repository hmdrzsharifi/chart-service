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
import getDesignTokens from "./config/theme";
import Decimal from 'decimal.js';
import {MainChart} from "./chart/MainChart";
// @ts-ignore
import useDimensions from 'react-use-dimensions'
import { CirclesWithBar } from 'react-loader-spinner'

function App() {

    const [ref, { width, height }] = useDimensions()

    const [data, setData] = useState<any>([]);
    const [lastTime, setLastTime] = useState<any>(new Date());
    const {symbol, timeFrame} = useStore();
    const {openSideBar, themeMode} = useDesignStore();
    const {loading, setLoading} = useDesignStore();
    const {error, setError} = useStore();



    const stateRef: React.MutableRefObject<any> = useRef();
    stateRef.current = lastTime;

    const stateDataRef: React.MutableRefObject<any> = useRef();
    stateDataRef.current = data;

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

    const connectWebSocket = async (socket: any) => {

        socket.on('connect', () => {
            console.log('Connected to server');
            console.log('******************* symbol: ', symbol)
            const msg = {
                symbol: symbol
            }
            socket.emit('message', msg);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        socket.on('message', (message: any) => {
            // console.log('Received message:', message);
            const convertedMessage = {...message, p: new Decimal(message.p).toNumber()}
            if (message.s === symbol) {
                handleRealTimeCandle(convertedMessage)
            }
        });

        // CEX
        socket.on('symbolUpdate', (message: any) => {
            // console.log(message)
            const convertedMessage = {...message, ask: new Decimal(message.ask).toNumber()}

            let rawData = symbol.split(':')
            let rawSymbol
            if (rawData[0] == 'BINANCE') {
                rawSymbol = rawData[1].replace('USDT','_USD')
            }
            if (rawData[0] == 'OANDA') {
                rawSymbol = rawData[1]
            }
            if (message.symbol === rawSymbol) {
                handleRealTimeCandleCex(convertedMessage)
            }
        });

    };

    const handleRealTimeCandleCex = (dataFeed: any) => {
        const lastCandlestick = stateDataRef.current[stateDataRef.current.length - 1];

        let resolution

        switch (timeFrame) {
            case "1M":
                resolution = 1
                break;
            case "5M":
                resolution = 5
                break;
            case "15M":
                resolution = 15
                break;
            case "30M":
                resolution = 30
                break;
            case "1H":
                resolution = 60
                break;
            case "D":
                // 1 day in minutes === 1440
                resolution = 1440
                break;
            case "W":
                // 1 week in minutes === 10080
                resolution = 10080
                break;
            case "M":
                // 1 month (31 days) in minutes === 44640
                //todo for month 30 and 31 days
                resolution = 44640
                break;

            default:
                // 1 day in minutes === 1440
                resolution = 1440
        }

        /*if (timeFrame.includes('1M')) {
            resolution = 1
        }
        if (timeFrame.includes('D')) {
            // 1 day in minutes === 1440
            resolution = 1440
        } else if (timeFrame.includes('W')) {
            // 1 week in minutes === 10080
            resolution = 10080
        }*/

        // @ts-ignore
        let coeff = resolution * 60
        // Round the time to the nearest minute, Change as per your resolution
        // @ts-ignore
        let rounded = Math.floor((dataFeed.timestamp / 1000) / coeff) * coeff
        let lastBarSec = lastCandlestick.date.getTime() / 1000
        let _lastBar

        if (rounded > lastBarSec) {
            // create a new candle, use last close as open
            _lastBar = {
                date: new Date(rounded * 1000),
                open: dataFeed.ask,
                high: dataFeed.ask,
                low: dataFeed.ask,
                close: dataFeed.ask,
                volume: dataFeed.volume
            }
            setData([...stateDataRef.current, _lastBar]);

        } else {
            // update last candle! candle still open just modify it
            lastCandlestick.high = dataFeed.ask > lastCandlestick.high ? dataFeed.ask : lastCandlestick.high;
            lastCandlestick.low = dataFeed.ask < lastCandlestick.low ? dataFeed.ask : lastCandlestick.low;
            lastCandlestick.volume += dataFeed.volume
            lastCandlestick.close = dataFeed.ask
            _lastBar = lastCandlestick

            setData([...stateDataRef.current.slice(0, -1), _lastBar]);

        }


        /* const websocketDate: Date = new Date(dataFeed.t);

         const newCandlestick = {
             open: lastCandlestick.open,
             high: Math.max(lastCandlestick.high, dataFeed.p),
             low: Math.min(lastCandlestick.low, dataFeed.p),
             close: dataFeed.p,
             volume: dataFeed.v,
             date: new Date(dataFeed.t)
         };

         // @ts-ignore
         if (!isWithinOneMinute(newCandlestick.date, lastCandlestick.date)) {
             // New time period, create a new candlestick
             const newCandlestick = {
                 open: dataFeed.p,
                 high: dataFeed.p,
                 low: dataFeed.p,
                 close: dataFeed.p,
                 volume: dataFeed.v,
                 date: websocketDate,
             };
             setData([...stateDataRef.current, newCandlestick]);
         } else {
             // Update the last candlestick
             setData([...stateDataRef.current.slice(0, -1), newCandlestick]);
         }
 */
        /*   if (timeFrame === TimeFrame.M1) {
               if (lastCandleDate && isWithinOneMinute(websocketDate, lastCandleDate)) {
                   setData((prevData: any[]) => {
                       const updatedData = [...prevData];
                       if (updatedData.length > 0) {
                           const lastCandle = updatedData[updatedData.length - 1];
                           if (lastCandle) {
                               if (lastCandle.close > lastCandle.open) {
                                   lastCandle.close = dataFeed.p;
                               } else {
                                   lastCandle.open = dataFeed.p;
                               }

                               if (dataFeed.p > lastCandle.high) {
                                   lastCandle.high = dataFeed.p;
                               }

                               if (dataFeed.p < lastCandle.low) {
                                   lastCandle.low = dataFeed.p;
                               }
                           }
                       }
                       return updatedData;
                   });
               } else {
                   fetchLastData()
               }
           }
   */
        /*   if (timeFrame === TimeFrame.D) {
           }*/
    }

    const handleRealTimeCandle = (dataFeed: any) => {
        const lastCandlestick = stateDataRef.current[stateDataRef.current.length - 1];

        let resolution

        switch (timeFrame) {
            case "1M":
                resolution = 1
                break;
            case "5M":
                resolution = 5
                break;
            case "15M":
                resolution = 15
                break;
            case "30M":
                resolution = 30
                break;
            case "1H":
                resolution = 60
                break;
            case "D":
                // 1 day in minutes === 1440
                resolution = 1440
                break;
            case "W":
                // 1 week in minutes === 10080
                resolution = 10080
                break;
            case "M":
                // 1 month (31 days) in minutes === 44640
                //todo for month 30 and 31 days
                resolution = 44640
                break;

            default:
                // 1 day in minutes === 1440
                resolution = 1440
        }

        /*if (timeFrame.includes('1M')) {
            resolution = 1
        }
        if (timeFrame.includes('D')) {
            // 1 day in minutes === 1440
            resolution = 1440
        } else if (timeFrame.includes('W')) {
            // 1 week in minutes === 10080
            resolution = 10080
        }*/

        // @ts-ignore
        let coeff = resolution * 60
        // Round the time to the nearest minute, Change as per your resolution
        // @ts-ignore
        let rounded = Math.floor((dataFeed.t / 1000) / coeff) * coeff
        let lastBarSec = lastCandlestick.date.getTime() / 1000
        let _lastBar

        if (rounded > lastBarSec) {
            // create a new candle, use last close as open
            _lastBar = {
                date: new Date(rounded * 1000),
                open: dataFeed.p,
                high: dataFeed.p,
                low: dataFeed.p,
                close: dataFeed.p,
                volume: dataFeed.v
            }
            setData([...stateDataRef.current, _lastBar]);

        } else {
            // update last candle! candle still open just modify it
            lastCandlestick.high = dataFeed.p > lastCandlestick.high ? dataFeed.p : lastCandlestick.high;
            lastCandlestick.low = dataFeed.p < lastCandlestick.low ? dataFeed.p : lastCandlestick.low;
            lastCandlestick.volume += dataFeed.v
            lastCandlestick.close = dataFeed.p
            _lastBar = lastCandlestick

            setData([...stateDataRef.current.slice(0, -1), _lastBar]);

        }


        /* const websocketDate: Date = new Date(dataFeed.t);

         const newCandlestick = {
             open: lastCandlestick.open,
             high: Math.max(lastCandlestick.high, dataFeed.p),
             low: Math.min(lastCandlestick.low, dataFeed.p),
             close: dataFeed.p,
             volume: dataFeed.v,
             date: new Date(dataFeed.t)
         };

         // @ts-ignore
         if (!isWithinOneMinute(newCandlestick.date, lastCandlestick.date)) {
             // New time period, create a new candlestick
             const newCandlestick = {
                 open: dataFeed.p,
                 high: dataFeed.p,
                 low: dataFeed.p,
                 close: dataFeed.p,
                 volume: dataFeed.v,
                 date: websocketDate,
             };
             setData([...stateDataRef.current, newCandlestick]);
         } else {
             // Update the last candlestick
             setData([...stateDataRef.current.slice(0, -1), newCandlestick]);
         }
 */
        /*   if (timeFrame === TimeFrame.M1) {
               if (lastCandleDate && isWithinOneMinute(websocketDate, lastCandleDate)) {
                   setData((prevData: any[]) => {
                       const updatedData = [...prevData];
                       if (updatedData.length > 0) {
                           const lastCandle = updatedData[updatedData.length - 1];
                           if (lastCandle) {
                               if (lastCandle.close > lastCandle.open) {
                                   lastCandle.close = dataFeed.p;
                               } else {
                                   lastCandle.open = dataFeed.p;
                               }

                               if (dataFeed.p > lastCandle.high) {
                                   lastCandle.high = dataFeed.p;
                               }

                               if (dataFeed.p < lastCandle.low) {
                                   lastCandle.low = dataFeed.p;
                               }
                           }
                       }
                       return updatedData;
                   });
               } else {
                   fetchLastData()
               }
           }
   */
        /*   if (timeFrame === TimeFrame.D) {
           }*/
    }

    const fetchInitialData = async () => {
        try {
            let from;

            setLoading(true)

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

            console.log({symbol})
            const candleData = await fetchCandleData(symbol, timeFrame, from, Math.floor(new Date().getTime() / 1000));
            // const candleData = await fetchCandleData(symbol, timeFrame, from, Math.floor(new Date().getTime() / 1000));
            // const candleData = await fetchCandleData(symbol, "d", "2023-08-20", "2024-02-03");
            // console.log(candleData)

            setData(candleData)
            setLoading(false)

        } catch (error) {
            console.error('Error fetching candle data:', error);
            setError(true)
        }
    };

    const handleNewTick = (message: any) => {

        setData((prevData: any) => {
            if (!prevData || prevData.length === 0) return null;
            const newData = [...prevData];
            const lastCandle = {...newData[newData.length - 1]};
            const currentTime = new Date();

            // Calculate the start time for the next candle based on the last candle's date
            const nextCandleStartTime = new Date(lastCandle.date);

            if (currentTime >= nextCandleStartTime) {
                // Time to start a new candle
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

    /*const handleRealTimeTick2 = (websocketData: any) => {
        let websocketDate = new Date(websocketData.t);
        setLastTime(websocketDate)
       /!* let websocketCandle = {
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
        };*!/

        const lastCandleDate = stateRef?.current

        if (timeFrame == TimeFrame.M1) {
            if (isWithinOneMinute(websocketDate, lastCandleDate)) {
                const lastCandle = data[data.length - 1];
                // if (lastCandle && websocketData.p > lastCandle.high) {
                if (lastCandle && lastCandle.close > lastCandle.open) {
                    // asc candle
                    lastCandle.close = websocketData.p;
                } else {
                    // desc candle
                    lastCandle.open = websocketData.p;
                }

                if (lastCandle && websocketData.p > lastCandle.high) {
                    lastCandle.high = websocketData.p;
                }

                if (lastCandle && websocketData.p < lastCandle.low) {
                    lastCandle.low = websocketData.p;
                }

                setData((data: any[]) => [...data.slice(0, data.length - 1), lastCandle])
            } else {
                setLastTime(new Date())
                // fetchLastData()
            }
        }

        if (timeFrame == TimeFrame.D) {
        }

    }
*/

    const fetchLastData = async () => {
        try {
            let fromDate;
            let toDate;

            switch (timeFrame) {
                case "1M":
                    fromDate = Math.floor(new Date().getTime() / 1000) - 120;
                    toDate = Math.floor(new Date().getTime() / 1000);
                    break;
                case "D":
                    fromDate = Math.floor(new Date().getTime() / 1000) - (1 * 24 * 3600);
                    break;

                //todo add other time frame

                default:
                    fromDate = Math.floor(new Date().getTime() / 1000) - (1 * 24 * 3600)
            }

            const result = await fetchCandleData(symbol, timeFrame, fromDate, toDate);
            // result.sort((a: any, b: any) =>  a.date.getTime() - b.date.getTime());
            // sort on date
            let singleResult = result[0];
            // singleResult = [singleResult, newCandle]
            // const candleData = result ? [result[0], newCandle] : newCandle;
            // const candleData = await fetchCandleData(symbol, "d", "2023-08-20", "2024-02-03");
            setData((data: any[]) => [...data.slice(0, data.length - 1), singleResult])
        } catch (error) {
            console.error('Error fetching candle data:', error);
        }
    };

    const theme = React.useMemo(() => createTheme(getDesignTokens(themeMode)), [themeMode]);

    if (data == null) {
        return <div>Loading...</div>;
    }

    const getWidth = () => {
        const width = openSideBar ? 45 : 10
        return window.innerWidth - width
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
                        fetchInitialData={fetchInitialData}
                    />
                    <div className="chart-container">
                        <Sidebar style={{
                            borderRight: 'solid 1px',
                            width: openSideBar ? '40px' : '0',
                            background: getDesignTokens(themeMode).palette.backgroundBar,
                            borderColor: getDesignTokens(themeMode).palette.borderBar
                        }}/>
                        <div className="chart" id="chartId" ref={ref} style={{
                            width: '100%',
                            background: getDesignTokens(themeMode).palette.chartBackground
                        }}>
                            {loading && !error &&
                                <div className={'loader-wrapper'} style={{ width: width - (openSideBar ? 40 : 0), height }}>
                            <CirclesWithBar
                                height={200}
                                width={width}
                                color={getDesignTokens(themeMode).palette.edgeStroke}
                                outerCircleColor={getDesignTokens(themeMode).palette.edgeStroke}
                                innerCircleColor={getDesignTokens(themeMode).palette.edgeStroke}
                                barColor={getDesignTokens(themeMode).palette.edgeStroke}
                                ariaLabel="loading"
                                wrapperStyle={{}}
                                wrapperClass=""
                                visible={true}
                            />
                            </div>}
                            {/*{data.length > 0 && <MainChart dataList={data} width={width - (openSideBar ? 45 : 10)} ratio={3}*/}
                            {/*                               theme={theme} height={height}*/}
                            {/*/>}*/}

                            {error ? <div className="error-message">failed to fetch Data</div> :  <StockChart data={stateDataRef.current} setData={setData} theme={theme}
                                                            height={window.innerHeight - 100}
                                                            ratio={3}
                                                            width={getWidth()}/>
                            }
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
