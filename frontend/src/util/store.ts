import {create} from 'zustand';
import {TimeFrame, Series} from "../type/Enum";

type Store = {
    timeFrame: TimeFrame
    setTimeFrame: (duration: TimeFrame) => void

    symbol: string
    setSymbol: (symbol: string) => void

    loadingMoreData: boolean
    setLoadingMoreData: (loadingMoreData: boolean) => void

    seriesType: Series
    setSeriesType: (series: Series) => void
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
}));

export default useStore;
