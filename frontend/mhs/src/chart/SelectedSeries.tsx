import {
    AlternatingFillAreaSeries,
    CandlestickSeries,
    OHLCSeries,
    AreaSeries,
    BarSeries,
    LineSeries,
    MACDSeries,
    ScatterSeries,
    RSISeries,
    CircleMarker,
    StraightLine

} from "react-financial-charts";
import {Series} from "../type/Enum";
import * as React from "react";

const SelectedSeries = (props: {series: Series, data: any[]}) => {
    let selectedSeries: JSX.Element;

    switch (props.series) {

        case Series.CANDLE:
            selectedSeries = <CandlestickSeries
                fill={(d: any) => (d.close > d.open ? "#8cc176" : "#b82c0c")}
                wickStroke={(d: any) => (d.close > d.open ? "#8cc176" : "#b82c0c")}
                // stroke={d => d.close > d.open ? "#6BA583" : "#DB0000"}
            />
            break;


        case Series.BAR:
            selectedSeries =
                <OHLCSeries
                    stroke={(d: any) => (d.close > d.open ? "#8cc176" : "#b82c0c")}
                />
            break;


        case Series.LINE:
            selectedSeries =
                <LineSeries
                    yAccessor={d => d.close}
                />
            break


        case Series.AREA:
            selectedSeries =
                <AreaSeries
                    yAccessor={d => d.close}
                />
            break


        case Series.BASE_LINE:
            selectedSeries =
                <AlternatingFillAreaSeries
                    yAccessor={d => d.close}
                    fillStyle={{ top: 'rgba(140,193,118,0.44)', bottom: 'rgba(184,44,12,0.45)' }}
                    baseAt={props.data.length > 0 ? props.data.map(item => item.close).reduce((a, b) => a + b) / props.data.length : 0}
                />
            break

        default: selectedSeries = <></>
    }

    return selectedSeries
}

export default SelectedSeries;
