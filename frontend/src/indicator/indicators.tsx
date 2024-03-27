import {
    ema,
    atr,
    sma,
    tma,
    wma,
    bollingerBand,
    rsi,
    sar,
    macd,
    forceIndex,
    stochasticOscillator
} from "react-financial-charts";


export const accelerationFactor = 0.02;
export const maxAccelerationFactor = 0.2;

export const ema12 = ema()
    .id(0)
    .options({windowSize: 12})
    .merge((d: any, c: any) => {
        d.ema12 = c;
    })
    .accessor((d: any) => d.ema12);

export const ema26 = ema()
    .id(1)
    .options({windowSize: 26})
    .merge((d: any, c: any) => {
        d.ema26 = c;
    })
    .accessor((d: any) => d.ema26);

export const ema20 = ema()
    .options({ windowSize: 20 })
    .merge((d: any, c: any) => {
        d.ema20 = c;
    }) // Required, if not provided, log a error
    .accessor((d: any) => d.ema20) // Required, if not provided, log an error during calculation
    .stroke('blue'); // Optional

export const atr14 = atr()
    .options({ windowSize: 14 })
    .merge((d: any, c: any) => {
        d.atr14 = c;
    })
    .accessor((d: any) => d.atr14);

export const sma20 = sma()
    .options({ windowSize: 20 })
    .merge((d: any, c: any) => {
        d.ema20 = c;
    })
    .accessor((d: any) => d.ema20);

export const tma20 = tma()
    .options({ windowSize: 20 })
    .merge((d: any, c: any) => {
        d.tma20 = c;
    })
    .accessor((d: any) => d.tma20);

export const wma20 = wma()
    .options({ windowSize: 20 })
    .merge((d: any, c: any) => {
        d.wma20 = c;
    })
    .accessor((d: any) => d.wma20);

export const ema50 = ema()
    .options({ windowSize: 50 })
    .merge((d: any, c: any) => {
        d.ema50 = c;
    })
    .accessor((d: any) => d.ema50);

export const smaVolume50 = sma()
    .options({ windowSize: 20, sourcePath: 'volume' })
    .merge((d: any, c: any) => {
        d.smaVolume50 = c;
    })
    .accessor((d: any) => d.smaVolume50)
    .stroke('#4682B4')
    .fill('#4682B4');

export const bb = bollingerBand()
    .merge((d: any, c: any) => {
        d.bb = c;
    })
    .accessor((d: any) => d.bb);

export const defaultSar = sar()
    .options({
        accelerationFactor,
        maxAccelerationFactor,
    })
    .merge((d: any, c: any) => {
        d.sar = c;
    })
    .accessor((d: any) => d.sar);

export const macdCalculator = macd()
    .options({
        fast: 12,
        slow: 26,
        signal: 9,
    })
    .merge((d: any, c: any) => {
        d.macd = c;
    })
    .accessor((d: any) => d.macd);

export const rsiCalculator = rsi()
    .options({ windowSize: 14 })
    .merge((d: any, c: any) => {
        d.rsi = c;
    })
    .accessor((d: any) => d.rsi);

export const slowSTO = stochasticOscillator()
    .options({ windowSize: 14, kWindowSize: 3, dWindowSize: 3 })
    .merge((d: any, c: any) => {
        d.slowSTO = c;
    })
    .accessor((d: any) => d.slowSTO);

export const fastSTO = stochasticOscillator()
    .options({ windowSize: 14, kWindowSize: 1, dWindowSize: 3 })
    .merge((d: any, c: any) => {
        d.fastSTO = c;
    })
    .accessor((d: any) => d.fastSTO);

export const fullSTO = stochasticOscillator()
    .options({ windowSize: 14, kWindowSize: 3, dWindowSize: 4 })
    .merge((d: any, c: any) => {
        d.fullSTO = c;
    })
    .accessor((d: any) => d.fullSTO);

export const fi = forceIndex()
    .merge((d: any, c: any) => {
        d.fi = c;
    })
    .accessor((d: any) => d.fi);

export const fiEMA13 = ema()
    .id(1)
    .options({ windowSize: 13, sourcePath: 'fi' })
    .merge((d: any, c: any) => {
        d.fiEMA13 = c;
    })
    .accessor((d: any) => d.fiEMA13);
//
/*
export const vwap24 = custom_indicator_calculator() // Disable when not hourly candles
    .options({ windowSize: 10 }) //number of points considered
    .stroke("#FFFF00") // line color
    .merge((d: any, c: any) => {
    d.vwap = c;
})
    .accessor((d: any) => d.vwap)*/
