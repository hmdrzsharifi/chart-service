import {create} from 'zustand';
import {TimeFrame, Series, StudiesChart} from "../type/Enum";
import {SymbolType} from "../type/SymbolType";
import {useState} from "react";
import {TrendLineType} from "../type/TrendLineType";

type Store = {

    trends:TrendLineType[]
    setTrends: (trends:TrendLineType[]) => void

    retracements: any[]
    setRetracements:(retracements:any[]) => void

    equidistantChannels:any[]
    setEquidistantChannels:(equidistantChannels:any[]) => void

    standardDeviationChannel:any[],
    setStandardDeviationChannel:(standardDeviationChannel:any[]) => void

    fans:any[]
    setFans:(fans:any[]) => void

    xExtents:any,
    setXExtents:(xExtents:any) => void

    timeFrame: TimeFrame
    setTimeFrame: (duration: TimeFrame) => void

    symbol: string
    setSymbol: (symbol: string) => void

    symbolCategory: string,
    setSymbolCategory: (symbolCategory: string) => void


    loadingMoreData: boolean
    setLoadingMoreData: (loadingMoreData: boolean) => void

    seriesType: Series
    setSeriesType: (series: Series) => void

    selectedSymbol : string
    setSelectedSymbol : (symbolType: string) => void

    disableVolume : boolean
    setDisableVolume : (disableVolume: boolean) => void

    studiesCharts : StudiesChart[]
    setStudiesCharts : (charts: StudiesChart[]) => void

    studiesChartsWithTooltip : StudiesChart[]
    setStudiesChartsWithTooltip : (charts: StudiesChart[]) => void

    disableHoverTooltip : boolean
    setDisableHoverTooltip : (disableHoverTooltip: boolean) => void

    disableCrossHair : boolean
    setDisableCrossHair : (disableCrossHair: boolean) => void

    error: boolean,
    setError:(error: boolean) => void

    fixedPosition: boolean,
    setFixedPosition:(fixedPosition: boolean) => void

    chartDimensions: {width: number, height: number},
    setChartDimensions:(dimensions: {width: number, height: number}) => void

    saveMenuOpen:boolean,
    setSaveMenuOpen:(saveMenuOpen: boolean) => void;

    openSaveDialog:boolean,
    setOpenSaveDialog:(openSaveDialog: boolean) => void;


    suffix:number,
    setSuffix:(suffix: number) => void;


    // disableOHLCSeries:boolean
    // setDisableOHLCSeries : (disableOHLCSeries: boolean) => void
    // selectedSymbol : string
    // setSelectedSymbol : (symbolType: string) => void
};


const useStore = create<Store>((set) => ({

    trends:[],
    setTrends:(trends: TrendLineType[]) => set((state) => ({trends:trends})),

    retracements: [],
    setRetracements:(retracements: any[]) => set((state) => ({retracements:retracements})),

    equidistantChannels:[],
    setEquidistantChannels:(equidistantChannels: any[]) => set((state) => ({equidistantChannels:equidistantChannels})),

    standardDeviationChannel:[],
    setStandardDeviationChannel:(standardDeviationChannel: any[]) => set((state) => ({standardDeviationChannel:standardDeviationChannel})),

    fans:[] ,
    setFans:(fans: any[]) => set((state) => ({fans:fans})),

    xExtents:[0 , 0],
    setXExtents:(xExtents: any) => set((state) => ({xExtents:xExtents})),

    timeFrame: TimeFrame.D,
    setTimeFrame: (duration: TimeFrame) => set((state) => ({ timeFrame: duration })),

    // symbol: 'BINANCE:BTCUSDT', // for finnhub
    symbol: 'BTC_USD', // for fmp
    setSymbol: (symbol: string) => set((state) => ({ symbol: symbol })),

    symbolCategory: 'CRT',
    setSymbolCategory: (symbolCategory: string) => set((state) => ({ symbolCategory: symbolCategory })),

    loadingMoreData: false,
    setLoadingMoreData: (loadingMoreData: boolean) => set((state) => ({ loadingMoreData: loadingMoreData })),

    seriesType: Series.CANDLE,
    setSeriesType: (seriesType: Series) => set((state) => ({ seriesType: seriesType })),

    selectedSymbol: 'BTC_USD',
    setSelectedSymbol: (selectedSymbol: string) => set((state) => ({ selectedSymbol: selectedSymbol })),

    disableVolume : true,
    setDisableVolume : (disableVolume: boolean) => set((state) => ({disableVolume:disableVolume})),

    studiesCharts : [],
    setStudiesCharts : (charts: StudiesChart[]) => set((state) => ({studiesCharts: charts})),

    studiesChartsWithTooltip : [],
    setStudiesChartsWithTooltip : (charts: StudiesChart[]) => set((state) => ({studiesChartsWithTooltip: charts})),

    disableHoverTooltip : true,
    setDisableHoverTooltip : (disableHoverTooltip: boolean) => set((state) => ({disableHoverTooltip:disableHoverTooltip})),

    disableCrossHair : true,
    setDisableCrossHair : (disableCrossHair: boolean) => set((state) => ({disableCrossHair:disableCrossHair})),

    error: false,
    setError: (error: boolean) => set((state) => ({error:error})),

    fixedPosition: false,
    setFixedPosition: (fixedPosition: boolean) => set((state) => ({fixedPosition:fixedPosition})),

    chartDimensions: {width:0, height:0},
    setChartDimensions: (dimensions: {width: number, height: number}) => set((state) => ({chartDimensions:dimensions})),

    saveMenuOpen:false,
    setSaveMenuOpen:(saveMenuOpen: boolean) => set((state) => ({saveMenuOpen:saveMenuOpen})),

    openSaveDialog:false,
    setOpenSaveDialog:(openSaveDialog: boolean) => set((state) => ({openSaveDialog:openSaveDialog})),

    suffix: 1,
    setSuffix:(suffix: number) => set((state) => ({suffix:suffix})),


    // disableOHLCSeries : true,
    // setDisableOHLCSeries : (disableOHLCSeries: boolean) => set((state) => ({disableOHLCSeries:disableOHLCSeries}))
}));

export default useStore;
