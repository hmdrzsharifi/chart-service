import { create } from 'zustand';

type Store = {
    timeFrame: 'D' | '1' | '5'
    themeMode: 'dark' | 'light';
    setThemeMode: (mode: 'dark' | 'light') => void
    setTimeFrame: (duration: 'D' | '1' | '5') => void
    symbol: string
    setSymbol: (symbol: string) => void
    enableTrendLine: boolean
    setEnableTrendLine: (enableTrendLine: boolean) => void
    enableFib: boolean
    setEnableFib: (enableFib: boolean) => void

    loadingMoreData: boolean
    setLoadingMoreData: (loadingMoreData: boolean) => void

};

const useStore = create<Store>((set) => ({
    themeMode: 'light',
    setThemeMode: (mode: 'dark' | 'light') => set((state) => ({ themeMode: mode })),
    timeFrame: 'D',
    setTimeFrame: (duration: 'D' | '1' | '5') => set((state) => ({ timeFrame: duration })),
    symbol: 'AAPL',
    setSymbol: (symbol: string) => set((state) => ({ symbol: symbol })),
    enableTrendLine: false,
    setEnableTrendLine: (enableTrendLine: boolean) => set((state) => ({ enableTrendLine: enableTrendLine })),
    enableFib: false,
    setEnableFib: (enableFib: boolean) => set((state) => ({ enableFib: enableFib })),

    loadingMoreData: false,
    setLoadingMoreData: (loadingMoreData: boolean) => set((state) => ({ loadingMoreData: loadingMoreData }))
}));

export default useStore;
