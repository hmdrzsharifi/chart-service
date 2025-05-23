import {format} from "d3-format";
import {timeFormat} from "d3-time-format";
import * as React from "react";
import {useEffect, useMemo, useRef, useState} from "react";
import {
    AlternatingFillAreaSeries,
    AreaSeries,
    atr,
    BarSeries,
    BollingerBandTooltip,
    BollingerSeries,
    Brush,
    change,
    Chart,
    ChartCanvas,
    CrossHairCursor,
    CurrentCoordinate,
    discontinuousTimeScaleProviderBuilder,
    EdgeIndicator,
    elderRay,
    ElderRaySeries,
    ema,
    EquidistantChannel,
    FibonacciRetracement,
    forceIndex,
    HoverTooltip,
    InteractiveText,
    lastVisibleItemBasedZoomAnchor,
    LineSeries,
    macd,
    MACDSeries,
    MACDTooltip,
    MouseCoordinateX,
    MouseCoordinateY,
    MovingAverageTooltip,
    OHLCSeries,
    OHLCTooltip,
    rsi,
    RSISeries,
    RSITooltip,
    sar,
    SARSeries,
    SingleValueTooltip,
    sma,
    stochasticOscillator,
    StochasticSeries,
    StochasticTooltip,
    StraightLine,
    TrendLine,
    StandardDeviationChannel,
    GannFan,
    XAxis,
    YAxis,
    ZoomButtons,
    LabelAnnotationProps,
    ClickCallback

} from "react-financial-charts";

import {Annotate, SvgPathAnnotation, LabelAnnotation} from 'react-financial-charts';

import {IOHLCData} from "../data";

import {
    accelerationFactor,
    bb,
    ema12,
    ema20,
    ema26,
    ema50,
    macdCalculator,
    maxAccelerationFactor,
    sma20,
    smaVolume50,
} from "../indicator/indicators";
import useStore from "../util/store";
import {
    changeIndicatorsColor,
    fetchEarnings,
    fetchDividends,
    useEventListener,
    studyChartHeight, fetchCandleDataTwelveData
} from "../util/utils";
import {TrendLineType} from "../type/TrendLineType";
import {
    NO_OF_CANDLES,
    LENGTH_TO_SHOW,
    TOOLTIP_HEIGHT,
    TOOLTIP_PADDING_LEFT,
    TOOLTIP_PADDING_TOP
} from "../config/constants";
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded';
import {HourAndMinutesTimeFrames, StudiesChart, TimeFrame} from "../type/Enum";
import SelectedSeries from "./SelectedSeries";
import useDesignStore from "../util/designStore";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import {
    Button,
    ClickAwayListener,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ListItem,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    Popover
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import getDesignTokens from "../config/theme";

import {macdAppearance, mouseEdgeAppearance, stoAppearance} from '../indicator/indicatorSettings'
import {BorderColor} from "@mui/icons-material";
import EditIcon from '@mui/icons-material/Edit';
// @ts-ignore
import {ColorResult, SketchPicker} from "react-color";
import finnhubSymbols from "../finnhub-symbols.json";
// @ts-ignore
import {useSnackbar, VariantType} from "notistack";

interface MainChartProps {
    readonly dataList: IOHLCData[];
    readonly height: number;
    readonly dateTimeFormat?: string;
    readonly width: number;
    readonly ratio: number;
    readonly theme?: any;
    readonly reloadFromSymbol?: boolean;
    readonly last?: any;
}

interface Earnings {
    date: string;
    eps: number;
    epsEstimated: number;
    fiscalDateEnding: string;
    revenue: number;
    revenueEstimated: number;
    updatedFromDate: string;
}

interface Dividends {
    date: string;
    label: string;
    adjDividend: number;
    dividend: number;
    recordDate: string;
    paymentDate: string;
    declarationDate: string;
}

const bbStroke = {
    top: "#964B00",
    middle: "#000000",
    bottom: "#964B00",
};

const bbFill = "rgba(70,130,180,0.24)";

export const MainChart = (props: MainChartProps) => {

    const {dateTimeFormat = "%d %b", height, ratio, width, theme, dataList, reloadFromSymbol,last} = props;

    // ----------------- store ----------------- //
    const {
        timeFrame, setTimeFrame,
        symbol, setSymbol,
        disableCrossHair,
        studiesCharts, setStudiesCharts,
        studiesChartsWithTooltip, setStudiesChartsWithTooltip,
        selectedSymbol,
        seriesType,
        disableHoverTooltip,
        disableVolume, setDisableVolume,
        setError,
        equidistantChannels, setEquidistantChannels,
        trends, setTrends,
        retracements, setRetracements,
        standardDeviationChannel, setStandardDeviationChannel,
        fans, setFans,
        xExtents, setXExtents,
        openSaveDialog, setOpenSaveDialog,
        suffix , setSuffix,
        symbolCategory
    } = useStore();

    const {
        themeMode,
        enableTrendLine, setEnableTrendLine,
        enableFib, setEnableFib,
        enableEquidistant, setEnableEquidistant,
        enableBrush, setEnableBrush,
        enableInteractiveObject, setEnableInteractiveObject,
        loading, setLoading,
        enableStandardDeviationChannel, setEnableStandardDeviationChannel,
        enableGanFan, setEnableGanFan,

    } = useDesignStore();

    // ----------------- refs ----------------- //
    const canvasRef = useRef(null);

    const [start1 , setStart1]  =useState(0)

    // ----------------- states ----------------- //
    const [data, setData] = useState<any>(dataList)
    const [ema12, setEma12] = useState<any>()
    const [ema26, setEma26] = useState<any>()
    const [macdCalculator, setMacdCalculator] = useState<any>()
    const [smaVolume50, setSmaVolume50] = useState<any>()
    const [linearData, setLinearData] = useState<any>()
    const [xScale, setXScale] = useState<any>()
    const [xAccessor, setXAccessor] = useState<any>()
    const [displayXAccessor, setDisplayXAccessor] = useState<any>()
    const [fixedPosition, setFixedPosition] = useState(false)
    const [text, setText] = useState<any[]>([]);
    const [yExtents1, setYExtents1] = useState<any>()

    // --- modal states --- //
    const [openMovingAverageModal, setOpenMovingAverageModal] = useState<boolean>(false);
    const [openElderRayModal, setOpenElderRayModal] = useState<boolean>(false);

    const [textList_1, textList_3] = useState<any[]>([]);
    const [hover, setHover] = useState<boolean>();
    const [selected, setSelected] = useState<boolean>(false);
    const BRUSH_TYPE = "2D";
    const [earnings, setEarnings] = useState<Earnings[]>([]);
    const [dividends, setDividends] = useState<Dividends[]>([]);
    const { enqueueSnackbar } = useSnackbar();

    const [brushes, setBrushes] = useState<any[]>([])
    const numberFormat = format(".2f");

    // ----------------- helpers constants ----------------- //
    const margin = {left: 0, right: 58, top: 10, bottom: 40};
    const gridHeight = height - margin.top - margin.bottom;
    const chartHeight =
        gridHeight - (studiesCharts.length +
            (studiesCharts.includes(StudiesChart.STOCHASTIC_OSCILLATOR) ? 2 : 0) +
            (studiesCharts.includes(StudiesChart.FORCE_INDEX) ? 1 : 0) +
            (studiesCharts.includes(StudiesChart.RSI_AND_ATR) ? 1 : 0)
        ) * studyChartHeight(studiesCharts);
    const pricesDisplayFormat = format(".2f");
    const dateFormat = timeFormat("%Y-%m-%d");
    const barChartHeight = gridHeight / 4;
    const elder = elderRay();
    const timeDisplayFormat = timeFormat(HourAndMinutesTimeFrames.includes(timeFrame) ? "%H %M" : dateTimeFormat);
    const showGrid = false;
    const xGrid = showGrid ? {innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.1} : {};


    const getlastPriceForColor = (): string => {
        const lastItem = dataList[dataList.length - 1];
        if (!lastItem) {
            return '#ccc'
        }
        return lastItem.close > lastItem.open ? "#8cc176" : "#b82c0c";
    };

    // ----------------- helpers methods ----------------- //
    const candleChartExtents = (data: IOHLCData) => {
        return [data.high, data.low];
    };

    const isStudiesChartWithTooltipInclude = (chart: StudiesChart): boolean => {
        return studiesChartsWithTooltip.includes(chart)
    }

    const isStudiesChartInclude = (chart: StudiesChart): boolean => {
        return studiesCharts.includes(chart)
    }

    const getLastPrice = (d: any): number => {
        return data[data.length - 1].close;
    };

    const getStudiesChartTooltipOrigin = (chart: StudiesChart, yPosition = TOOLTIP_PADDING_LEFT, paddingTop = TOOLTIP_PADDING_TOP, height = TOOLTIP_HEIGHT) => {
        return [yPosition, studiesChartsWithTooltip.indexOf(chart) * height + paddingTop]
    }

    const xAndYColors = {
        tickLabelFill: getDesignTokens(themeMode).palette.lineColor,
        tickStrokeStyle: getDesignTokens(themeMode).palette.lineColor,
        strokeStyle: getDesignTokens(themeMode).palette.lineColor,
        gridLinesStrokeStyle: getDesignTokens(themeMode).palette.grindLineColor,
    }

    const openCloseColor = (data: IOHLCData) => {
        return data.close > data.open ? "#8cc176" : "#b82c0c";
    };

    const volumeColor = (data: IOHLCData) => {
        return data.close > data.open ? "#8cc17699" : "#b82c0c99";
    };

    const yEdgeIndicator = (data: IOHLCData) => {
        return data.close;
    };

    function handleReset() {
        setSuffix(suffix + 1)
    }

    function handleHover(_: React.MouseEvent, moreProps: any) {
        if (hover !== moreProps.hovering) {
            setHover(moreProps.hovering);
        }
    }

    const hoverHandler = {
        onHover: handleHover,
        onUnHover: handleHover,
    };
    /* const onDrawCompleteChart = (event: any, trends: any) => {
         // this gets called on
         // 1. draw complete of trendline
         setEnableTrendLine(false);
         setTrends(trends)
     }*/

    /* const onDrawCompleteChart = (e: React.MouseEvent, newTrends: any[], moreProps: any) => {
         console.log({newTrends});
         setEnableTrendLine(false);
         setTrends(newTrends);

         setMenuPosition({
             mouseX: e.clientX - 2,
             mouseY: e.clientY - 4,
         });
         setContextMenuVisible(true);
         setSelectedTrend(newTrends[newTrends.length - 1]);
     };*/


    /* const onFibComplete = (event: any, retracements: any) => {
         setEnableFib(false)
         setRetracements(retracements)
     }

     const onDrawCompleteEquidistantChannel = (event: any, equidistantChannels: any) => {
         // this gets called on
         // 1. draw complete of trendline
         setEnableEquidistant(false);
         setEquidistantChannels(equidistantChannels)
     }*/

    /*    const onDrawCompleteEquidistantChannel = (event: any, equidistantChannels: any) => {
            // this gets called on
            // 1. draw complete of trendline
            // @ts-ignore
            console.log({equidistantChannels});
            setEnableEquidistant(false);
            setEquidistantChannels(equidistantChannels)
        }*/

    const [openEaDialog, setOpenEaDialog] = useState(false);
    const [openDvDialog, setOpenDvDialog] = useState(false);
    const [eaDialogContent, setEaDialogContent] = useState({ eps: '', revenue: '', date: '' , epsEstimated: ''});
    const [dvDialogContent, setDvDialogContent] = useState({ dividend: '', date: ''});

    const handleEarningsClick = (ea:any) => {
        setEaDialogContent({ eps: ea.eps, revenue: ea.revenue, date: ea.date , epsEstimated: ea.epsEstimated});
        setOpenEaDialog(true);
    };

    const handleDividendsClick = (dv:any) => {
        setDvDialogContent({ dividend: dv.dividend, date: dv.date });
        setOpenDvDialog(true);
    };

    const onDrawComplete = (textList: any, moreProps: any) => {
        // this gets called on
        // 1. draw complete of drawing object
        // 2. drag complete of drawing object
        const {id: chartId} = moreProps.chartConfig;

        setEnableInteractiveObject(false)
        setText([...text, textList])
    }

    const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        console.log({event})
        event.preventDefault();
        setMenuPosition({
            mouseX: event.clientX,
            mouseY: event.clientY,
        });
        setContextMenuVisible(true);
    };

    const handleDragStart = (_: React.MouseEvent, moreProps: any) => {
        // const { position } = this.props;
        const {mouseXY} = moreProps;
        const {
            chartConfig: {yScale},
            xScale,
        } = moreProps;
        const [mouseX, mouseY] = mouseXY;

        // const [textCX, textCY] = position;
        // const dx = mouseX - xScale(textCX);
        // const dy = mouseY - yScale(textCY);

        // this.dragStartPosition = {
        //     position,
        //     dx,
        //     dy,
        // };
    };

    function getMaxUndefined(calculators: any) {
        return calculators.map((each: any) => each.undefinedLength()).reduce((a: any, b: any) => Math.max(a, b));
    }

    const stateDataRef: React.MutableRefObject<any> = useRef();
    stateDataRef.current = data;
    //
    // const newRowsRef: React.MutableRefObject<any> = useRef();
    // newRowsRef.current = undefined;


    const [newRowsRef, setNewRowsRef] = useState(0)

    const interactiveTextOnDrawComplete = (textList: any, moreProps: any) => {
        // this gets called on
        // 1. draw complete of drawing object
        // 2. drag complete of drawing object
        console.log({textList})
        const {id: chartId} = moreProps.chartConfig;
        setEnableInteractiveObject(false)
        // [`textList_${chartId}`]: textList

        // this.setState({
        //     enableInteractiveObject: false
        // });
    }

    /*
        const handleBrush1 = (brushCoords: any, moreProps: any) => {
            const {start, end} = brushCoords;
            const left = Math.min(start.xValue, end.xValue);
            const right = Math.max(start.xValue, end.xValue);

            const low = Math.min(start.yValue, end.yValue);
            const high = Math.max(start.yValue, end.yValue);

            // uncomment the line below to make the brush to zoom
            setXExtents([left, right])
            setYExtents1(BRUSH_TYPE === "2D" ? [low, high] : yExtents1)
            setEnableBrush(false)

            setXExtents([left, right])
            setYExtents1(BRUSH_TYPE === "2D" ? [low, high] : yExtents1)
            setEnableBrush(false)
        }
    */

    /* const barChartOrigin = (_: number, h: number) => [0, h - (studiesCharts.length) * studyChartHeight(studiesCharts) - barChartHeight];*/

    const barChartExtents = (data: IOHLCData) => {
        return data.volume;
    };

    const getStudiesChartOrigin = (w: number, h: number, chart: StudiesChart) => {

        const index = studiesCharts.indexOf(chart)
        return [0, h - ( index + 1 +
            (studiesCharts.slice(0, index).includes(StudiesChart.STOCHASTIC_OSCILLATOR) ? 2 : 0) +
            (studiesCharts.slice(0, index).includes(StudiesChart.FORCE_INDEX) ? 1 : 0) +
            (studiesCharts.slice(0, index).includes(StudiesChart.RSI_AND_ATR) ? 1 : 0)

        ) * studyChartHeight(studiesCharts)]
    }

    const showTickLabel = (chart: StudiesChart) => {
        return studiesCharts.indexOf(chart) === 0
    }

    const rsiCalculator = rsi()
        .options({windowSize: 14})
        .merge((d: any, c: any) => {
            d.rsi = c;
        })
        .accessor((d: any) => d.rsi);
    const calculatedData2 = rsiCalculator(data);

    const atr14 = atr()
        .options({windowSize: 14})
        .merge((d: any, c: any) => {
            d.atr14 = c;
        })
        .accessor((d: any) => d.atr14);
    const calculatedData3 = atr14(data);

    const fi = forceIndex()
        .merge((d: any, c: any) => {
            d.fi = c;
        })
        .accessor((d: any) => d.fi);
    const calculatedData4 = fi(data);

    const fiEMA13 = ema()
        .id(1)
        .options({windowSize: 13, sourcePath: "fi"})
        .merge((d: any, c: any) => {
            d.fiEMA13 = c;
        })
        .accessor((d: any) => d.fiEMA13);
    const calculatedData5 = fiEMA13(data);

    const slowSTO = stochasticOscillator()
        .options({windowSize: 14, kWindowSize: 3, dWindowSize: 4})
        .merge((d: any, c: any) => {
            d.slowSTO = c;
        })
        .accessor((d: any) => d.slowSTO);
    const calculatedData7 = slowSTO(elder(data));

    const fastSTO = stochasticOscillator()
        .options({windowSize: 14, kWindowSize: 1, dWindowSize: 4})
        .merge((d: any, c: any) => {
            d.fastSTO = c;
        })
        .accessor((d: any) => d.fastSTO);
    const calculatedData8 = fastSTO(elder(data));

    const fullSTO = stochasticOscillator()
        .options({windowSize: 14, kWindowSize: 3, dWindowSize: 4})
        .merge((d: any, c: any) => {
            d.fullSTO = c;
        })
        .accessor((d: any) => d.fullSTO);
    const calculatedData9 = fullSTO(elder(data));

    const defaultSar = sar()
        .options({
            accelerationFactor, maxAccelerationFactor
        })
        .merge((d: any, c: any) => {
            d.sar = c;
        })
        .accessor((d: any) => d.sar);
    const calculatedData1 = defaultSar(data);
    // const parseDate = timeParse("%Y-%m-%d");
    // const buyPath = "M0,-10 L5,0 L0,10 L-5,0 Z";


    // ----------------- useEffects ----------------- //

    useEffect(() => {
        // change Indicators according to themeMode
        changeIndicatorsColor(themeMode, trends, setTrends, retracements, setRetracements)

    }, [themeMode])

    const getEarnings = async () => {
        const earningsData = await fetchEarnings(symbol, data[0].date, new Date());
        if (symbolCategory === 'STC' && (earningsData.message === 'Failed to fetch' || earningsData.length === 0)){
            if (earningsData.length === 0){
                setEarnings([]);
            }else {
                handleSnackbarError('error', 'failed to fetch EarningsFMP')
                setEarnings([]);
            }
        }else if (earningsData.message === 'Failed to fetch' || earningsData.length === 0){
            setEarnings([]);
        } else {
            setEarnings(earningsData);
        }
    };

    const getDividends = async () => {
        const dividendsData = await fetchDividends(symbol, data[0].date, new Date());
        if (symbolCategory === 'STC' && (dividendsData.message === 'Failed to fetch' || dividendsData.length === 0)){
            if (dividendsData.length === 0){
                setDividends([]);
            }else {
                handleSnackbarError('error', 'failed to fetch DividendsFMP')
                setDividends([]);
            }
        }else if (dividendsData.message === 'Failed to fetch' || dividendsData.length === 0){
            setDividends([]);
        } else {
            setDividends(dividendsData);
        }

    };

    const handleSnackbarError = (variant: VariantType , message:string) => {
        enqueueSnackbar(message, { variant });
    };

    useEffect(() => {
        if (data.length > 0) {
            getEarnings();
            getDividends();
        }
    }, [symbol])

    useMemo(() => {
        const data = dataList;

        const ema26Indicator = ema()
            .id(0)
            .options({windowSize: 26})
            .merge((d: any, c: any) => {
                d.ema26 = c;
            })
            .accessor((d: any) => d.ema26);

        const ema12Indicator = ema()
            .id(1)
            .options({windowSize: 12})
            .merge((d: any, c: any) => {
                d.ema12 = c;
            })
            .accessor((d: any) => d.ema12);

        const macdCalculatorIndicator = macd()
            .options({
                fast: 12,
                slow: 26,
                signal: 9,
            })
            .merge((d: any, c: any) => {
                d.macd = c;
            })
            .accessor((d: any) => d.macd);

        const smaVolume50Indicator = sma()
            .id(3)
            .options({
                windowSize: 50,
                sourcePath: "volume",
            })
            .merge((d: any, c: any) => {
                d.smaVolume50 = c;
            })
            .accessor((d: any) => d.smaVolume50);

        /* SERVER - START */
        const dataToCalculate = data.slice(-LENGTH_TO_SHOW);
        const calculatedData = ema26Indicator(ema12Indicator(macdCalculatorIndicator(smaVolume50Indicator(dataToCalculate))));
        const indexCalculator = discontinuousTimeScaleProviderBuilder().indexCalculator();
        const {index} = indexCalculator(calculatedData);
        /* SERVER - END */


        const xScaleProvider = discontinuousTimeScaleProviderBuilder()
            .withIndex(index);
        const {
            data: linearData,
            xScale,
            xAccessor,
            displayXAccessor
        } = xScaleProvider(calculatedData.slice(-LENGTH_TO_SHOW));

        const max = xAccessor(linearData[linearData.length - 1]);
        const min = xAccessor(linearData[Math.max(0, linearData.length - LENGTH_TO_SHOW)]);

        setXExtents([min, max + 10])

        setEma26(() => ema26Indicator)
        setEma12(() => ema12Indicator)
        setMacdCalculator(() => macdCalculatorIndicator)
        setSmaVolume50(() => smaVolume50Indicator)
        setLinearData(linearData)
        setData(linearData)
        stateDataRef.current = linearData
        setXScale(() => xScale)
        setXAccessor(() => xAccessor)
        setDisplayXAccessor(() => displayXAccessor)
    }, [reloadFromSymbol])


    useEffect(() => {

        console.log({last})

        if(last == null || last == undefined)
            return

        const newData = handleRealTimeCandleCex(last);


        const ema26Indicator = ema()
            .id(0)
            .options({windowSize: 26})
            .merge((d: any, c: any) => {
                d.ema26 = c;
            })
            .accessor((d: any) => d.ema26);

        const ema12Indicator = ema()
            .id(1)
            .options({windowSize: 12})
            .merge((d: any, c: any) => {
                d.ema12 = c;
            })
            .accessor((d: any) => d.ema12);

        const macdCalculatorIndicator = macd()
            .options({
                fast: 12,
                slow: 26,
                signal: 9,
            })
            .merge((d: any, c: any) => {
                d.macd = c;
            })
            .accessor((d: any) => d.macd);

        const smaVolume50Indicator = sma()
            .id(3)
            .options({
                windowSize: 50,
                sourcePath: "volume",
            })
            .merge((d: any, c: any) => {
                d.smaVolume50 = c;
            })
            .accessor((d: any) => d.smaVolume50);

        /* SERVER - START */
        const dataToCalculate = newData;
        const calculatedData = ema26Indicator(ema12Indicator(macdCalculatorIndicator(smaVolume50Indicator(dataToCalculate))));
        const indexCalculator = discontinuousTimeScaleProviderBuilder().initialIndex(Math.ceil(start1)).indexCalculator();
        const {index} = indexCalculator(calculatedData);
        /* SERVER - END */


        const xScaleProvider = discontinuousTimeScaleProviderBuilder()
            .withIndex(index);
        const {
            data: linearData,
        } = xScaleProvider(calculatedData);

        // const max = xAccessor(linearData[linearData.length - 1]);
        // const min = xAccessor(linearData[Math.max(0, linearData.length - LENGTH_TO_SHOW)]);
        //

        console.log('newRowsRef', newRowsRef)

        setXExtents([0, xExtents[1]])

        setEma26(() => ema26Indicator)
        setEma12(() => ema12Indicator)
        setMacdCalculator(() => macdCalculatorIndicator)
        setSmaVolume50(() => smaVolume50Indicator)
        setLinearData(linearData)
        setData(linearData)
        setXScale(() => xScale)
        setXAccessor(() => xAccessor)

        setDisplayXAccessor(() => displayXAccessor)
    }, [last]);

    const handleRealTimeCandleCex = (dataFeed:any) => {
        const newData = stateDataRef.current;
        const lastCandlestick = stateDataRef.current[stateDataRef.current.length - 1];
        const resolution = getResolution(timeFrame);

        let coeff = resolution * 60;
        let rounded = Math.floor((dataFeed.timestamp / 1000) / coeff) * coeff;
        let lastBarSec = lastCandlestick ? lastCandlestick.date.getTime() / 1000 : 0;
        let _lastBar;

        if (rounded > lastBarSec) {
            // _lastBar = dataFeed
            _lastBar = {
                date: new Date(rounded * 1000),
                open: dataFeed.ask,
                high: dataFeed.ask,
                low: dataFeed.ask,
                close: dataFeed.ask,
                volume: dataFeed.volume
            };
            newData.push(_lastBar)
            // setData([...stateDataRef.current, _lastBar]);
            // stateDataRef.current = [...stateDataRef.current, _lastBar];

        } else {
            lastCandlestick.high = dataFeed.ask > lastCandlestick.high ? dataFeed.ask : lastCandlestick.high;
            lastCandlestick.low = dataFeed.ask < lastCandlestick.low ? dataFeed.ask : lastCandlestick.low;
            lastCandlestick.volume += dataFeed.volume;
            lastCandlestick.close = dataFeed.ask;
            _lastBar = lastCandlestick;
            // _lastBar = dataFeed;
            newData[newData.length - 1] = _lastBar



            // setData([...stateDataRef.current.slice(0, -1), _lastBar]);
            // stateDataRef.current = [...stateDataRef.current.slice(0, -1), _lastBar];

        }
        return newData
    };

    const getResolution = (timeFrame: string) => {
        switch (timeFrame) {
            case "1M": return 1;
            case "5M": return 5;
            case "15M": return 15;
            case "30M": return 30;
            case "1H": return 60;
            case "D": return 1440; // 1 day in minutes === 1440
            case "W": return 10080;
            case "M": return 44640;
            default: return 1440;
        }
    };

    const handleDataLoadAfter = async (start: any, end: any) => {
        console.log("My Data After")
    };


    async function handleDownloadMore(start: any, end: any) {

        setStart1(start)
        if (Math.ceil(start) === end) return;

        const rowsToDownload = end - Math.ceil(start);
        console.log({rowsToDownload})
        if (rowsToDownload <= 1) return;

        if (Math.ceil(start) === end) return;

        setLoading(true)
        setFixedPosition(false)

        const prevData = data
        const endDate = new Date(data[0].date);
        let to = Math.floor(endDate.getTime() / 1000);

        const multipliers = {
            "1M": 60,
            "5M": 5 * 60,
            "15M": 15 * 60,
            "30M": 30 * 60,
            "45M": 45 * 60,
            "1H": 60 * 60,
            "2H": 2 * 60 * 60,
            "4H": 4 * 60 * 60,
            "D": 24 * 3600,
            "W": 7 * 24 * 3600,
            "M": 30 * 24 * 3600
        };


        const multiplier = multipliers[timeFrame];
        const from = Math.floor(endDate.getTime() / 1000) - (rowsToDownload * multiplier);

        let moreData = []

        try {
            let ticker = symbol.replace('_USD', '/USD').toLowerCase();
            console.log("fetchInitialDataFMP", ticker)
            moreData = await fetchCandleDataTwelveData(ticker, timeFrame, from, to);

            getEarnings();
            getDividends();
            // moreData = await fetchCandleDataFinnhub(symbol, timeFrame, from, Math.floor(endDate.getTime() / 1000));
        } catch (error) {
            console.error('Error fetching candle data:', error);
            setError(true)
            return
        }

        function calculateData(inputData: any) {
            /*return ema20(
                wma20(
                    tma20(
                        sma20(
                            ema50(
                                bb(
                                    smaVolume50(macdCalculator(ema12(ema26(elder(rsiCalculator(fullSTO(fi(defaultSar(atr14(inputData))))))))))
                                )
                            )
                        )
                    )
                )
            )*/

            // return macdCalculator(ema12(ema26(bb(initialData))))
            return macdCalculator(ema20(sma20(ema50(smaVolume50(ema12(ema26(bb(inputData))))))));

        }

        const calculatedData = ema26(ema12(macdCalculator(smaVolume50(moreData.slice(0, moreData.length - 1)))));
        const indexCalculator = discontinuousTimeScaleProviderBuilder()
            .initialIndex(Math.ceil(start))
            .indexCalculator();

        const {index} = indexCalculator(
            calculatedData
                .slice(-rowsToDownload)
                .concat(prevData));
        /* SERVER - END */
        const xScaleProvider = discontinuousTimeScaleProviderBuilder()
            .initialIndex(Math.ceil(start))
            .withIndex(index);

        const {
            data: linearData,
            xScale,
            xAccessor,
            displayXAccessor
        } = xScaleProvider(calculateData(calculatedData.slice(-rowsToDownload).concat(prevData)));

        setData(linearData)
        setLoading(false)
        stateDataRef.current = linearData
        setNewRowsRef(rowsToDownload)
        setXScale(() => xScale)
        setXAccessor(() => xAccessor)
        setDisplayXAccessor(() => displayXAccessor)
    }


    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState<{ mouseX: null | number; mouseY: null | number }>({
        mouseX: null,
        mouseY: null,
    });

    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [colorPickerAnchorEl, setColorPickerAnchorEl] = useState<HTMLDivElement | null>(null);

    const [selectedTrend, setSelectedTrend] = useState<any | null>(null);

    const onDrawCompleteChart = (e: React.MouseEvent, newTrends: any[], moreProps: any) => {
        console.log({newTrends});
        setEnableTrendLine(false);
        setTrends(newTrends);
        setMenuPosition({
            mouseX: e.clientX - 2,
            mouseY: e.clientY - 4,
        });
        setContextMenuVisible(true);
        setSelectedTrend(newTrends[newTrends.length - 1]);
    };

    const handleColorChange = (color: ColorResult) => {
        if (selectedTrend) {
            console.log({color})
            console.log({trends})
            console.log({selectedTrend})
            const updatedTrends = trends.map(trend =>
                trend.start === selectedTrend.start && trend.end === selectedTrend.end
                    ? {
                        ...trend,
                        appearance: {
                            ...trend.appearance,
                            // edgeFill: color.hex,
                            strokeStyle: color.hex
                        },
                    }
                    : trend
            );
            console.log({updatedTrends})
            setTrends(updatedTrends);
            setSelectedTrend({
                ...selectedTrend,
                appearance: {
                    ...selectedTrend.appearance,
                    edgeFill: color.hex,
                }
            });
        }
    };


    const handleClose = () => {
        setContextMenuVisible(false);
        setMenuPosition({mouseX: null, mouseY: null});
        setColorPickerVisible(false);
        setColorPickerAnchorEl(null);
    };

    const handleOpenColorPicker = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setColorPickerAnchorEl(event.currentTarget);
        setColorPickerVisible(true);
    };

    const handleCloseColorPicker = () => {
        setColorPickerVisible(false);
        setColorPickerAnchorEl(null);
    };

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [movingAveragePopanchorEl, setMovingAveragePopanchorEl] = useState<null | SVGRectElement>(null);
    const [submenuAnchorEl, setSubmenuAnchorEl] = useState<null | HTMLElement>(null);
    const [typeAnchorEl, setTypeAnchorEl] = useState<null | HTMLElement>(null);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSubmenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setSubmenuAnchorEl(event.currentTarget);
    };

    const handleTypeClick = (event: React.MouseEvent<HTMLElement>) => {
        setTypeAnchorEl(event.currentTarget);
    };

    const handleTypeClose = (value: string) => () => {
        console.log(`Selected Sub Option: ${value}`);
        if (selectedTrend) {
            const updatedTrends = trends.map(trend =>
                trend.start === selectedTrend.start && trend.end === selectedTrend.end
                    ? {
                        ...trend,
                        type: value,
                    }
                    : trend
            );
            setTrends(updatedTrends);
            setSelectedTrend({
                ...selectedTrend,
                type: value,
            });
        }
        setTypeAnchorEl(null);
    };

    const handleSubmenuClose = (value: number) => () => {
        console.log(`Selected Sub Option: ${value}`);
        if (selectedTrend) {
            const updatedTrends = trends.map(trend =>
                trend.start === selectedTrend.start && trend.end === selectedTrend.end
                    ? {
                        ...trend,
                        appearance: {
                            ...trend.appearance,
                            // edgeFill: color.hex,
                            strokeWidth: value
                        },
                    }
                    : trend
            );
            setTrends(updatedTrends);
            setSelectedTrend({
                ...selectedTrend,
                appearance: {
                    ...selectedTrend.appearance,
                    strokeWidth: value,
                }
            });
        }
        setSubmenuAnchorEl(null);
    };

    const onFibComplete = (event: any, retracements: any) => {
        console.log({retracements});
        setEnableFib(false)
        setRetracements(retracements)
    }

    const onDrawCompleteEquidistantChannel = (event: any, equidistantChannels: any) => {
        // this gets called on
        // 1. draw complete of trendline
        // @ts-ignore
        console.log({equidistantChannels});
        setEnableEquidistant(false);
        setEquidistantChannels(equidistantChannels)
    }

    const onDrawCompleteStandardDeviationChannel = (e: React.MouseEvent, newChannels: any, moreProps: any) => {

        setEnableStandardDeviationChannel(false);
        setStandardDeviationChannel(newChannels)
    }

    const GanFanOnDrawComplete = (e: React.MouseEvent, newfans: any[], moreProps: any) => {
        // this gets called on
        // 1. draw complete of drawing object
        // 2. drag complete of drawing object
        setEnableGanFan(false)
        setFans(newfans)
    }

    const hexToRgba = (hex: string, alpha: number) => {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;

        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    const colorsWithTransparency = [
        hexToRgba("#e41a1c", 0.3),
        hexToRgba("#377eb8", 0.3),
        hexToRgba("#4daf4a", 0.3),
        hexToRgba("#984ea3", 0.3),
        hexToRgba("#ff7f00", 0.3),
        hexToRgba("#ffff33", 0.3),
        hexToRgba("#a65628", 0.3),
        hexToRgba("#f781bf", 0.3)
    ];


    /*  const isStudiesChartInclude = (chart: StudiesChart): boolean => {
          return studiesCharts.includes(chart)
      }

      const isStudiesChartWithTooltipInclude = (chart: StudiesChart): boolean => {
          return studiesChartsWithTooltip.includes(chart)
      }*/

    const handleSelection = (interactives: any) => {
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

    const handler = (event: KeyboardEvent) => {
        const {key, ctrlKey} = event;
        if (key === 'Delete') {
            const newTrends = trends.filter(each => !each.selected)

            setTrends(newTrends)

            const newRetracements = retracements.filter(each => !each.selected)

            setRetracements(newRetracements)

            const newEquidistantChannel = equidistantChannels.filter(each => !each.selected)

            setEquidistantChannels(newEquidistantChannel)

            const newStandardDeviationChannel = standardDeviationChannel.filter(each => !each.selected)

            setStandardDeviationChannel(newStandardDeviationChannel)

            const newGanFan = fans.filter(each => !each.selected)

            setFans(newGanFan)
        } else if (ctrlKey && key === 's') {
            setOpenSaveDialog(true)
            event.preventDefault()
            event.stopPropagation()

        } else if (key === 'Escape') {
            // @ts-ignore
            canvasRef?.current?.cancelDrag()
            setEnableTrendLine(false)
            setEnableFib(false)
            setEnableEquidistant(false)
            setEnableStandardDeviationChannel(false)
            setEnableGanFan(false)
        }
    };


    useEventListener("keydown", handler);


    if (ema12 == undefined || ema26 == undefined || macdCalculator == undefined || smaVolume50 == undefined || xScale == undefined)
        return <></>

    // let calculatedData = calculateData(data)
    // function calculateData(data: any) {
    //     /*return ema20(
    //         wma20(
    //             tma20(
    //                 sma20(
    //                     ema50(
    //                         bb(
    //                             smaVolume50(macdCalculator(ema12(ema26(elder(rsiCalculator(fullSTO(fi(defaultSar(atr14(inputData))))))))))
    //                         )
    //                     )
    //                 )
    //             )
    //         )
    //     )*/
    //
    //     // return macdCalculator(ema12(ema26(bb(initialData))))
    //     return setMacdCalculator(ema20(sma20(ema50(bb(data)))));
    //
    // }

    // const elderRayOrigin = (_: number, h: number) => [0, h - getStudiesChartOrigin(StudiesChart.ELDER_RAY)];
    // const macdOrigin = (_: number, h: number) => [0, h - getStudiesChartOrigin(StudiesChart.MACD)];
    // const rsiAndAtrOrigin = (_: number, h: number) => [0, h - getStudiesChartOrigin(StudiesChart.RSI_AND_ATR)];
    // const forceIndexOrigin = (_: number, h: number) => [0, h - getStudiesChartOrigin(StudiesChart.FORCE_INDEX)];
    // const stochasticOscillatorOrigin = (_: number, h: number) => [0, h - getStudiesChartOrigin(StudiesChart.STOCHASTIC_OSCILLATOR)];
    // const barChartHeight = gridHeight / 4;
    // const chartHeight = gridHeight - studiesCharts.length * studyChartHeight(studiesCharts);
    const barChartOrigin = (_: number, h: number) => [0, (gridHeight - barChartHeight) - ((studiesCharts.length +
        (studiesCharts.includes(StudiesChart.STOCHASTIC_OSCILLATOR) ? 2 : 0) +
        (studiesCharts.includes(StudiesChart.FORCE_INDEX) ? 1 : 0) +
        (studiesCharts.includes(StudiesChart.RSI_AND_ATR) ? 1 : 0)
    )) * studyChartHeight(studiesCharts)];

    // const timeDisplayFormat = timeFormat(HourAndMinutesTimeFrames.includes(timeFrame) ? "%H %M" : dateTimeFormat);
    // const [openElderRayModal, setOpenElderRayModal] = useState<boolean>(false);

    /* const xAndYColors = {
         tickLabelFill: getDesignTokens(themeMode).palette.lineColor,
         tickStrokeStyle: getDesignTokens(themeMode).palette.lineColor,
         strokeStyle: getDesignTokens(themeMode).palette.lineColor,
         gridLinesStrokeStyle: getDesignTokens(themeMode).palette.grindLineColor,
     }*/

    const handleBrush1 = (brushCoords: any, moreProps: any) => {
        const {start, end} = brushCoords;
        const left = Math.min(start.xValue, end.xValue);
        const right = Math.max(start.xValue, end.xValue);

        const low = Math.min(start.yValue, end.yValue);
        const high = Math.max(start.yValue, end.yValue);

        // uncomment the line below to make the brush to zoom
        setXExtents([left, right])
        setYExtents1(BRUSH_TYPE === "2D" ? [low, high] : yExtents1)
        setEnableBrush(false)
        console.log(enableBrush)
        setXExtents([left, right])
        setYExtents1(BRUSH_TYPE === "2D" ? [low, high] : yExtents1)
        setEnableBrush(false)
    }

    const handleClickMovingAveragePop = (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
        setMovingAveragePopanchorEl(event.currentTarget);
    };

    const handleCloseMovingAveragePop = () => {
        setMovingAveragePopanchorEl(null);
    };

    const openMovingAveragePop = Boolean(movingAveragePopanchorEl);
    const movingAveragePopId = openMovingAveragePop ? 'simple-popover' : undefined;
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    // @ts-ignore

    return (
        <ChartCanvas
            ref={canvasRef}
            ratio={ratio} width={width} height={height}
            margin={margin}
            seriesName={`chart_${suffix}`}
            data={data}
            xScale={xScale}
            xAccessor={xAccessor}
            displayXAccessor={displayXAccessor}
            xExtents={xExtents}
            zoomAnchor={lastVisibleItemBasedZoomAnchor}
            useCrossHairStyleCursor={!disableCrossHair}
            onLoadBefore={handleDownloadMore}
        >

            /*##### Main Chart #####*/
            <Chart
                id={1}
                height={chartHeight}
                yExtents={candleChartExtents}
                // yExtents={[(d:any) => [d.high, d.low], sma20.accessor(), ema20.accessor(), ema50.accessor(), bb.accessor()]}
            >
                {/*<OHLCSeries strokeWidth={3}  stroke={d => elderImpulseCalculator.stroke()[d.elderImpulse]} yAccessor={(d) => ({ open: d.open, high: d.high, low: d.low, close: d.close })} />*/}
                {(isStudiesChartWithTooltipInclude(StudiesChart.ELDER_IMPULSE) || isStudiesChartInclude(StudiesChart.ELDER_RAY)) && (
                    <OHLCSeries strokeWidth={5} stroke={openCloseColor}/>
                )}
                <SingleValueTooltip
                    yAccessor={getLastPrice}
                    yLabel={selectedSymbol}
                    fontSize={18}
                    yDisplayFormat={format(".2f")}
                    valueFill={getlastPriceForColor()}
                    /* labelStroke="#4682B4" - optional prop */
                    origin={[TOOLTIP_PADDING_LEFT, 35]}/>
                <XAxis showGridLines {...xAndYColors} />
                <YAxis showGridLines tickFormat={pricesDisplayFormat} {...xAndYColors} />

                {(!isStudiesChartInclude(StudiesChart.ELDER_RAY) && !isStudiesChartWithTooltipInclude(StudiesChart.ELDER_IMPULSE)) && (
                    <SelectedSeries series={seriesType} data={data}/>
                )}


                {isStudiesChartWithTooltipInclude(StudiesChart.MOVING_AVERAGE) && (
                    <div>
                        <LineSeries yAccessor={ema26.accessor()} strokeStyle={ema26.stroke()}/>
                        <CurrentCoordinate yAccessor={ema26.accessor()} fillStyle={ema26.stroke()}/>
                        <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()}/>
                        <CurrentCoordinate yAccessor={ema12.accessor()} fillStyle={ema12.stroke()}/>
                    </div>
                )}

                {isStudiesChartWithTooltipInclude(StudiesChart.ELDER_IMPULSE) && (
                    <>
                        <div>
                            <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()}/>
                            <CurrentCoordinate yAccessor={ema12.accessor()} fillStyle={ema12.stroke()}/>
                        </div>
                        <MovingAverageTooltip
                            textFill={getDesignTokens(themeMode).palette.text.primary}
                            onClick={handleClickMovingAveragePop}
                            // onClick={() => setOpenMovingAverageModal(true)}
                            origin={getStudiesChartTooltipOrigin(StudiesChart.ELDER_IMPULSE)}
                            options={[
                                {
                                    yAccessor: ema12.accessor(),
                                    type: "EMA",
                                    stroke: ema12.stroke(),
                                    windowSize: ema12.options().windowSize,
                                },
                            ]}
                        />
                    </>
                )}

                <MouseCoordinateX at="bottom" orient="bottom"
                                  displayFormat={timeFrame == TimeFrame.M1 ? timeFormat("%H-%M-%S") : timeFrame == TimeFrame.D ? timeFormat("%Y-%m-%d") : timeFormat("%Y-%m-%d")}/>
                <MouseCoordinateY rectWidth={margin.right} displayFormat={pricesDisplayFormat} arrowWidth={10}/>
                <EdgeIndicator
                    itemType="last"
                    arrowWidth={10}
                    rectWidth={margin.right}
                    fill={openCloseColor}
                    lineStroke={openCloseColor}
                    displayFormat={pricesDisplayFormat}
                    yAccessor={yEdgeIndicator}
                    fullWidth={true}
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

                {isStudiesChartWithTooltipInclude(StudiesChart.MOVING_AVERAGE) && (
                    <MovingAverageTooltip
                        textFill={getDesignTokens(themeMode).palette.text.primary}
                        onClick={handleClickMovingAveragePop}
                        // onClick={() => setOpenMovingAverageModal(true)}
                        origin={getStudiesChartTooltipOrigin(StudiesChart.MOVING_AVERAGE)}
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
                )}

                <Popover
                    id={movingAveragePopId}
                    open={openMovingAveragePop}
                    anchorEl={movingAveragePopanchorEl}
                    onClose={handleCloseMovingAveragePop}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <ClickAwayListener onClickAway={handleCloseMovingAveragePop}>
                        <Box sx={{
                            bgcolor: getDesignTokens(themeMode).palette.chartBackground,
                            boxShadow: 24,
                            p: 2,
                            textAlign: 'center'
                        }}>
                            <Typography variant="h6" component="h2" sx={{marginBottom: 2, fontSize: '1rem'}}>
                                changing
                            </Typography>
                            <Button
                                variant="contained"
                                color='error'
                                size='small'
                                title='disable MovingAverage'
                                onClick={() => {
                                    setStudiesChartsWithTooltip(studiesChartsWithTooltip.filter(item => item !== StudiesChart.MOVING_AVERAGE));
                                    handleCloseMovingAveragePop();
                                }}
                                sx={{textTransform: 'none'}}
                            >
                                Disable MovingAverage
                            </Button>
                        </Box>
                    </ClickAwayListener>
                </Popover>
                {/*<Modal
                    open={openMovingAverageModal}
                    onClose={() => setOpenMovingAverageModal(false)}
                    sx={{maxHeight: '95%'}}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4
                    }}>
                        <Typography id="modal-modal-title" variant="h6" component="h2">
                            changing
                        </Typography>
                        <Button color='error' title='disable MovingAverage' onClick={() => {
                            setStudiesChartsWithTooltip(studiesChartsWithTooltip.filter(item => item !== StudiesChart.MOVING_AVERAGE))
                            setOpenMovingAverageModal(false)
                        }}> disable MovingAverage </Button>
                    </Box>
                </Modal>
*/}
                <ZoomButtons onReset={handleReset}/>
                <OHLCTooltip origin={[8, 16]} textFill={getDesignTokens(themeMode).palette.text.primary}/>
                {/*<ClickCallback
                    onMouseMove={ (moreProps, e) => { console.log("onMouseMove", moreProps, e); } }
                    onMouseDown={ (moreProps, e) => { console.log("onMouseDown", moreProps, e); } }
                    onClick={ (moreProps, e) => { console.log("onClick", moreProps, e); } }
                    onDoubleClick={ (moreProps, e) => { console.log("onDoubleClick", moreProps, e); } }
                    onContextMenu={ (moreProps, e) => { console.log("onContextMenu", moreProps, e); } }
                    onPan={ (moreProps, e) => { console.log("onPan", moreProps, e); } }
                    onPanEnd={ (moreProps, e) => { console.log("onPanEnd", moreProps, e); } }
                />*/}
                {isStudiesChartWithTooltipInclude(StudiesChart.BOLLINGER_BAND) && (
                    <>
                        <MovingAverageTooltip
                            textFill={getDesignTokens(themeMode).palette.text.primary}
                            onClick={e => console.log(e)}
                            origin={getStudiesChartTooltipOrigin(StudiesChart.BOLLINGER_BAND)}
                            options={[
                                {
                                    yAccessor: sma20.accessor(),
                                    type: sma20.type(),
                                    stroke: sma20.stroke(),
                                    windowSize: sma20.options().windowSize,
                                },
                                {
                                    yAccessor: ema20.accessor(),
                                    type: ema20.type(),
                                    stroke: ema20.stroke(),
                                    windowSize: ema20.options().windowSize,
                                },
                                {
                                    yAccessor: ema50.accessor(),
                                    type: ema50.type(),
                                    stroke: ema50.stroke(),
                                    windowSize: ema50.options().windowSize,
                                },
                            ]}
                        />
                        <BollingerBandTooltip
                            // @ts-ignore
                            origin={getStudiesChartTooltipOrigin(StudiesChart.BOLLINGER_BAND, 200, 55)}
                            yAccessor={d => d.bb}
                            options={bb.options()}
                            textFill={getDesignTokens(themeMode).palette.text.primary}/>

                        <LineSeries yAccessor={sma20.accessor()} strokeStyle={sma20.stroke()}/>
                        <LineSeries yAccessor={ema20.accessor()} strokeStyle={ema20.stroke()}/>
                        <LineSeries yAccessor={ema50.accessor()} strokeStyle={ema50.stroke()}/>
                        <CurrentCoordinate yAccessor={sma20.accessor()} fillStyle={sma20.stroke()}/>
                        <CurrentCoordinate yAccessor={ema20.accessor()} fillStyle={ema20.stroke()}/>
                        <CurrentCoordinate yAccessor={ema50.accessor()} fillStyle={ema50.stroke()}/>

                        <BollingerSeries yAccessor={d => d.bb}
                                         strokeStyle={bbStroke}
                                         fillStyle={bbFill}/>
                    </>
                )}

                /*##### Interactive #####*/
                <div onContextMenu={handleContextMenu}>
                    <TrendLine
                        // ref={saveInteractiveNodes("Trendline", 1)}
                        enabled={enableTrendLine}
                        type="LINE"
                        snap={false}
                        snapTo={d => [d.high, d.low]}
                        onStart={() => console.log("START", trends)}
                        onComplete={onDrawCompleteChart}
                        appearance={{
                            strokeStyle: getDesignTokens(themeMode).palette.lineColor,
                            strokeWidth: 1,
                            strokeDasharray: "Solid",
                            edgeStrokeWidth: 1,
                            edgeFill: getDesignTokens(themeMode).palette.lineColor,
                            edgeStroke: getDesignTokens(themeMode).palette.edgeStroke,
                        }}
                        // onComplete={() => console.log("End", trends)}
                        trends={trends}
                    />
                    <Menu
                        keepMounted
                        open={contextMenuVisible}
                        onClose={handleClose}
                        anchorReference="anchorPosition"
                        anchorPosition={
                            menuPosition.mouseY !== null && menuPosition.mouseX !== null
                                ? {top: menuPosition.mouseY, left: menuPosition.mouseX}
                                : undefined
                        }
                    >
                        <ListItem button onClick={handleOpenColorPicker}>
                            <ListItemIcon>
                                <BorderColor fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText onClick={handleOpenColorPicker}>Change Color</ListItemText>
                        </ListItem>
                        <ListItem button onClick={handleSubmenuClick}>
                            <ListItemIcon>
                                <EditIcon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText>StrokeWidth</ListItemText>
                        </ListItem>
                        <ListItem button onClick={handleTypeClick}>
                            <ListItemIcon>
                                <HorizontalRuleRoundedIcon fontSize="small"/>
                            </ListItemIcon>
                            <ListItemText>Type</ListItemText>
                        </ListItem>
                        <Menu
                            anchorEl={typeAnchorEl}
                            open={Boolean(typeAnchorEl)}
                            onClose={handleTypeClose}
                        >
                            <MenuItem>
                                <ListItemIcon onClick={handleTypeClose("XLINE")}>
                                    <HorizontalRuleRoundedIcon fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText onClick={handleTypeClose("XLINE")}>XLINE</ListItemText>
                            </MenuItem>
                            <MenuItem>
                                <ListItemIcon onClick={handleTypeClose("RAY")}>
                                    <HorizontalRuleRoundedIcon fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText onClick={handleTypeClose("RAY")}>RAY</ListItemText>
                            </MenuItem>
                            <MenuItem>
                                <ListItemIcon onClick={handleTypeClose("LINE")}>
                                    <HorizontalRuleRoundedIcon fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText onClick={handleTypeClose("LINE")}>LINE</ListItemText>
                            </MenuItem>
                        </Menu>
                        <Menu
                            anchorEl={submenuAnchorEl}
                            open={Boolean(submenuAnchorEl)}
                            onClose={handleSubmenuClose}
                        >
                            <MenuItem>
                                <ListItemIcon onClick={handleSubmenuClose(1)}>
                                    <EditIcon fontSize="small"/>
                                </ListItemIcon>
                                <ListItemText onClick={handleSubmenuClose(1)}>1</ListItemText>
                            </MenuItem>
                            <MenuItem>
                                <ListItemIcon onClick={handleSubmenuClose(3)}>
                                    <EditIcon fontSize="medium"/>
                                </ListItemIcon>
                                <ListItemText onClick={handleSubmenuClose(3)}>3</ListItemText>
                            </MenuItem>
                            <MenuItem>
                                <ListItemIcon onClick={handleSubmenuClose(5)}>
                                    <EditIcon fontSize="large"/>
                                </ListItemIcon>
                                <ListItemText onClick={handleSubmenuClose(5)}>5</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Menu>


                    <Popover
                        open={colorPickerVisible}
                        anchorEl={colorPickerAnchorEl}
                        onClose={handleCloseColorPicker}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                    >
                        <SketchPicker
                            color={selectedTrend?.appearance?.edgeFill || '#000'}
                            onChangeComplete={handleColorChange}
                        />
                    </Popover>
                </div>
                <FibonacciRetracement
                    // ref={saveInteractiveNodes("FibonacciRetracement", 1)}
                    enabled={enableFib}
                    retracements={retracements}
                    onComplete={onFibComplete}
                    appearance={{
                        strokeStyle: getDesignTokens(themeMode).palette.lineColor,
                        strokeWidth: 1,
                        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
                        fontSize: 11,
                        fontFill: getDesignTokens(themeMode).palette.text.primary,
                        edgeStroke: getDesignTokens(themeMode).palette.edgeStroke,
                        edgeFill: getDesignTokens(themeMode).palette.lineColor,
                        nsEdgeFill: getDesignTokens(themeMode).palette.edgeStroke,
                        edgeStrokeWidth: 1,
                        r: 5,
                    }}
                />

                <EquidistantChannel
                    // ref={this.saveInteractiveNodes("EquidistantChannel", 1)}
                    onSelect={onDrawCompleteEquidistantChannel}
                    enabled={enableEquidistant}
                    onStart={() => console.log("START")}
                    onComplete={onDrawCompleteEquidistantChannel}
                    channels={equidistantChannels}
                    appearance={{
                        stroke: getDesignTokens(themeMode).palette.lineColor,
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        fill: "rgba(112, 176, 217, 0.4)",
                        fillOpacity: 0.1,
                        edgeStroke: getDesignTokens(themeMode).palette.edgeStroke,
                        edgeFill: getDesignTokens(themeMode).palette.lineColor,
                        edgeFill2: getDesignTokens(themeMode).palette.lineColor,
                        edgeStrokeWidth: 1,
                        r: 5,
                    }}
                />

                <StandardDeviationChannel
                    // ref={this.saveInteractiveNodes("StandardDeviationChannel", 1)}
                    enabled={enableStandardDeviationChannel}
                    onSelect={onDrawCompleteStandardDeviationChannel}
                    onStart={() => console.log("START")}
                    onComplete={onDrawCompleteStandardDeviationChannel}
                    channels={standardDeviationChannel}
                    appearance={{
                        stroke: getDesignTokens(themeMode).palette.lineColor,
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        fill: "rgba(112, 176, 217, 0.4)",
                        fillOpacity: 0.1,
                        edgeStroke: getDesignTokens(themeMode).palette.edgeStroke,
                        edgeFill: getDesignTokens(themeMode).palette.lineColor,
                        edgeStrokeWidth: 1,
                        r: 5,
                    }}
                ></StandardDeviationChannel>

                <GannFan
                    // ref={this.saveInteractiveNodes("GannFan", 1)}
                    enabled={enableGanFan}
                    onStart={() => console.log("START")}
                    onComplete={GanFanOnDrawComplete}
                    fans={fans}
                    appearance={{
                        stroke: "#000000",
                        fillOpacity: 1,
                        strokeOpacity: 1,
                        strokeWidth: 1,
                        edgeStroke: "#000000",
                        edgeFill: "#FFFFFF",
                        edgeStrokeWidth: 1,
                        r: 5,
                        fill: colorsWithTransparency,
                        fontFamily: "-apple-system, system-ui, Roboto, 'Helvetica Neue', Ubuntu, sans-serif",
                        fontSize: 12,
                        fontFill: getDesignTokens(themeMode).palette.edgeStroke,
                    }}
                />
                <Brush
                    // ref={this.saveInteractiveNode(1)}
                    interactiveState={handleBrush1}
                    enabled={enableBrush}
                    fillStyle="rgba(112, 176, 217, 0.4)"
                    type={BRUSH_TYPE}
                    onBrush={handleBrush1}/>

                <InteractiveText
                    onChoosePosition={(e: React.MouseEvent, newText: any, moreProps: any) => {
                        onDrawComplete(newText, moreProps)
                    }}
                    // ref={saveNodeType("text")}
                    enabled={enableInteractiveObject}
                    onDragComplete={(e: React.MouseEvent, newText: any, moreProps: any) => {
                        onDrawComplete(newText, moreProps)
                    }}
                    textList={text}
                />

                {!disableHoverTooltip && (
                    <HoverTooltip
                        yAccessor={ema12.accessor()}
                        tooltip={{
                            content: ({currentItem, xAccessor}) => ({
                                x: dateFormat(xAccessor(currentItem)),
                                y: [
                                    {
                                        label: "open",
                                        value: currentItem.open && pricesDisplayFormat(currentItem.open),
                                    },
                                    {
                                        label: "high",
                                        value: currentItem.high && pricesDisplayFormat(currentItem.high),
                                    },
                                    {
                                        label: "low",
                                        value: currentItem.low && pricesDisplayFormat(currentItem.low),
                                    },
                                    {
                                        label: "close",
                                        value: currentItem.close && pricesDisplayFormat(currentItem.close),
                                    },
                                ],
                            }),
                        }}
                    />
                )}


                {isStudiesChartWithTooltipInclude(StudiesChart.SAR) && (
                    <>
                        <SARSeries yAccessor={d => d.sar} highlightOnHover/>
                        <MovingAverageTooltip
                            textFill={getDesignTokens(themeMode).palette.text.primary}
                            onClick={() => setOpenMovingAverageModal(true)}
                            origin={getStudiesChartTooltipOrigin(StudiesChart.SAR, 2)}
                            options={[
                                {
                                    yAccessor: (d) => d.sar,
                                    type: `SAR (${accelerationFactor}, ${maxAccelerationFactor})`,
                                    stroke: '',
                                    windowSize: 0,
                                },
                            ]}
                        />
                    </>
                )}

                // Earnings
                <>
                    {earnings.length!= 0 ? earnings.map((ea, idx) => (
                        <Annotate
                            key={idx}
                            with={SvgPathAnnotation}
                            when={(d: any) => {
                                const dataDate = dateFormat(new Date(d.date));
                                const earningsDate = dateFormat(new Date(ea.date));
                                return dataDate === earningsDate;
                            }}
                            usingProps={{
                                onClick: () => handleEarningsClick(ea),
                                y: ({ yScale } : any) => yScale.range()[0],
                                fill: ea.eps >= ea.epsEstimated ? "green" : "red",
                                tooltip: `EPS: ${ea.eps}, Revenue: ${ea.revenue}`,
                                path: () => `M20.25,2.75H3.75a1,1,0,0,0-1,1v16.5a1,1,0,0,0,1,1h16.5a1,1,0,0,0,1-1V3.75A1,1,0,0,0,20.25,2.75Z M8.625,18.75H15.375 M8.625,5.25H15.375 M8.625,12H13.025 M8.625,5.25V18.75`,
                                pathWidth: 20,
                                pathHeight: 22,
                                tooltipContent: () => ({
                                    x: 10,
                                    y: 10,
                                    children: [
                                        <text key={1}>EPS: ${ea.eps}</text>,
                                        <text key={2}>Revenue: ${ea.revenue}</text>,
                                        <text key={3}>Date: ${ea.date}</text>
                                    ]
                                })
                            }}
                        />
                    )) : []}
                </>

                // Dividends
                <>
                    {dividends.length!= 0 ? dividends.map((dv, idx) => (
                        <Annotate
                            key={idx}
                            with={SvgPathAnnotation}
                            when={(d: any) => {
                                const dataDate = dateFormat(new Date(d.date));
                                const dividendsDate = dateFormat(new Date(dv.date));
                                return dataDate === dividendsDate;
                            }}
                            usingProps={{
                                onClick: () => handleDividendsClick(dv),
                                y: ({ yScale } : any) => yScale.range()[0],
                                fill: dv.dividend >= 0 ? "green" : "red",
                                tooltip: `Dividend: ${dv.dividend}, Date: ${dv.date}`,
                                path: () => `M20.25,2.75H3.75a1,1,0,0,0-1,1v16.5a1,1,0,0,0,1,1h16.5a1,1,0,0,0,1-1V3.75A1,1,0,0,0,20.25,2.75Z M7.5,18.75v-13.5h2.285A6.74,6.74,0,0,1,16.5,12h0A6.74,6.74,0,0,1,9.775,18.75Z`,
                                pathWidth: 20,
                                pathHeight: 22,
                                tooltipContent: () => ({
                                    x: 10,
                                    y: 10,
                                    children: [
                                        <text key={1}>EPS: ${dv.dividend}</text>,
                                        <text key={2}>Date: ${dv.date}</text>
                                    ]
                                })
                            }}
                        />
                    )) : []}
                </>

                <Dialog
                    open={openEaDialog}
                    onClose={() => setOpenEaDialog(false)}
                    scroll="paper"
                    aria-labelledby="scroll-dialog-title"
                    aria-describedby="scroll-dialog-description"
                >
                    <Box
                        sx={{
                            height: '5px',
                            width: '100%',
                            backgroundColor: eaDialogContent.eps >= eaDialogContent.epsEstimated ? "green" : "red",
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}
                    />
                    <DialogTitle id="scroll-dialog-title">Earnings Details</DialogTitle>
                    <DialogContent dividers>
                        <Typography gutterBottom>
                            EPS: ${eaDialogContent.eps}
                        </Typography>
                        <Typography gutterBottom>
                            Revenue: ${eaDialogContent.revenue}
                        </Typography>
                        <Typography gutterBottom>
                            Date: {eaDialogContent.date}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEaDialog(false)} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={openDvDialog}
                    onClose={() => setOpenDvDialog(false)}
                    scroll="paper"
                    aria-labelledby="scroll-dialog-title"
                    aria-describedby="scroll-dialog-description"
                >
                    <Box
                        sx={{
                            height: '5px',
                            width: '100%',
                            // @ts-ignore
                            backgroundColor: dvDialogContent.dividend >= 0 ? "green" : "red",
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}
                    />
                    <DialogTitle id="scroll-dialog-title">Dividends Details</DialogTitle>
                    <DialogContent dividers>
                        <Typography gutterBottom>
                            Dividends: ${dvDialogContent.dividend}
                        </Typography>
                        <Typography gutterBottom>
                            Date: {dvDialogContent.date}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDvDialog(false)} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </Chart>

            /*##### Volume Chart #####*/
            {!disableVolume && (
                <Chart
                    id={2}
                    height={barChartHeight}
                    origin={barChartOrigin}
                    yExtents={barChartExtents}
                    // yExtents={[d => d.volume, smaVolume50.accessor()]}
                >
                    <BarSeries fillStyle={volumeColor} yAccessor={d => d.volume}/>
                    {/*<AreaSeries yAccessor={smaVolume50.accessor()} {...volumeAppearance} />*/}
                </Chart>
            )}



            /*##### ElderRay Chart #####*/
            {isStudiesChartInclude(StudiesChart.ELDER_RAY) &&

                // <ElderRayStudiesChart
                //     yExtents={[0, elder.accessor()]}
                //     displayFormat={timeDisplayFormat}
                //     margin={margin}
                //     pricesDisplayFormat={pricesDisplayFormat}
                //     elderAccessor={elder.accessor()}
                //     origin={elderRayOrigin}
                // />

                (
                    <Chart id={3} height={studyChartHeight(studiesCharts)} yExtents={[0, elder.accessor()]}
                           origin={(w, h) => getStudiesChartOrigin(w, h, StudiesChart.ELDER_RAY)}
                           padding={{top: 8, bottom: 8}}>
                        {/*<XAxis showGridLines gridLinesStrokeStyle="#e0e3eb" {...xAndYColors}/>*/}
                        <XAxis showGridLines {...xAndYColors}/>
                        <YAxis ticks={4} tickFormat={pricesDisplayFormat} {...xAndYColors}/>

                        <MouseCoordinateX displayFormat={timeDisplayFormat}/>
                        <MouseCoordinateY rectWidth={margin.right} displayFormat={pricesDisplayFormat}/>
                        <MouseCoordinateY
                            at="right"
                            orient="right"
                            displayFormat={pricesDisplayFormat}
                            {...mouseEdgeAppearance}/>
                        <ElderRaySeries yAccessor={elder.accessor()}/>
                        <SingleValueTooltip
                            // origin={[10,50]}
                            valueFill={getDesignTokens(themeMode).palette.text.primary}
                            className='elderChart'
                            xInitDisplay='200px'
                            onClick={() => setOpenElderRayModal(true)}
                            yAccessor={elder.accessor()}
                            yLabel="Elder Ray"
                            yDisplayFormat={(d: any) =>
                                `${pricesDisplayFormat(d.bullPower)}, ${pricesDisplayFormat(d.bearPower)}`
                            }
                            origin={[TOOLTIP_PADDING_LEFT, 30]}
                        />

                        <Modal
                            open={openElderRayModal}
                            onClose={() => setOpenElderRayModal(false)}
                            sx={{maxHeight: '95%'}}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: 400,
                                bgcolor: 'background.paper',
                                boxShadow: 24,
                                p: 4
                            }}>
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    changing
                                </Typography>
                                <Button color='error' title='disable ElderRay' onClick={() => {
                                    setStudiesCharts(studiesCharts.filter(item => item !== StudiesChart.ELDER_RAY))
                                    setOpenElderRayModal(false)
                                }}> disable ElderRay </Button>
                            </Box>
                        </Modal>
                    </Chart>
                )
            }


            /*##### MACD Chart #####*/
            {isStudiesChartInclude(StudiesChart.MACD) && (
                <Chart id={4} height={studyChartHeight(studiesCharts)}
                       yExtents={macdCalculator.accessor()}
                       origin={(w, h) => getStudiesChartOrigin(w, h, StudiesChart.MACD)}
                       padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.MACD)}/>
                    <YAxis axisAt="right" orient="right" {...xAndYColors} ticks={2}/>

                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}
                        rectRadius={5}
                        {...mouseEdgeAppearance}
                    />
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={pricesDisplayFormat}
                        {...mouseEdgeAppearance}
                    />

                    <MACDSeries yAccessor={d => d.macd} {...macdAppearance} />
                    <MACDTooltip
                        origin={[TOOLTIP_PADDING_LEFT, 30]}
                        yAccessor={d => d.macd}
                        options={macdCalculator.options()}
                        appearance={macdAppearance}
                    />
                </Chart>
            )}


            /*##### RSI_AND_ATR Chart #####*/
            {isStudiesChartInclude(StudiesChart.RSI_AND_ATR) && (
                <Chart id={5}
                       yExtents={rsiCalculator.accessor()}
                       height={studyChartHeight(studiesCharts)}
                       origin={(w, h) => getStudiesChartOrigin(w, h - studyChartHeight(studiesCharts), StudiesChart.RSI_AND_ATR)}
                       padding={{top: 10, bottom: 10}}

                >
                    <XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.RSI_AND_ATR)}/>
                    <YAxis axisAt="right"
                           orient="right"
                           {...xAndYColors}
                           tickValues={[30, 50, 70]}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}/>

                    <RSISeries yAccessor={d => d.rsi}/>

                    <RSITooltip origin={[TOOLTIP_PADDING_LEFT, 15]}
                                textFill={getDesignTokens(themeMode).palette.text.primary}
                                yAccessor={d => d.rsi}
                                options={rsiCalculator.options()}/>
                </Chart>
            )}
            {isStudiesChartInclude(StudiesChart.RSI_AND_ATR) && (
                <Chart id={6}
                       yExtents={atr14.accessor()}
                       height={studyChartHeight(studiesCharts)}
                       origin={(w, h) => getStudiesChartOrigin(w, h, StudiesChart.RSI_AND_ATR)}
                       padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.RSI_AND_ATR)}/>
                    <YAxis axisAt="right" orient="right" {...xAndYColors} ticks={2}/>

                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}/>

                    <LineSeries yAccessor={atr14.accessor()} strokeStyle={atr14.stroke()}/>
                    <SingleValueTooltip
                        valueFill={getDesignTokens(themeMode).palette.text.primary}
                        yAccessor={atr14.accessor()}
                        yLabel={`ATR (${atr14.options().windowSize})`}
                        yDisplayFormat={format(".2f")}
                        /* valueStroke={atr14.stroke()} - optional prop */
                        /* labelStroke="#4682B4" - optional prop */
                        origin={[TOOLTIP_PADDING_LEFT, 15]}/>
                </Chart>
            )}


            /*##### FORCE_INDEX Chart #####*/
            {isStudiesChartInclude(StudiesChart.FORCE_INDEX) && (
                <Chart id={7} height={studyChartHeight(studiesCharts)}
                       yExtents={fi.accessor()}
                       origin={(w, h) => getStudiesChartOrigin(w, h - studyChartHeight(studiesCharts), StudiesChart.FORCE_INDEX)}
                       padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.FORCE_INDEX)}/>
                    <YAxis axisAt="right" orient="right" ticks={4} tickFormat={format(".2s")} {...xAndYColors}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".4s")}/>

                    <AreaSeries baseAt={(scale) => scale(0)} yAccessor={fi.accessor()}/>
                    <StraightLine yValue={0}/>

                    <SingleValueTooltip
                        yAccessor={fi.accessor()}
                        valueFill={getDesignTokens(themeMode).palette.text.primary}
                        yLabel="ForceIndex (1)"
                        yDisplayFormat={format(".4s")}
                        origin={[TOOLTIP_PADDING_LEFT, 15]}
                    />
                </Chart>
            )}
            {isStudiesChartInclude(StudiesChart.FORCE_INDEX) && (
                <Chart id={8} height={studyChartHeight(studiesCharts)}
                       yExtents={fiEMA13.accessor()}
                       origin={(w, h) => getStudiesChartOrigin(w, h, StudiesChart.FORCE_INDEX)}
                       padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.FORCE_INDEX)}/>
                    <YAxis axisAt="right" orient="right" ticks={4} tickFormat={format(".2s")} {...xAndYColors}/>

                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".4s")}/>

                    {/* <AreaSeries baseAt={scale => scale(0)} yAccessor={fiEMA13.accessor()} /> */}
                    <AlternatingFillAreaSeries
                        baseAt={0}
                        yAccessor={fiEMA13.accessor()}
                    />
                    <StraightLine yValue={0}/>

                    <SingleValueTooltip
                        yAccessor={fiEMA13.accessor()}
                        valueFill={getDesignTokens(themeMode).palette.text.primary}
                        yLabel={`ForceIndex (${fiEMA13.options().windowSize})`}
                        yDisplayFormat={format(".4s")}
                        origin={[TOOLTIP_PADDING_LEFT, 15]}
                    />
                </Chart>
            )}


            /*##### FORCE_INDEX Chart #####*/
            {isStudiesChartInclude(StudiesChart.STOCHASTIC_OSCILLATOR) && (
                <Chart id={9}
                       yExtents={[0, 100]}
                       height={studyChartHeight(studiesCharts)}
                       origin={(w, h) => getStudiesChartOrigin(w, h - (studyChartHeight(studiesCharts) * 2), StudiesChart.STOCHASTIC_OSCILLATOR)}
                       padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.STOCHASTIC_OSCILLATOR)}/>
                    <YAxis axisAt="right" orient="right"
                           {...xAndYColors}
                           tickValues={[20, 50, 80]}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}/>

                    <StochasticSeries
                        yAccessor={d => d.fastSTO}
                        {...stoAppearance} />
                    <StochasticTooltip
                        origin={[TOOLTIP_PADDING_LEFT, 30]}
                        yAccessor={d => d.slowSTO}
                        options={slowSTO.options()}
                        appearance={stoAppearance}
                        label="Slow STO"/>

                </Chart>
            )}
            {isStudiesChartInclude(StudiesChart.STOCHASTIC_OSCILLATOR) && (
                <Chart id={10}
                       yExtents={[0, 100]}
                       height={studyChartHeight(studiesCharts)}
                       origin={(w, h) => getStudiesChartOrigin(w, h - studyChartHeight(studiesCharts), StudiesChart.STOCHASTIC_OSCILLATOR)}
                       padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.STOCHASTIC_OSCILLATOR)}/>
                    <YAxis axisAt="right" orient="right"
                           {...xAndYColors}
                           tickValues={[20, 50, 80]}/>

                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}/>

                    <StochasticSeries
                        yAccessor={d => d.slowSTO}
                        {...stoAppearance} />

                    <StochasticTooltip
                        origin={[TOOLTIP_PADDING_LEFT, 30]}
                        yAccessor={d => d.fastSTO}
                        options={fastSTO.options()}
                        appearance={stoAppearance}
                        label="Fast STO"/>
                </Chart>
            )}
            {isStudiesChartInclude(StudiesChart.STOCHASTIC_OSCILLATOR) && (
                <Chart id={11}
                       yExtents={[0, 100]}
                       height={studyChartHeight(studiesCharts)}
                       origin={(w, h) => getStudiesChartOrigin(w, h, StudiesChart.STOCHASTIC_OSCILLATOR)}
                       padding={{top: 10, bottom: 10}}
                >
                    <XAxis axisAt="bottom" orient="bottom" {...xGrid} {...xAndYColors}
                           showTickLabel={showTickLabel(StudiesChart.STOCHASTIC_OSCILLATOR)}/>
                    <YAxis axisAt="right" orient="right"
                           {...xAndYColors}
                           tickValues={[20, 50, 80]}/>

                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat("%Y-%m-%d")}/>
                    <MouseCoordinateY
                        at="right"
                        orient="right"
                        displayFormat={format(".2f")}/>
                    <StochasticSeries
                        yAccessor={d => d.fullSTO}
                        {...stoAppearance} />

                    <StochasticTooltip
                        origin={[TOOLTIP_PADDING_LEFT, 30]}
                        yAccessor={d => d.fullSTO}
                        options={fullSTO.options()}
                        appearance={stoAppearance}
                        label="Full STO"/>
                </Chart>
            )}

            {!disableCrossHair && (
                <CrossHairCursor/>
            )}
            {/* {rsi.active && (
                <Chart
                    id={4}
                    yExtents={[0, 100]}
                    height={rsi.height}
                    origin={(w, h) => [
                        0,
                        h - rsi.height - (atr.active ? atr.height : 0) - (forceIndex.active ? forceIndex.height : 0)
                    ]}
                    padding={{ top: 10, bottom: 10 }}
                >
                    <XAxis
                        axisAt="bottom"
                        orient="bottom"
                        showTicks={!atr.active && !forceIndex.active}
                        {...xGrid}
                        {...axisAppearance}
                        outerTickSize={0}
                    />

                    <YAxis axisAt="right" orient="right" tickValues={[30, 50, 70]} {...yGrid} {...axisAppearance} />

                    {!atr.active &&
                    !forceIndex.active && (
                        <MouseCoordinateX
                            at="bottom"
                            orient="bottom"
                            displayFormat={timeFormat('%Y-%m-%d')}
                            {...mouseEdgeAppearance}
                        />
                    )}
                    <MouseCoordinateY at="right" orient="right" displayFormat={format('.2f')} {...mouseEdgeAppearance} />

                    <RSISeries yAccessor={d => d.rsi} />

                    <RSITooltip origin={[-28, 15]} yAccessor={d => d.rsi} options={rsiCalculator.options()} />
                </Chart>
            )}*/}
            {/*            {atr.active && (
                <Chart
                    id={5}
                    yExtents={atr14.accessor()}
                    height={atr.height}
                    origin={(w, h) => [0, h - atr.height - (forceIndex.active ? forceIndex.height : 0)]}
                    padding={{ top: 10, bottom: 10 }}
                >
                    <XAxis
                        axisAt="bottom"
                        orient="bottom"
                        {...xGrid}
                        {...axisAppearance}
                        outerTickSize={0}
                        showTicks={!forceIndex.active}
                    />
                    <YAxis axisAt="right" orient="right" {...yGrid} {...axisAppearance} ticks={2} />

                    {!forceIndex.active && (
                        <MouseCoordinateX
                            at="bottom"
                            orient="bottom"
                            displayFormat={timeFormat('%Y-%m-%d')}
                            {...mouseEdgeAppearance}
                        />
                    )}
                    <MouseCoordinateY at="right" orient="right" displayFormat={format('.2f')} {...mouseEdgeAppearance} />

                    <LineSeries yAccessor={atr14.accessor()} {...atrAppearance} />
                    <SingleValueTooltip
                        yAccessor={atr14.accessor()}
                        yLabel={`ATR (${atr14.options().windowSize})`}
                        yDisplayFormat={format('.2f')}
                        origin={[-40, 15]}
                    />
                </Chart>
            )}*/}

            {/* {forceIndex.active && (
                <Chart
                    id={6}
                    height={150}
                    yExtents={fi.accessor()}
                    origin={(w, h) => [0, h - 150]}
                    padding={{ top: 30, right: 0, bottom: 10, left: 0 }}
                >
                    <XAxis axisAt="bottom" orient="bottom" {...xGrid} {...axisAppearance} outerTickSize={0} />
                    <YAxis
                        axisAt="right"
                        orient="right"
                        {...yGrid}
                        ticks={4}
                        tickFormat={format('.2s')}
                        {...axisAppearance}
                    />
                    <MouseCoordinateX
                        at="bottom"
                        orient="bottom"
                        displayFormat={timeFormat('%Y-%m-%d')}
                        {...mouseEdgeAppearance}
                    />
                    <MouseCoordinateY at="right" orient="right" displayFormat={format('.4s')} {...mouseEdgeAppearance} />

                    <AreaSeries baseAt={scale => scale(0)} yAccessor={fi.accessor()} />
                    <StraightLine yValue={0} />

                    <SingleValueTooltip
                        yAccessor={fi.accessor()}
                        yLabel="ForceIndex (1)"
                        yDisplayFormat={format('.4s')}
                        origin={[-40, 15]}
                    />
                </Chart>
            )}
*/}
            {/*<Chart id={1} height={400}*/}
            {/*       // yExtents={[(d: any) => [d.high, d.low], ema26.accessor(), ema12.accessor()]}*/}
            {/*       yExtents={[(d: any) => [d.high, d.low], ema26.accessor(), ema12.accessor()]}*/}
            {/*       padding={{ top: 10, bottom: 20 }}>*/}
            {/*    <XAxis axisAt="bottom" orient="bottom" showTicks={false} outerTickSize={0} />*/}
            {/*    <YAxis axisAt="right" orient="right" ticks={5} />*/}

            {/*    <MouseCoordinateY*/}
            {/*        at="right"*/}
            {/*        orient="right"*/}
            {/*        displayFormat={format(".2f")} />*/}

            {/*    /!*<CandlestickSeries />*!/*/}
            {/*    <LineSeries yAccessor={ema26.accessor()} strokeStyle={ema26.stroke()}/>*/}
            {/*    <LineSeries yAccessor={ema12.accessor()} strokeStyle={ema12.stroke()}/>*/}

            {/*    <CurrentCoordinate yAccessor={ema26.accessor()} fillStyle={ema26.stroke()} />*/}
            {/*    <CurrentCoordinate yAccessor={ema12.accessor()} fillStyle={ema12.stroke()} />*/}

            {/*    <EdgeIndicator itemType="last" orient="right" edgeAt="right"*/}
            {/*                   yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>*/}

            {/*    <OHLCTooltip origin={[-40, 0]}/>*/}
            {/*    <MovingAverageTooltip*/}
            {/*        onClick={(e) => console.log(e)}*/}
            {/*        origin={[-38, 15]}*/}
            {/*        options={[*/}
            {/*            {*/}
            {/*                yAccessor: ema26.accessor(),*/}
            {/*                type: ema26.type(),*/}
            {/*                stroke: ema26.stroke(),*/}
            {/*                ...ema26.options(),*/}
            {/*            },*/}
            {/*            {*/}
            {/*                yAccessor: ema12.accessor(),*/}
            {/*                type: ema12.type(),*/}
            {/*                stroke: ema12.stroke(),*/}
            {/*                ...ema12.options(),*/}
            {/*            },*/}
            {/*        ]}*/}
            {/*    />*/}
            {/*</Chart>*/}
            {/*<Chart id={2} height={150}*/}
            {/*       yExtents={[(d: any) => d.volume, smaVolume50.accessor()]}*/}
            {/*       origin={(w, h) => [0, h - 300]}>*/}
            {/*    <YAxis axisAt="left" orient="left" ticks={5} tickFormat={format(".2s")}/>*/}

            {/*    <MouseCoordinateY*/}
            {/*        at="left"*/}
            {/*        orient="left"*/}
            {/*        displayFormat={format(".4s")} />*/}

            {/*    <BarSeries yAccessor={d => d.volume} fillStyle={(d: any) => d.close > d.open ? "#6BA583" : "#FF0000"} />*/}
            {/*    <AreaSeries yAccessor={smaVolume50.accessor()} strokeStyle={smaVolume50.stroke()} fillStyle={smaVolume50.fill()}/>*/}
            {/*</Chart>*/}
            {/*<Chart id={3} height={150}*/}
            {/*       yExtents={macdCalculator.accessor()}*/}
            {/*       origin={(w, h) => [0, h - 150]} padding={{ top: 10, bottom: 10 }} >*/}
            {/*    <XAxis axisAt="bottom" orient="bottom"/>*/}
            {/*    <YAxis axisAt="right" orient="right" ticks={2} />*/}

            {/*    <MouseCoordinateX*/}
            {/*        at="bottom"*/}
            {/*        orient="bottom"*/}
            {/*        displayFormat={timeFormat("%Y-%m-%d")} />*/}
            {/*    <MouseCoordinateY*/}
            {/*        at="right"*/}
            {/*        orient="right"*/}
            {/*        displayFormat={format(".2f")} />*/}

            {/*    <MACDSeries yAccessor={d => d.macd}*/}
            {/*                {...macdAppearance} />*/}
            {/*    <MACDTooltip*/}
            {/*        origin={[-38, 15]}*/}
            {/*        yAccessor={d => d.macd}*/}
            {/*        options={macdCalculator.options()}*/}
            {/*        appearance={macdAppearance}*/}
            {/*    />*/}
            {/*</Chart>*/}
            {/*<CrossHairCursor />*/}
        </ChartCanvas>
    );
}

