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


function App() {

    const [data, setData] = useState<any>([]);
    const {themeMode, symbol, timeFrame} = useStore();

    /* useEffect(() => {
         // Connect to the server
         const newSocket = io(WEBSOCKET_ADDRESS);

         // Set up event handlers
         newSocket.on('connect', () => {
             console.log('Connected to server');
             const msg = {
                 symbol: symbol,
                 timeFrame: '5s'
             }

             newSocket.emit('message', msg);

            /!* setInterval(() => {
                 newSocket.emit('message', msg);
             }, 5000);*!/
         });

         newSocket.on('disconnect', () => {

             console.log('Disconnected from server');
         });

         newSocket.on('message', (message: any) => {
             console.log('Received message:', message);
             handleRealTimeTick(message)
         });

         // Remember to disconnect the socket when the component unmounts
         return () => {
             console.log('disconnect');
             newSocket.disconnect();
         };
     }, [symbol, timeFrame]);*/

    const handleRealTimeTick = (websocketData: any) => {
        // let websocketData = JSON.parse(message.server_message);
        let websocketCandleDate = new Date(websocketData.t * 1000);
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

        // get last item minute from data state
        const lastCandleMinute = stateRef?.current?.slice(-1)[0]?.date.getMinutes()

        // generate current minute for websocket data
        let websocketCandleMinute = websocketCandleDate.getMinutes().toString();
        if (websocketCandleMinute.length === 1) websocketCandleMinute = '0' + websocketCandleMinute // if less than 10 ( 2 => 02)

        // generate current second for websocket data (ex: 12 or 05)
        let second = websocketCandleDate.getSeconds().toString();
        if (second.length === 1) second = '0' + second // if less than 10 ( 2 => 02)

        // console.log({date: websocketCandleDate})
        // console.log("{stateRef?.current?.slice(-1)[0]?.date}", stateRef?.current?.slice(-1)[0]?.date)

        // console.log({lastCandleMinute})
        // console.log({websocketCandleMinute})

        if (lastCandleMinute === +websocketCandleMinute) {
            console.log("update")
            setData((data: any[]) => [...data.slice(0, data.length - 1), websocketCandle])
        } else {
            console.log("new")
            // console.log("current time", Math.floor(Date.now() / 1000))
            // console.log("one minute before", Math.floor(Date.now() / 1000) - 60)

            fetchLastData(websocketCandle)
            // setData((data: any[]) => [...data, websocketCandle])
        }
    }

    // for get state value inside hooks, should ref on that state
    const stateRef: React.MutableRefObject<any> = useRef();
    stateRef.current = data;


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
    const connectWebSocket = (socket:any) => {

        // Set up event handlers
        socket.on('connect', () => {
            console.log('Connected to server');
            console.log('#############################################', symbol)
            const msg = {
                symbol: symbol,
                timeFrame: '5s'
            }

            socket.emit('message', msg);

            /*setInterval(() => {
                newSocket.emit('message', msg);
            }, 5000);*/
        });

        socket.on('disconnect', () => {

            console.log('Disconnected from server');
        });

        socket.on('message', (message: any) => {
            console.log('Received message:', message);
            let websocketData = JSON.parse(message.server_message);
            if (websocketData.m === symbol) {
                // console.log('handleRealTimeTick');
                handleRealTimeTick(websocketData)
            }
            // else {
            //     console.log('newSocket.disconnect()')
            //     socket.disconnect();
            // }
        });

        // Remember to disconnect the socket when the component unmounts
        /*return () => {
            console.log('disconnect');
            socket.disconnect();
        };*/
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
            // const candleData = await fetchCandleData(symbol, timeFrame, fromDateString, toDateString);
            // const candleData = await fetchCandleData(symbol, durationData, new Date(new Date().setDate(new Date().getDate() - 151)).toLocaleDateString("sv-SE"), new Date().toLocaleDateString("sv-SE"));

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

            console.log("from: " + from)
            console.log("to: " + Math.floor(new Date().getTime() / 1000))
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

            // console.log({from})
            // console.log({to})

            const candleData = await fetchCandleData(symbol, timeFrame, from, to);
            // const candleData = await fetchCandleData(symbol, "d", "2023-08-20", "2024-02-03");
            // console.log(candleData)
            // setData((data: any[]) => [...data, websocketCandle])
            setData(candleData)
        } catch (error) {
            console.error('Error fetching candle data:', error);
        }
    };

    const theme = createTheme({
        palette: {
            mode: themeMode,
        },
    });

    const backGroundColor = {
        background: theme.palette.mode === 'dark' ? '#0080e7' : '#90caf9',
        borderColor: theme.palette.mode === 'dark' ? '#90caf9' : '#0080e7',
    }

    if (data == null) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <div className="app-container">
                    <Toolbar style={{
                        borderBottom: 'solid 3px',
                        ...backGroundColor
                    }}/>
                    <div className="chart-container">
                        <Sidebar style={{
                            borderRight: 'solid 1px',
                            ...backGroundColor
                        }}/>
                        <div className="chart" style={{width: '100%'}}>
                            <StockChart data={data} setData={setData} theme={theme} height={window.innerHeight - 100}
                                        ratio={3}
                                        width={window.innerWidth - 45}/>
                        </div>
                    </div>
                    <Footer style={{
                        borderTop: 'solid 3px',
                        ...backGroundColor
                    }}/>
                </div>
            </ThemeProvider>
        </>
    );
}

export default App;
