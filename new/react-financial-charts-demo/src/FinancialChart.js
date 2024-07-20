// src/FinancialChart.js

import React, {useCallback, useRef, useState} from 'react';
import {ChartCanvas, Chart, ZoomButtons} from 'react-financial-charts';
import {format} from "d3-format";

import { CandlestickSeries } from "react-financial-charts";
import { discontinuousTimeScaleProviderBuilder }  from "react-financial-charts";
import { CrossHairCursor, MouseCoordinateX, MouseCoordinateY }  from "react-financial-charts";
import { OHLCTooltip }  from "react-financial-charts";
import { XAxis, YAxis }  from "react-financial-charts";

import { timeParse, timeFormat } from 'd3-time-format';

const parseDate = timeParse("%Y-%m-%d");
const formatDate = timeFormat("%Y-%m-%d");

const initialData = [
    { date: "2020-01-01", open: 110, high: 115, low: 105, close: 112 },
    { date: "2020-01-02", open: 112, high: 117, low: 107, close: 115 },
    { date: "2020-01-03", open: 115, high: 120, low: 110, close: 118 },
    { date: "2020-01-04", open: 118, high: 122, low: 113, close: 120 },
    { date: "2020-01-05", open: 120, high: 125, low: 115, close: 123 },
    { date: "2020-01-06", open: 123, high: 128, low: 118, close: 126 },
    { date: "2020-01-07", open: 126, high: 130, low: 121, close: 129 },
    { date: "2020-01-08", open: 129, high: 134, low: 124, close: 132 },
    { date: "2020-01-09", open: 132, high: 137, low: 127, close: 135 },
    { date: "2020-01-10", open: 135, high: 140, low: 130, close: 138 },
    { date: "2020-01-11", open: 138, high: 143, low: 133, close: 141 },
    { date: "2020-01-12", open: 141, high: 146, low: 136, close: 144 },
    { date: "2020-01-13", open: 144, high: 149, low: 139, close: 147 },
    { date: "2020-01-14", open: 147, high: 152, low: 142, close: 150 },
    { date: "2020-01-15", open: 150, high: 155, low: 145, close: 153 },
    { date: "2020-01-16", open: 153, high: 158, low: 148, close: 156 },
    { date: "2020-01-17", open: 156, high: 161, low: 151, close: 159 },
    { date: "2020-01-18", open: 159, high: 164, low: 154, close: 162 },
    { date: "2020-01-19", open: 162, high: 167, low: 157, close: 165 },
    { date: "2020-01-20", open: 165, high: 170, low: 160, close: 168 },
];

const generateMoreData = (lastDate, numItems) => {
    const newData = [];
    let date = new Date(lastDate);
    for (let i = 0; i < numItems; i++) {
        date.setDate(date.getDate() + 1);
        newData.push({
            date: formatDate(date),
            open: Math.random() * 100 + 100,
            high: Math.random() * 100 + 100,
            low: Math.random() * 100 + 100,
            close: Math.random() * 100 + 100,
        });
    }
    return newData;
};

const FinancialChart = () => {
    const [data, setData] = useState(
        initialData.map(d => ({
            date: parseDate(d.date),
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }))
    );
    const chartRef = useRef(null);

    const loadMore = useCallback(() => {
        const firstDataItem = data[0];
        const newData = generateMoreData(firstDataItem.date, 5).map(d => ({
            date: parseDate(d.date),
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));
        setData([...newData, ...data]);
    }, [data]);

    const resetZoom = useCallback(() => {
        if (chartRef.current) {
            chartRef.current.reset();
        }
    }, []);

    const xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(d => d.date);
    const { data: chartData, xScale, xAccessor, displayXAccessor } = xScaleProvider(data);

    return (
        <div>
            <ChartCanvas
                height={600}
                width={1000}
                ratio={3}
                margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
                data={chartData}
                xScale={xScale}
                xAccessor={xAccessor}
                displayXAccessor={displayXAccessor}
                onLoadBefore={loadMore}
                zoomEvent={true}
                panEvent={true}
            >
                <Chart id={1} yExtents={d => [d.high, d.low]}>
                    <XAxis />
                    <YAxis />
                    <CandlestickSeries />
                    <MouseCoordinateX displayFormat={timeFormat("%Y-%m-%d")} />
                    <MouseCoordinateY displayFormat={format(".2f")} />
                    <OHLCTooltip origin={[10, 0]} />
                </Chart>
                <ZoomButtons onReset={resetZoom} />
                <CrossHairCursor />
            </ChartCanvas>
        </div>
    );
};

export default FinancialChart;