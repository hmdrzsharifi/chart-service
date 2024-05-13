import {create} from 'zustand';
import {TimeFrame, Series} from "../type/Enum";
import {SymbolType} from "../type/SymbolType";

type Store = {
    timeFrame: TimeFrame
    setTimeFrame: (duration: TimeFrame) => void

    symbol: string
    setSymbol: (symbol: string) => void

    loadingMoreData: boolean
    setLoadingMoreData: (loadingMoreData: boolean) => void

    seriesType: Series
    setSeriesType: (series: Series) => void

    selectedSymbol : string
    setSelectedSymbol : (symbolType: string) => void

    disableMovingAverage : boolean
    setDisableMovingAverage : (isDisableMovingAverage: boolean) => void

    disableVolume : boolean
    setDisableVolume : (disableVolume: boolean) => void

    disableElderRay : boolean
    setDisableElderRay : (isDisableMovingAverage: boolean) => void

    disableMACD : boolean
    setDisableMACD : (isDisableMACD: boolean) => void

    disableHoverTooltip : boolean
    setDisableHoverTooltip : (disableHoverTooltip: boolean) => void

    disableCrossHair : boolean
    setDisableCrossHair : (disableCrossHair: boolean) => void

    disableSAR : boolean
    setDisableSAR : (disableSAR: boolean) => void

    disableRSIAndATR: boolean
    setDisableRSIAndATR : (disableRSIAndATR: boolean) => void

    disableForceIndex: boolean
    setDisableForceIndex : (disableForceIndex: boolean) => void

    disableStochasticOscillator: boolean
    setDisableStochasticOscillator : (disableStochasticOscillator: boolean) => void
    // selectedSymbol : string
    // setSelectedSymbol : (symbolType: string) => void
};


const useStore = create<Store>((set) => ({
    timeFrame: TimeFrame.D,
    setTimeFrame: (duration: TimeFrame) => set((state) => ({ timeFrame: duration })),

    symbol: 'BINANCE:BTCUSDT',
    setSymbol: (symbol: string) => set((state) => ({ symbol: symbol })),

    loadingMoreData: false,
    setLoadingMoreData: (loadingMoreData: boolean) => set((state) => ({ loadingMoreData: loadingMoreData })),

    seriesType: Series.CANDLE,
    setSeriesType: (seriesType: Series) => set((state) => ({ seriesType: seriesType })),

    selectedSymbol: 'BTC_USD',
    setSelectedSymbol: (selectedSymbol: string) => set((state) => ({ selectedSymbol: selectedSymbol })),

    disableMovingAverage : true,
    setDisableMovingAverage : (disableMovingAverage: boolean) => set((state) => ({disableMovingAverage:disableMovingAverage})),

    disableVolume : true,
    setDisableVolume : (disableVolume: boolean) => set((state) => ({disableVolume:disableVolume})),

    disableElderRay : true,
    setDisableElderRay : (disableElderRay: boolean) => set((state) => ({disableElderRay:disableElderRay})),

    disableMACD : true,
    setDisableMACD : (disableMACD: boolean) => set((state) => ({disableMACD:disableMACD})),

    disableHoverTooltip : true,
    setDisableHoverTooltip : (disableHoverTooltip: boolean) => set((state) => ({disableHoverTooltip:disableHoverTooltip})),

    disableCrossHair : true,
    setDisableCrossHair : (disableCrossHair: boolean) => set((state) => ({disableCrossHair:disableCrossHair})),

    disableSAR : true,
    setDisableSAR : (disableSAR: boolean) => set((state) => ({disableSAR:disableSAR})),

    disableRSIAndATR : true,
    setDisableRSIAndATR : (disableRSIAndATR: boolean) => set((state) => ({disableRSIAndATR:disableRSIAndATR})),

    disableForceIndex : true,
    setDisableForceIndex : (disableForceIndex: boolean) => set((state) => ({disableForceIndex:disableForceIndex})),

    disableStochasticOscillator : true,
    setDisableStochasticOscillator : (disableStochasticOscillator: boolean) => set((state) => ({disableStochasticOscillator:disableStochasticOscillator}))
}));

export default useStore;
