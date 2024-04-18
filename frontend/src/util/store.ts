import {create} from 'zustand';
import {TimeFrame, Series} from "../type/Enum";
import {useState} from "react";
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

    selectedSymbol : SymbolType
    setSelectedSymbol : (symbolType: SymbolType) => void

    isDisableMovingAverage : boolean
    setIsDisableMovingAverage : (isDisableMovingAverage: boolean) => void

    // selectedSymbol : string
    // setSelectedSymbol : (symbolType: string) => void
};


const useStore = create<Store>((set) => ({
    timeFrame: TimeFrame.D,
    setTimeFrame: (duration: TimeFrame) => set((state) => ({ timeFrame: duration })),

    symbol: 'AAPL',
    setSymbol: (symbol: string) => set((state) => ({ symbol: symbol })),

    loadingMoreData: false,
    setLoadingMoreData: (loadingMoreData: boolean) => set((state) => ({ loadingMoreData: loadingMoreData })),

    seriesType: Series.CANDLE,
    setSeriesType: (seriesType: Series) => set((state) => ({ seriesType: seriesType })),

    selectedSymbol: {
        description: '',
        displaySymbol: '',
        symbol: '',
        type: ''
    },
    setSelectedSymbol: (selectedSymbol: SymbolType) => set((state) => ({ selectedSymbol: selectedSymbol })),

    isDisableMovingAverage : true,
    setIsDisableMovingAverage : (isDisableMovingAverage: boolean) => set((state) => ({isDisableMovingAverage:isDisableMovingAverage}))

}));

export default useStore;
