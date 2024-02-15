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
    ema,
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
} from "react-financial-charts";
import {IOHLCData} from "../data";
import {useEffect, useState} from "react";


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

    function handleReset() {
        setFixedPosition(false);
    }


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


    const handleDataLoadAfter = async (e:any) => {
        setFixedPosition(true);
    };

    const handleDataLoadBefore = async (e:any) => {
        setXExtents([e, e + LENGTH_TO_SHOW])
        setFixedPosition(true);
    };

    const elder = elderRay();

    const calculatedData = elder(ema26(ema12(initialData)));

    const {data, xScale, xAccessor, displayXAccessor} = xScaleProvider(calculatedData);

    const max = xAccessor(data[data.length - 1]);
    const min = xAccessor(data[Math.max(0, data.length - LENGTH_TO_SHOW)]);

    useEffect(() => {
        if(!fixedPosition) {
            setXExtents([min, max + 10])
        }
    },[props, fixedPosition])

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
            postCalculator={(item) => {
                console.log(item)
                return item
            }}
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
                <LineSeries yAccessor={ema26.accessor()} strokeStyle={ema26.stroke()}/>
                <CurrentCoordinate yAccessor={ema26.accessor()} fillStyle={ema26.stroke()}/>
                <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()}/>
                <CurrentCoordinate yAccessor={ema12.accessor()} fillStyle={ema12.stroke()}/>
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
            <CrossHairCursor/>
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
