import {Line} from "react-chartjs-2";
import Box from "@mui/material/Box";
import * as React from "react";
import {useContext} from "react";
import {Theme} from "@mui/material";
import {useTheme} from "@mui/material/styles";

export interface LinePlotSeries {
    id: number
    label: string
    data?: number[] | undefined
    baseline?: number[] | undefined

    borderColor?: 'primary' | undefined | string,
    backgroundColor?: 'primary' | undefined | string,

}

interface LinePlotProps {
    redraw?: boolean
    x_vals: (string | number)[]

    y_range?: { min: number, max: number }
    x_range?: { min: number, max: number }

    series: LinePlotSeries[]

    minimal?: boolean
    height?: string

    y_ticks?: { [xval: string]: string, first: string, last: string }
}

//#90caf9
export function TimeSeriesLinePlot(props: LinePlotProps) {

    const redraw = props.redraw === undefined || props.redraw;
    const normalized = false;

    const theme = useTheme() as any;

    let color = theme.palette.primary.main;
    // let color = theme.palette.values.plotLine

    const datasets = props.series.filter(s => s.data !== undefined).map(s => {
        return {
            id: s.id,
            label: s.label,
            data: s.data as number[],
            borderColor: s.borderColor === "primary" ? color : s.borderColor,
            backgroundColor: s.backgroundColor === "primary" ? color : s.backgroundColor,
            pointRadius: 0,
        }
    })

    const baselineDatasets = props.series.filter(s => s.baseline !== undefined).map(s => {
        return {
            id: `${s.id}_baseline`,
            label: `Baseline ${s.label}`,
            borderWidth: 1,
            borderDash: [3, 3],
            data: s.baseline as number[],
            borderColor: s.borderColor === "primary" ? color : s.borderColor,
            // borderColor: s.borderColor === "primary" ? "blue" : s.borderColor,
            backgroundColor: s.backgroundColor === "primary" ? color : s.backgroundColor,
            pointRadius: 0,
        }
    })

    const data = {
        labels: props.x_vals,
        datasets: [...datasets, ...baselineDatasets]
        // datasets: baselineDatasets
    };

    const minimal = props.minimal ? true : false;

    // return <div>{JSON.stringify(data, null, 2)}</div>
    const config = {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
// bezierCurve: true,
            plugins: {
                // filler: {
                //     propagate: true
                // },

                legend: {
                    display: false
                },

                title: {
                    display: false,
                    // text: (ctx: any) => 'Chart.js Line Chart - stacked=' + ctx.chart.options.scales.y.stacked
                },
                tooltip: {
                    mode: 'index',
                    callbacks: {
                        label: (tooltipItem: any) => {
                            return `${tooltipItem.dataset.label} ${tooltipItem.formattedValue}`
                            // return `${tooltipItem.dataset.label} ${Math.round((Number(tooltipItem.formattedValue) * 100000)) / 1000}%`
                            // return yValFormatted[tooltipItem.dataIndex]
                        }
                    }


                },
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            scales: {
                x: {
                    min: props.x_range ? props.x_range.min : undefined,
                    max: props.x_range ? props.x_range.max : undefined,

                    title: {
                        display: !minimal,
                        text: 'Minute (Game Time)'
                    },
                    ticks: {
                        display: !minimal,
                    },
                    grid: {
                        display: !minimal,
                        drawBorder: !minimal,
                    }

                },
                y: {
                    min: props.y_range ? props.y_range.min : 0,
                    max: props.y_range ? props.y_range.max : 1,
                    stacked: false,
                    title: {
                        display: !minimal,
                        text: '% of Games Ended'
                    },
                    ticks: {
                        display: !minimal,
                        callback: function (label: any, index: any, labels: any) {
                            return normalized ? `${Math.round(Number(label) * 100)}%` : `  ${label}  `
                        }
                    },
                    grid: {
                        display: !minimal,
                        drawBorder: !minimal,
                    }

                }
            }
        }
    };

    let controlsButtonSx = {
        paddingLeft: "11px",
        paddingRight: "11px",
        paddingTop: "11px",
        paddingBottom: "11px",
        height: "20px",
        width: "25px",
        maxWidth: "20px",
        minWidth: "20px"
    }
    // @ts-ignore
    let chart = <Line {...config} redraw={redraw}/>
    return <Box sx={{height: props.height ? props.height : "225px"}}>
        {/*KDE Sum: {datasets.map(ds => `  ${ds.label}: ${Math.round(ds.data.reduce((a, b) => a + b) * 100) / 100}  `)}*/}
        {chart}
    </Box>
}