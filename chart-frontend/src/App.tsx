import React, {useEffect, useState} from 'react';
import './App.css';
import {StockChart} from "./chart/StockChart";

// import {fetchCandleData, getWebsocketData} from "./util/utils"
import Toolbar from "./layout/toolbar";
import Footer from "./layout/footer";
import Sidebar from "./layout/sidebar";
import {WEBSOCKET_ADDRESS} from "./config/constants";
import {createTheme, CssBaseline, ThemeProvider} from '@mui/material';
import useStore from "./util/store";
import {fetchCandleData} from "./util/utils";


function App() {

 const [data, setData] = useState<any>([]);

    const { themeMode, symbol } = useStore();
    const [socket, setSocket] = useState(new WebSocket(WEBSOCKET_ADDRESS))

    useEffect(() => {
        connectWebSocket();
        fetchInitialData();
    }, [symbol]); // Only on mount and unmount

      const connectWebSocket = async () => {
        /*  ws.current = new WebSocket(WS_URL);
          ws.current.onopen = () => {
              console.log("WebSocket connected");
              ws.current.send("subscribe:" + symbol);
          };
          ws.current.onmessage = (event) => {
              handleNewTick(event.data);
          };
          ws.current.onerror = (error) => {
              console.error('WebSocket Error:', error);
          };
          ws.current.onclose = () => {
              console.log('WebSocket Disconnected');
          };*/

        // const socket = new WebSocket(WEBSOCKET_ADDRESS);
        socket.onopen = () => {
          console.log('WebSocket connection opened');
          // socket.send("subscribe:" + symbol);
        };
        socket.onmessage = (event) => {
          handleNewTick(event.data);
        };
        socket.onerror = (error) => {
          console.error('WebSocket Error:', error);
        };
        socket.onerror = () => {
          console.log('WebSocket Disconnected');
        };
      };

      const handleNewTick = (message:any) => {
        /*const cleanedMessage = message.replace(/\[|\]/g, '');
        const lastHyphenIndex = cleanedMessage.lastIndexOf("-");
        const ltp = parseFloat(cleanedMessage.substring(lastHyphenIndex + 1));
        lastTickPrice.current = ltp;*/

        setData((prevData:any) => {
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
            console.log("appending new candle");
            let originalData = JSON.parse(message);

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
        /*const toDate = new Date();
        toDate.setHours(23, 59, 59, 999);
        const fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        fromDate.setDate(toDate.getDate() - 40); // Subtract 7 days

        const toDateString = formatLocalDate(toDate);
        const fromDateString = formatLocalDate(fromDate);
        console.log("Fetching data", symbol, toDateString);*/

        try {
          // const candleData = await fetchCandleData(symbol, timeFrame, fromDateString, toDateString);
          const candleData = await fetchCandleData(symbol, "d", new Date(new Date().setDate(new Date().getDate() - 151)).toLocaleDateString("sv-SE"), new Date().toLocaleDateString("sv-SE"));
          // const candleData = await fetchCandleData(symbol, "d", "2023-08-20", "2024-02-03");
          console.log(candleData)

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
          <CssBaseline />
      <div className="app-container">
        <Toolbar style={{
                borderBottom: 'solid 3px',
                ...backGroundColor
            }} />
        <div className="chart-container">
          <Sidebar style={{
              borderRight: 'solid 1px',
              ...backGroundColor
          }} />
          <div className="chart" style={{width: '100%'}}>
              <StockChart data={data} theme={theme}  height={window.innerHeight-100} ratio={3} width={window.innerWidth-45}/>
          </div>
        </div>
        <Footer style={{
            borderTop: 'solid 3px',
            ...backGroundColor
        }} />
      </div>
      </ThemeProvider>
    </>
  );
}

export default App;
