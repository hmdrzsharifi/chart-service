import { create } from 'zustand';

type Store = {
    durationData: 'd' | '1m' | 'SECONDS'
    themeMode: 'dark' | 'light';
    setThemeMode: (mode: 'dark' | 'light') => void
    setDurationData: (duration: 'd' | '1m' | 'SECONDS') => void
    symbol: string
    setSymbol: (symbol: string) => void
    enableTrendLine: boolean
    setEnableTrendLine: (enableTrendLine: boolean) => void
    enableFib: boolean
    setEnableFib: (enableFib: boolean) => void
};

const useStore = create<Store>((set) => ({
    themeMode: 'light',
    setThemeMode: (mode: 'dark' | 'light') => set((state) => ({ themeMode: mode })),
    durationData: 'd',
    setDurationData: (duration: 'd' | '1m' | 'SECONDS') => set((state) => ({ durationData: duration })),
    symbol: 'BTC-USD.CC',
    setSymbol: (symbol: string) => set((state) => ({ symbol: symbol })),
    enableTrendLine: false,
    setEnableTrendLine: (enableTrendLine: boolean) => set((state) => ({ enableTrendLine: enableTrendLine })),
    enableFib: false,
    setEnableFib: (enableFib: boolean) => set((state) => ({ enableFib: enableFib }))
}));

export default useStore;
