import {
    DescriptiveStatsTable,
    NewDataRow, NewDataTable,

    NewDataTableGroupWithSummary,
    PlayerMetaData, PlayerQuickStatsTable,
    SampleSummaryValue, TableBytesWrapper
} from "../../Data/ModelGenerated";
import {GridItem, GridItemContainer} from "../Grid/GridItem";
import * as React from "react";
import {
    Box,
    Button,
    Card,
    CardHeader,
    Container,
    Grid,
    IconButton,
    Popover,
    Skeleton,
    Slider, Stack,
    ToggleButton,
    Typography
} from "@mui/material";
import styles from "../Grid/GridItem.module.scss";
import {DefaultDataTableForNewDataTable, MapDataTableForPlayer} from "../Table/DataTable";
import {IPathObjectExtension} from "../DefaultDataRenderer";
import JSONTree from "react-json-tree";
import {useContext, useState} from "react";
import {DataProviderContext} from "../../Internal/DataProvider";
import {Chart, Bar, Line} from "react-chartjs-2";
import annotationPlugin from 'chartjs-plugin-annotation';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import TableRowsIcon from '@mui/icons-material/TableRows';
import {LegendItem, Tooltip} from "chart.js";
import {DataProviderResponseMetaData, PlayerStatsViewQueryResponseMetaData} from "../../Data/Model";
import {PlayerStatsQueryJobInfoRenderer} from "./PlayerStatsQueryJobInfoRenderer";
import {DescriptiveStatsTableRenderer} from "../DescriptiveStats/DescriptiveStatsTableRenderer";
import {TableOrScatterPlotRenderer} from "../Table/TableOrScatterPlotRenderer";
import {TBaselineTableGroupSampleDelegate} from "../../Data/BaselineProviders";
import {ScatterPlotBaselineProvider} from "../ObjectScatterPlot";
import {getEloBracketForElo} from "../../Data/CheckType";
import {PlayerSummaryStatsRenderer} from "../PlayerSummary/PlayerSummaryStatsRenderer";

const pako = require('pako');

// @ts-ignore
Chart.register(annotationPlugin);

//register custome positioner
// @ts-ignore
Tooltip.positioners.side = function (items) {
    // @ts-ignore
    const pos = Tooltip.positioners.average(items);

    // Happens when nothing is found
    if (pos === false) {
        return false;
    }

    // @ts-ignore
    const chart = this._chart;

    let x = items[0].element.x;

    return {
        x: pos.x + 25,
        y: chart.chartArea.bottom - 50,
    };
}


export interface IItemDetailsViewsProps {
    data: NewDataTableGroupWithSummary
    metaData?: DataProviderResponseMetaData
    getBaselineData?: TBaselineTableGroupSampleDelegate

}

export interface IPatchHistoryChartProps {
    summary: { [k: string]: SampleSummaryValue }
}

function PatchHistoryChart(props: IPatchHistoryChartProps) {


    let xVals = Object.keys(props.summary).map(k => k)
    let yVal = Object.values(props.summary).map((v) => v.win_rate)
    let yValPlayRate = Object.values(props.summary).map((v) => v.play_rate)

    // let yValFormatted = yVal.map((v) => `${Math.round((v * 10000) / 100)}%`)

    const tickPercentCallback = (label: any, index: any, labels: any) => {
        return `${Math.round(Number(label) * 10000) / 100}%`
    }


    // @ts-ignore
    return <Bar data={{
        labels: xVals,
        datasets: [
            // @ts-ignore
            {type: 'line', borderColor: "#0038ff", label: "Play Rate", data: yValPlayRate, yAxisID: 'y1',},
            {type: 'bar', backgroundColor: "#ff0000", label: "Win Rate", data: yVal, yAxisID: 'y',},
        ]
    }}
                options={{
                    interaction: {
                        mode: 'x'
                    },
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "right",
                            align: 'start',
                            maxWidth: 55, maxHeight: 100,
                            display: false,
                            labels: {
                                generateLabels: function (chart) {
                                    let labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                                    let newLabels: LegendItem[] = []
                                    labels.forEach((l, i) => {

                                        newLabels.push(l)
                                        let n: LegendItem = {...l}
                                        newLabels.push(n)
                                        l.text = "";
                                        // labels[key].fillStyle = "rgba(133, 4, 12, 0.7)";
                                        // labels[key].strokeStyle = "rgba(33, 44, 22, 0.7)";
                                    });
                                    return newLabels;
                                }
                            }
                        },
                        // @ts-ignore
                        autocolors: false,
                        annotation: {
                            annotations: {
                                line1: {
                                    type: 'line',
                                    yMin: 0.5,
                                    yMax: 0.5,
                                    borderColor: 'rgb(141,164,255)',
                                    borderWidth: 2,

                                }
                            }
                        },
                        tooltip: {
                            // intersect: false,
                            mode: 'index',
                            callbacks: {
                                label: (tooltipItem) => {
                                    return `${tooltipItem.dataset.label} ${Math.round((Number(tooltipItem.formattedValue) * 100000)) / 1000}%`
                                    // return yValFormatted[tooltipItem.dataIndex]
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: tickPercentCallback
                            },

                            min: 0, max: 1
                        },
                        y1: {
                            ticks: {
                                callback: tickPercentCallback
                            },

                            min: 0,
                            max: 0.12,
                            type: 'linear',
                            display: true,
                            position: 'right',

                            // grid line settings
                            grid: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        },
                    }
                }}/>

    return <JSONTree data={{x: xVals, y: yVal}}/>
}

interface ICivPlayRateChartProps {
    defaultMark?: number
    label: string
    data: { [key: string]: NewDataTable }
}

const COLOR_BY_CIV = [
    "#808000",
    "#00FF00",
    "#008000",
    "#008080",
    "#FF00FF",
    "#800080",
    "red",
    "green",
    "blue",
    "cyan",
    "yellow",
    "brown",
    "olive",
    "purple",
    "Salmon",
    "#40E0D0",
    "#CCCCFF",
    "#DFFF00",
    "#E9967A",
    "#CD5C5C",
    "#F08080",
    "#884EA0",
    "#BA4A00",
    "#F8C471",
    "#7FB3D5",
    "#73C6B6",
    "#138D75",
    "#138D75",
    "#EC7063",
    "#85C1E9",
    "#85C1E9",
]

const getColorForCiv = (str: string) => {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF;
        colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;

}

function CivPlayRateChart(props: ICivPlayRateChartProps) {

    //TODO make each civ have unique color
    const COLORS = ["red",
        "green",
        "blue",
        "cyan",
        "yellow",
        "brown",
        "olive",
        "purple",
        "Salmon",
        "#40E0D0",
        "#CCCCFF",
        "#DFFF00",
        "#E9967A",
        "#CD5C5C",
    ]
    const OTHER_COLOR = "orange"

    const availableCountMarks = [6, 8, 12]

    const DATA_COUNT = 7;
    const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};

    const [normalized, setNormalized] = useState(false)
    const [marksCount, setMarksCount] = useState(props.defaultMark ? props.defaultMark : 12)
    // const [showMarksSlider, setShowMarksSlider] = useState(false)

    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleSliderClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleSliderClose = () => {
        setAnchorEl(null);
    };

    const showMarksSlider = Boolean(anchorEl);
    const anchorKey = showMarksSlider ? `simple-popover-${props.label}` : undefined;


    let totalCounterForEachGroup: { [group: string]: number } = {}
    let topCivsForEachMonth: (NewDataRow & { key: string })[] = []
    for (let period of Object.keys(props.data)) {

        let periodData = props.data[period]
        let data = periodData.data;

        let topItemForMonth = Object.keys(data).map(k => {
            return {...data[k], key: k}
        }).reduce((prev, current) => (prev.n > current.n) ? prev : current)
        topCivsForEachMonth.push(topItemForMonth)
        for (let rowKey of Object.keys(data)) {
            let row = data[rowKey]

            if (!totalCounterForEachGroup.hasOwnProperty(rowKey)) {
                totalCounterForEachGroup[rowKey] = 0
            }
            totalCounterForEachGroup[rowKey] += row.n
        }
    }

    topCivsForEachMonth.sort((a, b) => b.n - a.n)

    let groupsToInclude = Object.keys(totalCounterForEachGroup).sort((a, b) => totalCounterForEachGroup[b] - totalCounterForEachGroup[a])

    // let tempTest = groupsToInclude.map(key => [key, totalCounterForEachGroup[key]])
    groupsToInclude = groupsToInclude.slice(0, groupsToInclude.length > (marksCount - 3) ? (marksCount - 3) : -1)

    for (let maxCivForMonth of topCivsForEachMonth) {

        if (!groupsToInclude.includes(maxCivForMonth.key))
            groupsToInclude.push(maxCivForMonth.key)

        if (groupsToInclude.length >= marksCount)
            break;
    }

    let datasets: { [groupKey: string]: any } = {}

    let index = 0;

    [...groupsToInclude, "Other"].forEach((groupKey, groupIndex) => {

        let color: string;
        if (groupKey === "Other") {
            color = OTHER_COLOR
        } else {
            let colorIndex = groupIndex
            if (props.label.includes("Civs")) {
                color = getColorForCiv(groupKey)
            } else {
                color = COLORS[colorIndex]
            }
        }
        datasets[groupKey] = {
            tension: 0.75,
            label: groupKey,
            data: Array(Object.keys(props.data).length).fill(0),
            borderColor: color,
            backgroundColor: color,
            fill: "origin"
        }
    })

    let x_vals = Object.keys(props.data).sort((a, b) => {


        let aSum = a.split("-").reverse().map((val, i) => parseInt(val) * ((i + 1) * Math.pow(10, i))).reduce((sum, a) => sum + a, 0);
        let bSum = b.split("-").reverse().map((val, i) => parseInt(val) * ((i + 1) * Math.pow(10, i))).reduce((sum, a) => sum + a, 0);

        return aSum - bSum;
    })


    for (let period of x_vals) {
        let periodData = props.data[period]
        let data = periodData.data;

        for (let rowKey of Object.keys(data)) {
            let row = data[rowKey]

            let groupIndex = groupsToInclude.indexOf(rowKey);
            // let color = groupIndex > -1 ? COLORS[groupIndex] : OTHER_COLOR

            let groupKey = groupIndex > -1 ? rowKey : "Other"//groupsToInclude.includes(rowKey) ? rowKey : "Other"

            // if (!datasets.hasOwnProperty(groupKey)) {
            //     datasets[groupKey] = {
            //         tension: 0.75,
            //         label: groupKey,
            //         data: [],
            //         borderColor: color,
            //         backgroundColor: color,
            //         fill: "origin"
            //     }
            // }

            // if (datasets[groupKey].data[index] === undefined) {
            //     datasets[groupKey].data[index] = 0
            // }
            datasets[groupKey].data[index] += row.n

        }
        index++;
    }

    if (normalized) {
        Object.keys(props.data).forEach((period, index) => {
            let periodSum = Object.values(datasets).map(ds => ds.data[index]).reduce((a, b) => a + b, 0);

            for (let dsKet of Object.keys(datasets)) {
                datasets[dsKet].data[index] = datasets[dsKet].data[index] / periodSum
            }

        })
    }

    // return <JSONTree data={datasets}/>
    // return <JSONTree data={props.data}/>
    // const labels = [1, 2, 3];
    const data = {
        labels: x_vals,//Object.keys(props.data),
        // datasets: x_vals.map((k) => datasets[k])//Object.values(datasets)
        datasets: Object.values(datasets)
    };
    const config = {
        type: 'line',
        data: data,
        options: {
            interaction: {
                intersect: false,
                mode: 'index',
            },

            // interaction: {
            //     mode: 'x',
            //     // axis: 'x',
            //     intersect: false
            // },


            elements: {
                point: {
                    radius: 1.75
                }
            },
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
                    position: "average",
                    // position: "side",
                    mode: 'index',
                    callbacks: {
                        label: (tooltipItem: any) => {

                            if (normalized) {
                                return `${tooltipItem.dataset.label} ${Math.round((Number(tooltipItem.formattedValue) * 100000)) / 1000}%`
                            } else {
                                return `${tooltipItem.dataset.label} ${tooltipItem.formattedValue}`
                            }
                            // return yValFormatted[tooltipItem.dataIndex]
                        }
                    }


                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    }
                },
                y: {
                    min: 0, max: normalized ? 1 : undefined,
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Play Count'
                    },
                    ticks: {
                        callback: function (label: any, index: any, labels: any) {
                            return normalized ? `${Math.round(Number(label) * 100)}%` : `  ${label}  `
                        }
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
    let chart = <Line {...config}/>
    return <React.Fragment>
        <GridItemContainer size={{xs: 12, sm: 12, md: 12, lg: 12, xl: 6}}
                           onSelectItem={undefined}
                           sx={{maxHeight: "280px", height: "280px"}}
                           content={<React.Fragment>
                               <Box sx={{display: "flex", justifyContent: "space-between"}}>
                                   <Typography variant={"subtitle2"}>{props.label}</Typography>

                                   <Box sx={{display: "flex", justifyContent: "space-between", width: "60px"}}>
                                       <ToggleButton
                                           // variant="outlined"
                                           aria-describedby={anchorKey}
                                           // variant="contained"
                                           color={"secondary"}
                                           sx={controlsButtonSx}
                                           // value="check"
                                           // selected={normalized}
                                           onClick={handleSliderClick}
                                           value='check'
                                           selected={showMarksSlider}
                                       >
                                           <TableRowsIcon sx={{fontSize: "16px"}}/>
                                       </ToggleButton>
                                       <Popover
                                           id={anchorKey}
                                           open={showMarksSlider}
                                           anchorEl={anchorEl}
                                           onClose={handleSliderClose}
                                           anchorOrigin={{
                                               vertical: 'bottom',
                                               horizontal: 'left',
                                           }}
                                       >
                                           <Box sx={{width: "220px", margin: "10px"}}>
                                               Number of Groups
                                               <Slider
                                                   size={"small"}
                                                   min={5}
                                                   max={18}
                                                   onChange={(ev, d) => {
                                                       // @ts-ignore
                                                       setMarksCount(d)
                                                   }}
                                                   aria-label="Restricted values"
                                                   defaultValue={marksCount}
                                                   // valueLabelFormat={valueLabelFormat}
                                                   // getAriaValueText={valuetext}
                                                   step={1}
                                                   valueLabelDisplay="auto"
                                                   marks={availableCountMarks.map((v) => {
                                                       return {value: v, label: v}
                                                   })}
                                               />
                                           </Box>

                                       </Popover>

                                       <ToggleButton
                                           sx={controlsButtonSx}
                                           value="check"
                                           selected={normalized}
                                           onChange={() => {
                                               setNormalized(!normalized);
                                           }}
                                       >
                                           <EqualizerIcon sx={{fontSize: "16px"}}/>
                                       </ToggleButton>
                                   </Box>

                               </Box>

                               <Box sx={{
                                   maxHeight: "280px",
                                   height: "280px"
                               }}>
                                   {chart}
                               </Box>

                           </React.Fragment>}/>

        {/*<JSONTree data={props}/>*/}
    </React.Fragment>

    // return <JSONTree data={props.data}/>

}

export interface ItemDetailsViewBaselineProvider {
    getBaselineData: TBaselineTableGroupSampleDelegate
    key: string
    label: string

}


export function ItemDetailsView(props: IItemDetailsViewsProps & IPathObjectExtension) {


    // let baselineDataProviders: ItemDetailsViewBaselineProvider[] | undefined = props.getBaselineData ? [{
    //     label: "TEST",
    //     key: "elo",
    //     getBaselineData: props.getBaselineData
    // }] : []


    const summary = props.data.summary
    // summary = summary && Object.keys(summary).length > 0 ? summary : undefined;

    let summaryCard: JSX.Element | undefined;

    if (summary) {
        summaryCard = <GridItemContainer size={{xs: 12, sm: 12, md: 12, lg: 8, xl: 8}}
                                         onSelectItem={undefined}
                                         content={<React.Fragment><Typography variant={"subtitle2"}>Win Rate by Game
                                             Version</Typography>
                                             <Box sx={{maxHeight: "140px", height: "140px"}}>
                                                 <PatchHistoryChart summary={summary}/>
                                             </Box>
                                         </React.Fragment>}/>
    } else {
        summaryCard = undefined;
        // <Grid item {...{xs: 6, sm: 6, md: 6, lg: 6, xl: 6}}>
        //     <Card><Container><Stack><Typography>BRING BACK SUMMARY CARD</Typography></Stack></Container></Card>
        // </Grid>
    }

    let additionalTableCards: JSX.Element[] = [];

    let metaDataView: JSX.Element | undefined;
    let tall = false;
    //Is Meta data for player stats view query info?
    if (props.metaData?.hasOwnProperty('scheduled_or_running_job')) {
        let data = props.metaData as PlayerStatsViewQueryResponseMetaData
        metaDataView =
            <PlayerStatsQueryJobInfoRenderer profileId={props.data.meta_data?.name} data={data} full={false}/>
    }
    if (props.path.value.includes("stats_views__players")) {
        tall = true;

        if (props.data.tables && props.data.tables.hasOwnProperty("player_stats_quick_summary")) {
            let playerMeta = props.data.meta_data as PlayerMetaData

            let playerSummaryCard = <GridItemContainer tall={tall} size={{xs: 12, sm: 12, md: 12, lg: 8, xl: 8}}
                                                       content={<PlayerSummaryStatsRenderer
                                                           data={props.data.tables["player_stats_quick_summary"] as PlayerQuickStatsTable}/>}/>

            additionalTableCards.push(playerSummaryCard)
        }
    }
    // PlayerSummaryStatsRenderer

    if (props.data.tables) {
        for (let tableKey of Object.keys(props.data.tables)) {

            let tableOrStatsView = props.data.tables[tableKey];

            if (tableOrStatsView.hasOwnProperty('additional_tables')) {

                let table = tableOrStatsView as NewDataTable;

                let label = tableKey === "civ" ? "Most Played Civs, by Month" : "Most Played Maps, by Month"
                if (table.additional_tables) {
                    for (let additionalTableCollectionKey of Object.keys(table.additional_tables)) {
                        let additionalTableCollectionOrMissingValue = table.additional_tables[additionalTableCollectionKey];

                        // TODO for now entire chart will be hidden if any civ/map is MissingValue, FIX
                        // if (Object.values(additionalTableCollectionOrMissingValue).find(t => t.hasOwnProperty('reason') === undefined)) {
                        let additionalTableCollection = additionalTableCollectionOrMissingValue as { [key: string]: NewDataTable };
                        // for (let addTableKey of Object.keys(additionalTableCollection)) {
                        //     let additionalTable = additionalTableCollection[addTableKey]


                        additionalTableCards.push(
                            <CivPlayRateChart
                                defaultMark={tableKey === "civ" ? 10 : 6}
                                label={label}
                                data={additionalTableCollection}/>)
                        // }
                        // }

                    }
                }
            }
        }
    }
    // if (props.data.tables)

    // @ts-ignore
    return <Container maxWidth={"xl"}>
        {metaDataView}
        <Grid container spacing={2}>
            <GridItem tall={tall} data={props.data} size={{xs: 12, sm: 12, md: 6, lg: 4, xl: 4}}/>

            {summaryCard}
            {additionalTableCards}

            {/*<Grid item {...{xs: 12, sm: 12, md: 6, lg: 4, xl: 4}} sx={{flexGrow: 1}}>*/}
            {/*    <Card sx={{height: "100%"}}>*/}
            {/*        <Skeleton variant="rectangular" width={"100%"}*/}
            {/*                  sx={{margin: "2.5%", height: "95%"}}/>*/}
            {/*    </Card>*/}
            {/*</Grid>*/}

            {props.data.tables && Object.values(props.data.tables).map((t, ii) => {
                // MapDataTableForPlayer


                if (props.data.tables !== undefined) {
                    let dataTables = props.data.tables;
                    let table: JSX.Element | undefined;

                    if (t.hasOwnProperty('data')) {
                        let dataTable = t as NewDataTable

                        if (props.path.value.includes("stats_views__players")) {
                            let playerMeta = props.data.meta_data as PlayerMetaData

                            if (t.type === "player_stats_quick_summary") {
                                return undefined;
                            } else if (t.type === "maps_table") {

                                table = <MapDataTableForPlayer
                                    dataKey={props.dataKey}

                                    baselineEloBracket={getEloBracketForElo(playerMeta.latest_elo)}
                                    player_elo={playerMeta.latest_elo}
                                    getBaselineData={props.getBaselineData}
                                    expanded={ii === Object.values(dataTables).length - 1}
                                    path={props.path}
                                    viewInfo={{title: dataTable.label}} data={dataTable}/>
                            } else {
                                table = <MapDataTableForPlayer
                                    baselineEloBracket={getEloBracketForElo(playerMeta.latest_elo)}
                                    dataKey={props.dataKey}

                                    getBaselineData={props.getBaselineData}
                                    player_elo={playerMeta.latest_elo}
                                    expanded={ii === Object.values(dataTables).length - 1}
                                    path={props.path}
                                    viewInfo={{title: dataTable.label}} data={dataTable}/>
                            }
                        } else {
                            table = <TableOrScatterPlotRenderer

                                dataKey={props.dataKey}
                                key={props.dataKey}
                                expanded={ii === Object.values(dataTables).length - 1}
                                path={props.path}
                                viewInfo={{title: dataTable.type}} data={dataTable}/>
                        }
                    } else if (t.hasOwnProperty('bytes') && t.hasOwnProperty('type') && t["type"] === "DescriptiveStatsTable") {

                        let compressedTable = t as TableBytesWrapper


                        let bytes = atob(compressedTable.bytes)
                        // let bts = atob(bytes)
                        let bts = bytes;//bytes.slice(2, bytes.length - 1)

                        let unintBytes = Uint8Array.from(bts, c => c.charCodeAt(0))

                        // let blob = new Blob([bytes])

                        let rawStr = pako.inflate(unintBytes, {to: 'string'});
                        let uncompressedTable = JSON.parse(rawStr) as DescriptiveStatsTable;

                        table = <div>
                            <DescriptiveStatsTableRenderer table={uncompressedTable}/>
                        </div>
                    } else if (t.hasOwnProperty('data_views')) {
                        table = <div>
                            <DescriptiveStatsTableRenderer table={t as DescriptiveStatsTable}/>
                        </div>
                    }
                    return <Grid item {...{xs: 12, sm: 12, md: 12, lg: 12, xl: 12}}>
                        {/*MAPS:{JSON.stringify(props.path)} {t.type}*/}
                        {/* @ts-ignore*/}
                        {table}
                    </Grid>
                }
                return undefined
            })}
        </Grid>
    </Container>
}