import {format} from "d3-format";
import {timeFormat} from "d3-time-format";
import * as React from "react";
import {
    BarSeries,
    CandlestickSeries,
    Chart,
    ChartCanvas,
    CrossHairCursor,
    CurrentCoordinate,
    discontinuousTimeScaleProviderBuilder,
    EdgeIndicator,
    elderRay,
    ElderRaySeries,
    lastVisibleItemBasedZoomAnchor,
    LineSeries,
    MouseCoordinateX,
    MouseCoordinateY,
    MovingAverageTooltip,
    OHLCTooltip,
    SingleValueTooltip,
    XAxis,
    YAxis,
    ZoomButtons,
    ema
} from "react-financial-charts";
import { strokeDashTypes } from "@react-financial-charts/core";
import {IOHLCData} from "../data";
import {useEffect, useRef, useState} from "react";

// import {ema12, ema26} from "../indicator/indicators";

import {TrendLine, DrawingObjectSelector, FibonacciRetracement} from "react-financial-charts";
// import {saveInteractiveNodes, getInteractiveNodes} from "../interaction/interactiveutils";
import useStore from "../util/store";
import {changeIndicatorsColor, useEventListener} from "../util/utils";
import {TrendLineType} from "../type/TrendLineType";


interface StockChartProps {
    readonly data: IOHLCData[];
    readonly height: number;
    readonly dateTimeFormat?: string;
    readonly width: number;
    readonly ratio: number;
    readonly theme?: any;
}

const mouseEdgeAppearance = {
    textFill: "#542605",
    stroke: "#05233B",
    strokeOpacity: 1,
    strokeWidth: 3,
    arrowWidth: 5,
    fill: "#BCDEFA",
};

const LENGTH_TO_SHOW = 150;

export const StockChart = (props: StockChartProps) => {
    const margin = {left: 0, right: 48, top: 0, bottom: 24};
    const pricesDisplayFormat = format(".2f");
    const xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

    const [fixedPosition, setFixedPosition] = useState(false)
    const [xExtents, setXExtents] = useState([0, 0])

    const { themeMode } = useStore();
    const {enableTrendLine, setEnableTrendLine} = useStore();
    const {enableFib, setEnableFib} = useStore();
    const [retracements, setRetracements] = useState<any[]>([]);
    const [trends, setTrends] = useState<TrendLineType[]>([])

    // const [trends, setTrends] = useState<any[]>([]);

    function handleReset() {
        setFixedPosition(false);
    }

    const canvasRef = useRef(null);


    const handler = ({ key } : any) => {
        if(key === 'Delete') {
            const newTrends = trends.filter(each => !each.selected)

            setTrends(newTrends)

            const newRetracements = retracements.filter(each => !each.selected)

            setRetracements(newRetracements)
        } else if (key === 'Escape') {
            // @ts-ignore
            canvasRef?.current?.cancelDrag()
            setEnableTrendLine(false)
            setEnableFib(false)
        }
    };

    useEventListener("keydown", handler);


    const {data: initialData, dateTimeFormat = "%d %b", height, ratio, width, theme} = props;

    const ema12 = ema()
         .id(1)
         .options({windowSize: 12})
         .merge((d: any, c: any) => {
             d.ema12 = c;
         })
         .accessor((d: any) => d.ema12);

     const ema26 = ema()
         .id(2)
         .options({windowSize: 26})
         .merge((d: any, c: any) => {
             d.ema26 = c;
         })
        .accessor((d: any) => d.ema26);

    const handleDataLoadAfter = async (e: any) => {
        setFixedPosition(true);
        console.log("My Data After")
        /*if (this.state.loadingMoreData) {
            // Exit early if we are already loading data
            return;
        }

        this.setState({ loadingMoreData: true });

        try {
            // Find the earliest date in the current dataset
            const earliestDate = this.state.data[0].date;

            // Calculate the new start date to fetch from (7 days before the earliest date)
            const startDate = new Date(earliestDate);
            startDate.setDate(startDate.getDate() - 7);

            // Format dates to 'YYYY-MM-DD HH:MM:SS' format
            const fromDateString = startDate.toISOString().slice(0, 19).replace('T', ' ');
            const toDateString = earliestDate.toISOString().slice(0, 19).replace('T', ' ');

            // Fetch more data
            const moreData = await fetchCandleData(this.state.symbol,this.state.timeFrame,fromDateString, toDateString);

            // Combine new data with existing data
            const combinedData = moreData.concat(this.state.data);

            // Update the state with the combined data
            const { ema26, ema12, macdCalculator, smaVolume50 } = this.state;

            // Recalculate the scale with the new combined data
            const calculatedData = ema26(ema12(macdCalculator(smaVolume50(combinedData))));
            const indexCalculator = discontinuousTimeScaleProviderBuilder().indexCalculator();

            // Recalculate the index with the newly combined data
            const { index } = indexCalculator(calculatedData);
            const xScaleProvider = discontinuousTimeScaleProviderBuilder().withIndex(index);
            const { data: linearData, xScale, xAccessor, displayXAccessor } = xScaleProvider(calculatedData);

            // Update the state with the new data and the recalculated scale
            this.setState({
                data: linearData, // This is the combined data with the recalculated indices
                xScale,
                xAccessor,
                displayXAccessor,
                loadingMoreData: false,
            }, () => {
                // After the state has been updated, adjust the xScale domain to create a buffer
                const { xScale, xAccessor, data } = this.state;
                this.props.onUpdateData(this.state.data);
                const totalPoints = data.length;
                const bufferPoints = 5; // Number of points to leave as a buffer to the right
                const startPoint = xAccessor(data[Math.max(0, totalPoints - bufferPoints)]);
                const endPoint = xAccessor(data[totalPoints - 1]);

                // Set the visible scale domain to show data up to the buffer
                xScale.domain([startPoint, endPoint]);

                // Force update to re-render the chart with the new domain
                this.forceUpdate();
            });
        } catch (error) {
            console.error('Error fetching more candle data:', error);
            this.setState({ loadingMoreData: false });
        }*/
    };

    const handleDataLoadBefore = async (e: any) => {
        setXExtents([e, e + LENGTH_TO_SHOW])
        setFixedPosition(true);
        console.log("My Data Before")
    };

    const onDrawCompleteChart = (event: any, trends: any) => {
        // this gets called on
        // 1. draw complete of trendline
        // @ts-ignore
        setEnableTrendLine(false);
        setTrends(trends)
    }

    const onFibComplete = (event: any, retracements: any) => {
        console.log({retracements});
        setEnableFib(false)
        setRetracements(retracements)
    }

    const handleSelection = (interactives:any) => {
       /* const state = toObject(interactives, each => {
            return [
                `retracements_${each.chartId}`,
                each.objects,
            ];
        });
        this.setState(state);*/

        console.log({interactives})
        // console.log({test})
    }

    const elder = elderRay();
    const calculatedData = elder(ema26(ema12(initialData)));

    const {data, xScale, xAccessor, displayXAccessor} = xScaleProvider(calculatedData);

    useEffect(() => {
        if (!fixedPosition) {
            const max = xAccessor(data[data.length - 1]);
            const min = xAccessor(data[Math.max(0, data.length - LENGTH_TO_SHOW)]);
            setXExtents([min, max + 10])
        }
    }, [props, fixedPosition])

    useEffect(() => {

        // change Indicators according to themeMode
        changeIndicatorsColor(themeMode, trends, setTrends, retracements, setRetracements)

    }, [themeMode])

    const gridHeight = height - margin.top - margin.bottom;

    const elderRayHeight = LENGTH_TO_SHOW;
    const elderRayOrigin = (_: number, h: number) => [0, h - elderRayHeight];
    const barChartHeight = gridHeight / 4;
    const barChartOrigin = (_: number, h: number) => [0, h - barChartHeight - elderRayHeight];
    const chartHeight = gridHeight - elderRayHeight;

    const timeDisplayFormat = timeFormat(dateTimeFormat);

    const xAndYColors = {
        tickLabelFill: theme.palette.mode === 'dark' ? '#fff' : '#000',
        tickStrokeStyle: theme.palette.mode === 'dark' ? '#fff' : '#000',
        strokeStyle: theme.palette.mode === 'dark' ? '#fff' : '#000'
    }

    return (
        <ChartCanvas
            ref={canvasRef}
            height={height}
            ratio={ratio}
            width={width}
            margin={margin}
            data={data}
            displayXAccessor={displayXAccessor}
            seriesName="Data"
            xScale={xScale}
            xAccessor={xAccessor}
            xExtents={xExtents}
            zoomAnchor={lastVisibleItemBasedZoomAnchor}
            onLoadAfter={handleDataLoadAfter}
            onLoadBefore={handleDataLoadBefore}
            /* postCalculator={(item) => {
                 console.log(item)
                 return item
             }}*/
        >
            <Chart id={2} height={barChartHeight} origin={barChartOrigin} yExtents={barChartExtents}>
                <XAxis {...xAndYColors} />
                <YAxis {...xAndYColors} />
                <BarSeries fillStyle={volumeColor} yAccessor={volumeSeries}/>
            </Chart>
            <Chart id={3} height={chartHeight} yExtents={candleChartExtents}>
                <XAxis showGridLines showTicks={false} showTickLabel={false} {...xAndYColors} />
                <YAxis showGridLines tickFormat={pricesDisplayFormat} {...xAndYColors} />
                <CandlestickSeries/>
                {/*   <CandlestickSeries

                        fill={d => d.close > d.open ? "#547863" : "#a30f0f"}
                        stroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                        wickStroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                    />*/}
                {/*<LineSeries yAccessor={ema26.accessor()} strokeStyle={ema26.stroke()}/>
                <CurrentCoordinate yAccessor={ema26.accessor()} fillStyle={ema26.stroke()}/>
                <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()}/>
                <CurrentCoordinate yAccessor={ema12.accessor()} fillStyle={ema12.stroke()}/>*/}
                <MouseCoordinateY rectWidth={margin.right} displayFormat={pricesDisplayFormat}/>
                <EdgeIndicator
                    itemType="last"
                    rectWidth={margin.right}
                    fill={openCloseColor}
                    lineStroke={openCloseColor}
                    displayFormat={pricesDisplayFormat}
                    yAccessor={yEdgeIndicator}
                />
                {/* <EdgeIndicator itemType="last" orient="right" edgeAt="right"
                                   yAccessor={d => d.close}
                                   fill={d => d.close > d.open ? "#A2F5BF" : "#F9ACAA"}
                                   stroke={d => d.close > d.open ? "#0B4228" : "#6A1B19"}
                                   textFill={d => d.close > d.open ? "#0B4228" : "#420806"}
                                   strokeOpacity={1}
                                   strokeWidth={3}
                                   arrowWidth={2}
                    />*/}
                <MovingAverageTooltip
                    origin={[8, 24]}
                    options={[
                        {
                            yAccessor: ema26.accessor(),
                            type: "EMA",
                            stroke: ema26.stroke(),
                            windowSize: ema26.options().windowSize,
                        },
                        {
                            yAccessor: ema12.accessor(),
                            type: "EMA",
                            stroke: ema12.stroke(),
                            windowSize: ema12.options().windowSize,
                        },
                    ]}
                />

                <ZoomButtons onReset={handleReset}/>
                <OHLCTooltip origin={[8, 16]}/>

                <TrendLine
                    // ref={saveInteractiveNodes("Trendline", 3)}
                    enabled={enableTrendLine}
                    type="RAY"
                    snap={false}
                    snapTo={d => [d.high, d.low]}
                    onStart={() => console.log("START", trends)}
                    onComplete={onDrawCompleteChart}
                    appearance={{
                        strokeStyle: themeMode === 'dark' ? '#fff' : '#000',
                        strokeWidth: 1,
                        strokeDasharray: "Solid",
                        edgeStrokeWidth: 1,
                        edgeFill: themeMode === 'dark' ? '#fff' : '#000',
                        edgeStroke: themeMode === 'dark' ? '#000' : '#fff',
                    }}
                    // onComplete={() => console.log("End", trends)}
                    trends={trends}

                />

                <FibonacciRetracement
                    // ref={saveInteractiveNodes("FibonacciRetracement", 3)}
                    enabled={enableFib}
                    retracements={retracements}
                    onComplete={onFibComplete}
                    appearance={{
                        strokeStyle: themeMode === 'dark' ? '#fff' : '#000',
                        strokeWidth: 1,
                        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
                        fontSize: 11,
                        fontFill: themeMode === 'dark' ? '#fff' : '#000',
                        edgeStroke: themeMode === 'dark' ? '#fff' : '#000',
                        edgeFill: themeMode === 'dark' ? '#000' : '#fff',
                        nsEdgeFill: themeMode === 'dark' ? '#fff' : '#000',
                        edgeStrokeWidth: 1,
                        r: 5,
                    }}
                />

            </Chart>
            <Chart
                id={4}
                height={elderRayHeight}
                yExtents={[0, elder.accessor()]}
                origin={elderRayOrigin}
                padding={{top: 8, bottom: 8}}
            >
                <XAxis showGridLines gridLinesStrokeStyle="#e0e3eb" {...xAndYColors}/>
                <YAxis ticks={4} tickFormat={pricesDisplayFormat} {...xAndYColors}/>

                <MouseCoordinateX displayFormat={timeDisplayFormat}/>
                <MouseCoordinateY rectWidth={margin.right} displayFormat={pricesDisplayFormat}/>
                {/*<MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}
                        {...mouseEdgeAppearance}/>*/}
                <ElderRaySeries yAccessor={elder.accessor()}/>

                <SingleValueTooltip
                    yAccessor={elder.accessor()}
                    yLabel="Elder Ray"
                    yDisplayFormat={(d: any) =>
                        `${pricesDisplayFormat(d.bullPower)}, ${pricesDisplayFormat(d.bearPower)}`
                    }
                    origin={[8, 16]}
                />
            </Chart>
            {/* <LineSeries
                yAccessor={custom_indicator_state.accessor()}
                stroke={custom_indicator.stroke()}
                highlightOnHover
            />*/}
            <CrossHairCursor/>
            {/*
            <DrawingObjectSelector
                enabled={!enableTrendLine}
                getInteractiveNodes={() => []}
                drawingObjectMap={{
                    Trendline: "trends"
                }}
                onSelect={handleSelection}
            />

            <DrawingObjectSelector
                enabled={!enableFib}
                getInteractiveNodes={() => []}
                drawingObjectMap={{
                    FibonacciRetracement: "retracements"
                }}
                onSelect={handleSelection}
            />
            />*/}
        </ChartCanvas>
    );
}

const barChartExtents = (data: IOHLCData) => {
    return data.volume;
};

const candleChartExtents = (data: IOHLCData) => {
    return [data.high, data.low];
};

const yEdgeIndicator = (data: IOHLCData) => {
    return data.close;
};

const volumeColor = (data: IOHLCData) => {
    return data.close > data.open ? "rgba(38, 166, 154, 0.3)" : "rgba(239, 83, 80, 0.3)";
};

const volumeSeries = (data: IOHLCData) => {
    return data.volume;
};

const openCloseColor = (data: IOHLCData) => {
    return data.close > data.open ? "#26a69a" : "#ef5350";
};

// export default withOHLCData()(withSize({ style: { minHeight: 500 } })(withDeviceRatio()(StockChart)));

/*
export const MinutesStockChart = withOHLCData("MINUTES")(
    withSize({ style: { minHeight: 600 } })(withDeviceRatio()(StockChart)),
);

export const SecondsStockChart = withOHLCData("SECONDS")(
    withSize({ style: { minHeight: 600 } })(withDeviceRatio()(StockChart)),
);
*/
