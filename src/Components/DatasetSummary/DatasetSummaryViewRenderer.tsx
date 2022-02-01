import JSONTree from "react-json-tree";
import {GenericTable, NewDataRowY, NewDataSet} from "../../Data/ModelGenerated";
import {Container, Grid, Card, Box, Typography, Button, Alert, Stack} from "@mui/material";
import {TimeSeriesLinePlot} from "../TimeSeriesLinePlot";
import {Line} from "react-chartjs-2";
import * as React from "react";
import {Bar} from "react-chartjs-2";
import {dark} from "@mui/material/styles/createPalette";
import {styled, useTheme} from "@mui/material/styles";
import Tooltip, {TooltipProps, tooltipClasses} from '@mui/material/Tooltip';
import {InfoOutlined} from "@mui/icons-material";

var fileDownload = require('js-file-download');


export interface IDatasetSummaryViewRendererProps {
    data: NewDataSet
}

type TSeries = {
    label: string,
    data: number[]
}

interface IBarPlotProps {
    labels: string[]
    series: TSeries[]

    title: string
    horizontal?: boolean

}


function BarPlot(props: IBarPlotProps) {
    const theme = useTheme() as any;

    let colors = theme.palette.chartColors;
    // let color = theme.palette.values.plotLine

    const labels = props.labels;
    const data = {
        labels: labels,
        datasets: props.series.map((d, i) => {
            return {
                label: d.label,
                data: d.data,
                backgroundColor: colors[i + 1],

                // backgroundColor: Utils.CHART_COLORS.red,
            }
        })
    };

    let maxY = Math.max(...props.series[0].data.map((v, i) => ([v, ...props.series.map((arr) => arr.data[i])]).reduce((sum, v) => sum + v)))

    const config = {
        type: 'bar',
        data: data,
        options: {
            indexAxis: props.horizontal ? "y" : "x",
            plugins: {
                title: {
                    display: true,
                    text: props.title
                },
            },
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    min: 0,
                    max: props.horizontal ? undefined : maxY,
                    stacked: true
                }
            }
        }
    };
    // @ts-ignore
    let chart = <Bar {...config} redraw={false}/>
    return <Box>{chart}</Box>
}

export function GenericTableSummaryStatsRenderer(props: { data: GenericTable }) {
    let labels: string[] = []
    let series: { [key: string]: TSeries } = {}

    const allSeriesNames = Array.from(new Set(Object.values(props.data.data).map(v => {

            return Object.keys(v)
        }
    ).flat()))

    for (let key of Object.keys(props.data.data)) {
        let d = props.data.data[key] as { [p: string]: NewDataRowY }

        for (let rowKey of allSeriesNames) {
            let row = d[rowKey]

            if (series[rowKey] === undefined) {
                series[rowKey] = {
                    label: rowKey,
                    data: []
                }
            }
            let val: number;
            if (row !== undefined) {
                val = row.y
            } else {
                val = 0
            }
            series[rowKey].data.push(val)
        }

        labels.push(key)

    }

    let content: JSX.Element;
    let size = {xs: 12, md: 12}
    if (props.data.type === "generic_summary_game_date_count") {
        content = <BarPlot title={"Match Count by Week"} labels={labels} series={Object.values(series)}/>
    } else if (props.data.type === "generic_summary_elo_bracket_distribution") {
        content =
            <BarPlot title={"Match Count by Elo Bracket"} horizontal labels={labels} series={Object.values(series)}/>
        size.md = 6
    } else if (props.data.type === "generic_summary_player_country_distribution") {

        const TOP_N_COUNTRIES = 17
        // let sortedKeys = Object.keys(series).sort((a, b) => series[b].data.reduce((s, v) => s + v) - series[a].data.reduce((s, v) => s + v))
        // let seriesMerged = [...sortedKeys.map((k) => series[k]).slice(0, 4)]

        let sortedSeries = labels.map((v, i) => {
            return {key: v, value: series["country"].data[i]}
        }).sort((a, b) => b.value - a.value)

        let topNCountriesSeries = [...sortedSeries.slice(0, TOP_N_COUNTRIES - 1), {
            key: "Other",
            value: sortedSeries.slice(TOP_N_COUNTRIES - 1).map(s => s.value).reduce((sum: number, s: number) => sum + s)
        }]
        let countrySeries: TSeries = {
            label: "Country",
            data: topNCountriesSeries.map(s => s.value)
        }
        content =
            <BarPlot title={"Match Count By Country"}
                     labels={topNCountriesSeries.map(s => s.key)}
                     series={[countrySeries]}/>
        size.md = 6

    } else {
        content = <Typography> Illegal Table</Typography>
    }

    return <Grid item {...size}>
        <Card>
            {content}
        </Card>
    </Grid>

}

export const DataSamplingMessage = (props: { alert?: boolean }) => {
    return <Alert severity={props.alert ? "warning" : "info"}>
        {"All data on this site based on a random sample of matches queried from aoe2.net."}
        {" The sample size (only 100 000 matches are included for every game version and elo bracket combination, or all matches if less are available ) is large enough  to estimate accurate win/play rates for all civilizations and (popular) map combinations."}
        <br/>
        <br/>
        {"However the ratios between different Elo brackets are not preserved, e.g. a much larger proportion of matches played by >1600 Elo Players are included compared to other brackets."}
        <br/>
        <br/>
        {"Therefore currently an  Elo independent view is currently not available."}
        <br/>
        <br/>
        {/*{"In the charts bellow each match is counted twice (per each player, so the opponent might fall in a different Elo bracket)."}*/}
    </Alert>

}

export const DataSamplingMessageTooltip = styled(({className, ...props}: TooltipProps) => (
    <Tooltip style={{cursor: "help"}} title={<DataSamplingMessage alert/>} classes={{popper: className}}
             children={<InfoOutlined/>}/>
))(({theme}) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: 'rgba(0,0,0,0)',
        // color: 'rgba(0, 0, 0, 0.87)',
        // boxShadow: theme.shadows[1],
        fontSize: 11,
    },
}));


const handleStateDownload = (targetData: any) => {
    let data = JSON.stringify(targetData, (key, value) => {
        if (value !== null) return value
    }, 2);
    fileDownload(data, 'aoe2_dataset.json');

}

export function DatasetSummaryViewRenderer(props: IDatasetSummaryViewRendererProps) {


    const dataGrid = <Grid container spacing={2}>
        {Object.values(props.data.summary_stats).map(t => <GenericTableSummaryStatsRenderer data={t}/>)}
    </Grid>


    return <Container>
        <Stack spacing={2}>

            <Typography variant="h4" component="h4">
                Sample Summary
            </Typography>

            <DataSamplingMessage/>


            {dataGrid}
            <JSONTree data={props.data}/>

            <Stack direction={"row"}>
                {/*<Typography>Download full dataset</Typography>*/}
                <Button variant="outlined" onClick={() => handleStateDownload(props.data)}>Download Dataset (JSON)</Button>
            </Stack>

            {/*<button TODO do not encode in href*/}
            {/*    type="button"*/}
            {/*    // @ts-ignore*/}
            {/*    href={`data:text/json;charset=utf-8,${encodeURIComponent(*/}
            {/*        JSON.stringify(props.data)*/}
            {/*    )}`}*/}
            {/*    download="aoe2_dataset.json"*/}
            {/*>*/}
            {/*    {`Download Json`}*/}
            {/*</button>*/}
        </Stack>
    </Container>
}