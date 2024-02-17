import { create } from 'zustand';

type Store = {
    durationData: 'DAILY' | 'MINUTES' | 'SECONDS'
    themeMode: 'dark' | 'light';
    setThemeMode: (mode: 'dark' | 'light') => void
    setDurationData: (duration: 'DAILY' | 'MINUTES' | 'SECONDS') => void
    symbol: 'btc' | 'ttr'
    setSymbol: (duration: 'btc' | 'ttr') => void
};

const useStore = create<Store>((set) => ({
    themeMode: 'light',
    setThemeMode: (mode: 'dark' | 'light') => set((state) => ({ themeMode: mode })),
    durationData: 'DAILY',
    setDurationData: (duration: 'DAILY' | 'MINUTES' | 'SECONDS') => set((state) => ({ durationData: duration })),
    symbol: 'btc',
    setSymbol: (symbol: 'btc' | 'ttr') => set((state) => ({ symbol: symbol })),
}));

export default useStore;
