export enum TimeFrame {
    D = 'D',
    M1 = '1M',
    M5 = '5M',
    M15 = '15M',
    M30 = '30M',
    H = '1H',
    W = 'W',
    M = 'M',
}

export const TimeFrames = [
    TimeFrame.D,
    TimeFrame.M1,
    TimeFrame.M5,
    TimeFrame.M15,
    TimeFrame.M30,
    TimeFrame.H,
    TimeFrame.W,
    TimeFrame.M
];

export const HourAndMinutesTimeFrames = [
    TimeFrame.M1,
    TimeFrame.M5,
    TimeFrame.M15,
    TimeFrame.M30,
    TimeFrame.H,
];

export enum Series {
    CANDLE = 'Candle',
    BAR = 'Bar',
    LINE = 'Line',
    AREA = 'Area',
    BASE_LINE = 'BaseLine',
}

export const SeriesValues: Series[] = [
    Series.CANDLE,
    Series.BAR,
    Series.LINE,
    Series.BASE_LINE,
    Series.AREA,
]

export enum StudiesChart {
    MOVING_AVERAGE = 'MovingAverage',
    SAR = 'sar',
    ELDER_IMPULSE = 'elderImpulse',
    ELDER_RAY = 'ElderRay',
    MACD = 'Macd',
    RSI_AND_ATR = 'RSIAndATR',
    FORCE_INDEX = 'ForceIndex',
    STOCHASTIC_OSCILLATOR = 'stochasticOscillator',
    BOLLINGER_BAND = 'BollingerBand',
}

export const StudiesChartsValues: StudiesChart[] = [
    StudiesChart.MOVING_AVERAGE,
    StudiesChart.SAR,
    StudiesChart.ELDER_IMPULSE,
    StudiesChart.ELDER_RAY,
    StudiesChart.MACD,
    StudiesChart.RSI_AND_ATR,
    StudiesChart.FORCE_INDEX,
    StudiesChart.STOCHASTIC_OSCILLATOR,
    StudiesChart.BOLLINGER_BAND,
]
