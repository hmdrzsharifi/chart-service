import { create } from 'zustand';

type Store = {
    durationData: 'd' | '1m' | 'SECONDS'
    themeMode: 'dark' | 'light';
    setThemeMode: (mode: 'dark' | 'light') => void
    setDurationData: (duration: 'd' | '1m' | 'SECONDS') => void
    symbol: 'BTC-USD.CC' | 'ttr'
    setSymbol: (symbol: 'BTC-USD.CC' | 'ttr') => void
};

const useStore = create<Store>((set) => ({
    themeMode: 'light',
    setThemeMode: (mode: 'dark' | 'light') => set((state) => ({ themeMode: mode })),
    durationData: 'd',
    setDurationData: (duration: 'd' | '1m' | 'SECONDS') => set((state) => ({ durationData: duration })),
    symbol: 'BTC-USD.CC',
    setSymbol: (symbol: 'BTC-USD.CC' | 'ttr') => set((state) => ({ symbol: symbol })),
}));

export default useStore;
