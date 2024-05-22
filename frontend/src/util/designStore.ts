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

    enableEquidistant: boolean
    setEnableEquidistant: (enableEquidistant: boolean) => void

    enableStandardDeviationChannel: boolean
    setEnableStandardDeviationChannel: (enableStandardDeviationChannel: boolean) => void

    enableBrush: boolean
    setEnableBrush: (enableBrush: boolean) => void

    enableInteractiveObject: boolean
    setEnableInteractiveObject: (enableInteractiveObject: boolean) => void

    themeSecondaryColor: string
    setThemeSecondaryColor: (color: string) => void
};

const useDesignStore = create<DesignStore>((set) => ({
    openSideBar: false,
    setOpenSideBar: (openSideBar: boolean) => set((state) => ({ openSideBar: openSideBar })),

    themeMode: 'dark',
    setThemeMode: (mode: 'dark' | 'light') => set((state) => ({ themeMode: mode })),

    enableTrendLine: false,
    setEnableTrendLine: (enableTrendLine: boolean) => set((state) => ({ enableTrendLine: enableTrendLine })),

    enableFib: false,
    setEnableFib: (enableFib: boolean) => set((state) => ({ enableFib: enableFib })),

    enableEquidistant: false,
    setEnableEquidistant: (enableEquidistant: boolean) => set((state) => ({ enableEquidistant: enableEquidistant })),

    enableBrush: false,
    setEnableBrush: (enableBrush: boolean) => set((state) => ({ enableBrush: enableBrush })),

    enableInteractiveObject: false,
    setEnableInteractiveObject: (enableInteractiveObject: boolean) => set((state) => ({ enableInteractiveObject: enableInteractiveObject })),

    themeSecondaryColor: '#000',
    setThemeSecondaryColor: (color: string) => set((state) => ({ themeSecondaryColor: color })),

    enableStandardDeviationChannel : false ,
    setEnableStandardDeviationChannel:  (enableStandardDeviationChannel: boolean) => set((state) => ({ enableStandardDeviationChannel: enableStandardDeviationChannel })),


}));

export default useDesignStore;
