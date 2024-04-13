import {
    AlternatingFillAreaSeries,
    CandlestickSeries,
    OHLCSeries,
    AreaSeries, LineSeries,
} from "react-financial-charts";
import {Series} from "../type/Enum";
import * as React from "react";

const SelectedSeries = (props: {series: Series, data: any[]}) => {
    let selectedSeries: JSX.Element;

    switch (props.series) {

        case Series.CANDLE:
            selectedSeries = <CandlestickSeries />
            break;


        case Series.BAR:
            selectedSeries =
                <OHLCSeries
                    stroke={(d: any) => (d.close > d.open ? "#26a69a" : "#ef5350")}
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
                    baseAt={props.data.length > 0 ? props.data.map(item => item.close).reduce((a, b) => a + b) / props.data.length : 0}
                />
            break

        default: selectedSeries = <></>
    }

    return selectedSeries
}

export default SelectedSeries;
