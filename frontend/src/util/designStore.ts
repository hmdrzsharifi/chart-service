import { create } from 'zustand';

type DesignStore = {
    openSideBar: boolean
    setOpenSideBar: (openSideBar: boolean) => void

    themeMode: 'dark' | 'light';
    setThemeMode: (mode: 'dark' | 'light') => void

    enableTrendLine: boolean
    setEnableTrendLine: (enableTrendLine: boolean) => void

    enableFib: boolean
    setEnableFib: (enableFib: boolean) => void

    themeSecondaryColor: string
    setThemeSecondaryColor: (color: string) => void
};

const useDesignStore = create<DesignStore>((set) => ({
    openSideBar: false,
    setOpenSideBar: (openSideBar: boolean) => set((state) => ({ openSideBar: openSideBar })),

    themeMode: 'light',
    setThemeMode: (mode: 'dark' | 'light') => set((state) => ({ themeMode: mode })),

    enableTrendLine: false,
    setEnableTrendLine: (enableTrendLine: boolean) => set((state) => ({ enableTrendLine: enableTrendLine })),

    enableFib: false,
    setEnableFib: (enableFib: boolean) => set((state) => ({ enableFib: enableFib })),

    themeSecondaryColor: '#000',
    setThemeSecondaryColor: (color: string) => set((state) => ({ themeSecondaryColor: color })),

}));

export default useDesignStore;
