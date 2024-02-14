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
import { IOHLCData } from "../data";


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

export class StockChart extends React.Component<StockChartProps> {
    private readonly margin = { left: 0, right: 48, top: 0, bottom: 24 };
    private readonly pricesDisplayFormat = format(".2f");
    private readonly xScaleProvider = discontinuousTimeScaleProviderBuilder().inputDateAccessor(
        (d: IOHLCData) => d.date,
    );

  /*  constructor(props:StockChartProps) {
        super(props);
        this.state = {
            data: [],
            xScale: null,
            xAccessor: null,
            displayXAccessor: null,
            xExtents: null
        };
    }

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.symbol !== this.props.symbol ||
            prevProps.timeFrame !== this.props.timeFrame ||
            prevProps.initialData !== this.props.initialData
        ) {
            this.loadData();
        }
    }

    loadData() {
        const { initialData, maxWindowSize, ema12, ema26, smaVolume50 } = this.props;
        const { xExtents } = this.state;
        const { linearData, xScale, xAccessor, displayXAccessor } = getChartProps(initialData, maxWindowSize, ema12, ema26, smaVolume50);

        this.setState({ data: [...linearData] });

        if (xExtents == null) {
            this.setState({
                xScale,
                xAccessor,
                displayXAccessor,
                xExtents: [xAccessor(linearData[Math.max(0, linearData.length - LENGTH_TO_SHOW)]), xAccessor(linearData[linearData.length - 1])]
            });
            console.log("habibi");
        }
    }
*/
    handleReset() {
       /* this.setState({
            suffix: this.state.suffix + 1
        });*/
    }

    public render() {
        const { data: initialData, dateTimeFormat = "%d %b", height, ratio, width, theme } = this.props;

        const ema12 = ema()
            .id(1)
            .options({ windowSize: 12 })
            .merge((d: any, c: any) => {
                d.ema12 = c;
            })
            .accessor((d: any) => d.ema12);

        const ema26 = ema()
            .id(2)
            .options({ windowSize: 26 })
            .merge((d: any, c: any) => {
                d.ema26 = c;
            })
            .accessor((d: any) => d.ema26);


        const handleDataLoadAfter = async () => {
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

        const handleDataLoadBefore = async () => {
            console.log("My Data Before")
        };

        const elder = elderRay();

        const calculatedData = elder(ema26(ema12(initialData)));

        const { margin, xScaleProvider } = this;

        const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(calculatedData);

        const max = xAccessor(data[data.length - 1]);
        const min = xAccessor(data[Math.max(0, data.length - LENGTH_TO_SHOW)]);
        const xExtents = [min, max + 10];

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
            >
                <Chart id={2} height={barChartHeight} origin={barChartOrigin} yExtents={this.barChartExtents}>
                    <XAxis {...xAndYColors} />
                    <YAxis {...xAndYColors} />
                    <BarSeries fillStyle={this.volumeColor} yAccessor={this.volumeSeries} />
                </Chart>
                <Chart id={3} height={chartHeight} yExtents={this.candleChartExtents}>
                    <XAxis showGridLines showTicks={false} showTickLabel={false} {...xAndYColors} />
                    <YAxis showGridLines tickFormat={this.pricesDisplayFormat} {...xAndYColors} />
                    <CandlestickSeries />
                 {/*   <CandlestickSeries

                        fill={d => d.close > d.open ? "#547863" : "#a30f0f"}
                        stroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                        wickStroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
                    />*/}
                    <LineSeries yAccessor={ema26.accessor()} strokeStyle={ema26.stroke()} />
                    <CurrentCoordinate yAccessor={ema26.accessor()} fillStyle={ema26.stroke()} />
                    <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()} />
                    <CurrentCoordinate yAccessor={ema12.accessor()} fillStyle={ema12.stroke()} />
                    <MouseCoordinateY rectWidth={margin.right} displayFormat={this.pricesDisplayFormat} />
                    <EdgeIndicator
                        itemType="last"
                        rectWidth={margin.right}
                        fill={this.openCloseColor}
                        lineStroke={this.openCloseColor}
                        displayFormat={this.pricesDisplayFormat}
                        yAccessor={this.yEdgeIndicator}
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

                    <ZoomButtons onReset={this.handleReset}/>
                    <OHLCTooltip origin={[8, 16]} />
                </Chart>
                <Chart
                    id={4}
                    height={elderRayHeight}
                    yExtents={[0, elder.accessor()]}
                    origin={elderRayOrigin}
                    padding={{ top: 8, bottom: 8 }}
                >
                    <XAxis showGridLines gridLinesStrokeStyle="#e0e3eb" {...xAndYColors}/>
                    <YAxis ticks={4} tickFormat={this.pricesDisplayFormat} {...xAndYColors}/>

                    <MouseCoordinateX displayFormat={timeDisplayFormat} />
                    <MouseCoordinateY rectWidth={margin.right} displayFormat={this.pricesDisplayFormat} />
                    {/*<MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}
                        {...mouseEdgeAppearance}/>*/}
                    <ElderRaySeries yAccessor={elder.accessor()} />

                    <SingleValueTooltip
                        yAccessor={elder.accessor()}
                        yLabel="Elder Ray"
                        yDisplayFormat={(d: any) =>
                            `${this.pricesDisplayFormat(d.bullPower)}, ${this.pricesDisplayFormat(d.bearPower)}`
                        }
                        origin={[8, 16]}
                    />
                </Chart>
                <CrossHairCursor />
            </ChartCanvas>
        );
    }

    private readonly barChartExtents = (data: IOHLCData) => {
        return data.volume;
    };

    private readonly candleChartExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    };

    private readonly yEdgeIndicator = (data: IOHLCData) => {
        return data.close;
    };

    private readonly volumeColor = (data: IOHLCData) => {
        return data.close > data.open ? "rgba(38, 166, 154, 0.3)" : "rgba(239, 83, 80, 0.3)";
    };

    private readonly volumeSeries = (data: IOHLCData) => {
        return data.volume;
    };

    private readonly openCloseColor = (data: IOHLCData) => {
        return data.close > data.open ? "#26a69a" : "#ef5350";
    };
}

// export default withOHLCData()(withSize({ style: { minHeight: 500 } })(withDeviceRatio()(StockChart)));

/*
export const MinutesStockChart = withOHLCData("MINUTES")(
    withSize({ style: { minHeight: 600 } })(withDeviceRatio()(StockChart)),
);

export const SecondsStockChart = withOHLCData("SECONDS")(
    withSize({ style: { minHeight: 600 } })(withDeviceRatio()(StockChart)),
);
*/
