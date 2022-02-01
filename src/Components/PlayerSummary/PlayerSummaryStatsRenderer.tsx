import * as React from "react";
import {
    Box, ButtonBase,
    Card,
    Container, Fade,
    Grid,
    Icon,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import ClearIcon from '@mui/icons-material/Clear';

import {
    DayEloDataPoint,
    DescriptiveStatsView,
    IconData, IconGroup,
    NewDataRow, ObjectQuickStatsData,
    PlayerQuickStatsTable,
    Stats
} from "../../Data/ModelGenerated";
import JSONTree from "react-json-tree";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {LinePlotSeries, TimeSeriesLinePlot} from "../TimeSeriesLinePlot";

import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {ObjectIcon} from "../../UI/ObjectIcon";
import {propToPercent} from "../../Utils";
// import {Chart, registerables} from 'chart.js';
// import {BoxPlotController} from '@sgratzl/chartjs-chart-boxplot';

// register controller in chart.js and ensure the defaults are set
// Chart.register(...registerables);
// Chart.register(BoxPlotController);

import styles from "./PlayerSummaryStatsRenderer.module.scss"

const elo_sample: DescriptiveStatsView = {
    count: {value: 100},
    filtered_views: {},
    max: {value: 2200},
    mean: {value: 1950},
    median: {value: 2050},
    meta_data: {name: "Elo"},
    min: {value: 1750},
    q1: {value: 1800},
    q3: {value: 2100},
    x_values: [],
    y_values: [2200, 2205, 1900, 1950, 1975, 2205, 2104, 2106, 2018, 2005, 2010, 2015, 2020, 2016]
}
export const SAMPLE_DATA = {
    highlights: {
        elo_range: elo_sample
    }
}


export const GetRandomEloHistorySample = () => {

    let data: { [date: string]: NewDataRow } = {}

    for (let i = 1; i < 31; i++) {
        let key = `2020-11-${i}`
        data[key] = {
            meta_data: {name: key},
            n: Math.floor(Math.random() * (11 - 1) + 1),
            prop: 0,
            win_rate: Math.random() * (0.65 - 0.45) + 0.45,
            elo_balance: Math.floor(Math.random() * (2600 - 2100) + 2100)
        }
    }

    return data
}


export const GetRandomCivShowCaseSample = () => {

    let data: { [date: string]: NewDataRow } = {}

    const MAX_CIVS = 6

    for (let i = 0; i < MAX_CIVS; i++) {
        let key = `${Math.floor(Math.random() * (20 - 1) + 1)}`

        let iconData: IconData = {
            group: "civilizations",
            key: key
        }

        data[key] = {
            meta_data: {name: key, icon_data: iconData},
            n: Math.floor(Math.random() * (45 - 1) + 1),
            prop: Math.random() * (0.75 - 0.45) + 0.45,
            win_rate: Math.random() * (0.65 - 0.45) + 0.45,
        }
    }

    return data
}


export const GetRandomMapsShowCaseSample = () => {

    let data: { [date: string]: NewDataRow } = {}

    const MAX_MAPS = 6

    for (let i = 0; i < MAX_MAPS; i++) {
        let key = `${Math.floor(Math.random() * (33 - 9) + 9)}`

        let iconData: IconData = {
            group: "maps",
            key: key
        }

        data[key] = {
            meta_data: {name: key, icon_data: iconData},
            n: Math.floor(Math.random() * (45 - 1) + 1),
            prop: Math.random() * (0.75 - 0.45) + 0.45,
            win_rate: Math.random() * (0.65 - 0.45) + 0.45,
        }
    }

    return data
}

export interface IIndependentBoxPlotProps {
    data: DescriptiveStatsView
}

function randomValues(count: number, min: number, max: number) {
    const delta = max - min;
    return Array.from({length: count}).map(() => Math.random() * delta + min);
}


// export function IndependentBoxPlot(props: IIndependentBoxPlotProps) {
//
//     let chartRef = useRef<HTMLCanvasElement>(null)
//
//     useLayoutEffect(() => {
//         let targetRef = chartRef.current
//         if (targetRef) {
//             const ctx = targetRef.getContext("2d");
//             if (ctx) {
//                 const data = {
//                     labels: [""],
//                     datasets: [{
//                         label: 'Dataset 1',
//                         backgroundColor: 'rgba(255,0,0,0.5)',
//                         borderColor: 'red',
//                         borderWidth: 1,
//                         outlierColor: '#999999',
//                         padding: 10,
//                         itemRadius: 0,
//                         data: props.data.y_values
//                     }]
//                 }
//
//                 const config = {
//                     type: BoxPlotController.id,
//                     data: data,
//                     options: {
//                         responsive: true,
//                         maintainAspectRatio: false,
//                         plugins: {
//                             legend: {
//                                 display: false
//                             },
//
//                             title: {
//                                 display: false,
//                             },
//                         }
//                     }
//                 };
//                 const dummyConfig = {
//                     type: "line",
//                     data: {
//                         //Bring in data
//                         labels: ["Jan", "Feb", "March"],
//                         datasets: [
//                             {
//                                 label: "Sales",
//                                 data: [86, 67, 91],
//                             }
//                         ]
//                     },
//                     options: {
//                         //Customize chart options
//                     }
//                 }
//                 const boxplotData = {
//                     labels: ['A'],
//                     datasets: [
//                         {
//                             label: 'Dataset 1',
//                             borderColor: 'red',
//                             borderWidth: 1,
//                             outlierRadius: 3,
//                             itemRadius: 3,
//                             outlierBackgroundColor: '#999999',
//                             data: [props.data.y_values],
//                         },
//                     ],
//                 };
//
//                 // @ts-ignore
//                 new Chart(ctx, {
//                     type: 'boxplot',
//                     data: boxplotData,
//                     options: {
//                         responsive: true,
//                         plugins: {
//                             // filler: {
//                             //     propagate: true
//                             // },
//
//                             legend: {
//                                 display: false
//                             },
//
//                             title: {
//                                 display: false,
//                                 // text: (ctx: any) => 'Chart.js Line Chart - stacked=' + ctx.chart.options.scales.y.stacked
//                             },
//                             // tooltip: {
//                             //     mode: 'index',
//                             //     callbacks: {
//                             //         label: (tooltipItem: any) => {
//                             //             return tooltipItem
//                             //             // return `${tooltipItem.dataset.label} ${tooltipItem.formattedValue}`
//                             //             // return `${tooltipItem.dataset.label} ${Math.round((Number(tooltipItem.formattedValue) * 100000)) / 1000}%`
//                             //             // return yValFormatted[tooltipItem.dataIndex]
//                             //         }
//                             //     }
//                             //
//                             //
//                             // },
//                         },
//                         interaction: {
//                             mode: 'nearest',
//                             axis: 'x',
//                             intersect: false
//                         },
//                         scales: {
//                             x: {
//                                 ticks: {
//                                     display: false
//                                 },
//                                 grid: {
//                                     display: false,
//                                     drawBorder: false
//                                 }
//
//                                 // min: props.x_range ? props.x_range.min : undefined,
//                                 // max: props.x_range ? props.x_range.max : undefined,
//                                 //
//                                 // title: {
//                                 //     display: true,
//                                 //     text: 'Minute (Game Time)'
//                                 // }
//                             },
//                             y: {
//                                 ticks: {
//                                     display: true
//                                 },
//                                 grid: {
//                                     display: false,
//                                     drawBorder: true
//                                 },
//
//                                 min: 1600,
//                                 max: 2400,
//                                 stacked: false,
//                                 title: {
//                                     display: true,
//                                     text: 'Elo Change'
//                                 },
//                                 // ticks: {
//                                 //     callback: function (label: any, index: any, labels: any) {
//                                 //         return normalized ? `${Math.round(Number(label) * 100)}%` : `  ${label}  `
//                                 //     }
//                                 // }
//                             }
//                         }
//
//                         // legend: {
//                         //     position: 'top',
//                         // },
//                         // title: {
//                         //     display: true,
//                         //     text: 'Chart.js Box Plot Chart',
//                         // },
//                     },
//                 });
//             }
//         }
//     }, [])
//
//
//     // const plot = <Bar {...config} redraw={true}/>
//     return <Box>
//         <canvas ref={chartRef}></canvas>
//         {/*{plot}*/}
//     </Box>
//
// }


export function EloProgressPlot(props: { data: DayEloDataPoint[] }) {

    let elo_vals = props.data.map((row) => row.closing_elo)
    let x_vals = props.data.map(row => row.date)
    let series: LinePlotSeries = {
        borderColor: "primary",
        data: elo_vals,
        id: 0,
        label: "Day Close Elo"
    }

    let startDate = props.data[0].date
    let endDate = props.data[props.data.length - 1].date

    const plot = <TimeSeriesLinePlot
        redraw={false}
        height={"125px"}
        minimal={true}
        y_ticks={{first: startDate, last: endDate}}
        y_range={{min: Math.min(...elo_vals) - 50, max: Math.max(...elo_vals) + 50}}
        x_vals={x_vals} series={[series]}/>
    return <Box>
        {plot}
    </Box>
}

const PropLabel = (props: { value: number, baseline?: number, label?: string, size: string }) => {

    let color: string | undefined;
    if (props.baseline !== undefined) {
        color = (props.value - props.baseline) > 0 ? 'values.positive' : 'values.negative';
    }

    let fontsize = props.size === "l" ? 12 : 8

    return <Stack spacing={0} justifyContent={"space-around"} alignItems={"center"}>
        <Typography fontSize={fontsize} color={color}>
            {propToPercent(props.value, 1)}%
        </Typography>
        {props.label &&
            <Typography fontSize={fontsize - 2} lineHeight={1.1} variant={"overline"}>{props.label}</Typography>}
    </Stack>
}

const IconContainer = (size: "s" | "l", group: IconGroup, data: ObjectQuickStatsData) => {

    let label = `Play Rate ${propToPercent(data.prop)}%, Win Rate: ${propToPercent(data.win_rate)}%, n = ${data.n} (${data.key})`
    let iconData: IconData = {description: label, group: group, key: data.key}

    let icon = iconData ?
        <ObjectIcon tooltip={{show: true, value: label}} size={size === "l" ? 95 : 30} borderless data={iconData}/> :
        <Typography color={"disabled.main"}>Missing!</Typography>

    return <Stack spacing={1} alignItems={"center"}>
        {icon}
        {size === "l" &&
            <Stack justifyContent={"space-around"} alignItems={"center"} direction="row"
                   marginTop={"-1.5px !important"}>
                <PropLabel size={size} value={data.prop} label={size === "l" ? "play rate" : undefined}/>
                <Box width={"32.5px"}/>
                <PropLabel size={size} value={data.win_rate} baseline={0.5}
                           label={size === "l" ? "win rate" : undefined}/>
            </Stack>
        }
    </Stack>
}

export const GetTopN = (data: { [k: string]: ObjectQuickStatsData }, n: number) => {

    let sorted = Object.values(data).sort((a, b) => b.n - a.n)

    return sorted.splice(0, n);

}

function ListItemItem(props: { secondary?: string, icon?: JSX.Element, label?: string, fontSize?: string }) {
    return <ListItem disablePadding secondaryAction={
        props.secondary && <Typography
            fontSize={props.fontSize ? props.fontSize : "0.75rem"}>{props.secondary}</Typography>}>
        {props.icon}
        <ListItemText>
            <Typography marginLeft={"8px"} fontSize={props.fontSize ? props.fontSize : "0.85rem"}
                        whiteSpace={"nowrap"}>  {props.label} </Typography>
        </ListItemText>
    </ListItem>
}

export function ObjectIconList(props: { items: ObjectQuickStatsData[], group: "maps" | "civilizations" }) {

    let items = props.items.slice(1, 5);
    return <Box width={"100%"}>
        <List disablePadding>
            <ListItem disablePadding secondaryAction={
                <Typography
                    fontSize={"0.65rem"}>win/play</Typography>}>
                {undefined}

                <ListItemText>  {""}
                </ListItemText>
            </ListItem>

            {items.map(item => {
                let md = getMetaDataForObjectQuickStatsData(item, props.group);
                return <ListItemItem
                    secondary={`${propToPercent(item.win_rate, 0)}%/${propToPercent(item.prop, 1)} %`}
                    icon={<ObjectIcon data={md.meta_data.icon_data} borderless
                                      size={22}/>}
                    label={item.label}
                />
            })}
        </List>
    </Box>
}

export function FavoriteCivsShowcase(props: { data: { [k: string]: ObjectQuickStatsData }, show?: "first" | "other" }) {

    let items = GetTopN(props.data, 5)
    let firstItem = items[0] as ObjectQuickStatsData


    if (props.show !== "first") {
        return <Box>
            <Stack justifyContent={"flex-start"} direction="column" spacing={1}>
                {items.slice(1).map((c) => IconContainer("s", "civilizations", c))}
            </Stack>
        </Box>
    }

    return <Stack spacing={1} justifyContent={"flex-start"} alignItems={"center"} marginTop={"5px"}>
        {/*<Stack justifyContent={"space-around"} alignItems={"center"} marginBottom={"0px"} marginTop={"-5px"}>*/}
        {/*    <Typography>Favorite Civ</Typography>*/}
        {/*</Stack>*/}
        <Stack justifyContent={"space-around"} direction={"row"} alignItems={"center"} height={"95px"}
               alignSelf={"center"}>
            {IconContainer("l", "civilizations", firstItem)}
        </Stack>
        {/*<Box height={"50px"}>*/}
    </Stack>

}

export const MostPlayedMaps = (props: { data: { [k: string]: ObjectQuickStatsData } }) => {

    // let maps = GetRandomMapsShowCaseSample()
    let items = GetTopN(props.data, 5)

    return <Box>
        <Stack justifyContent={"flex-start"} direction="column" spacing={1}>
            {items.map((c) => IconContainer("s", "maps", c))}
        </Stack>
    </Box>
}

export const Highlights = (props: { items: { value: string, list: boolean }[] }) => {

    const HighlightItem = (value: string, list?: boolean) => {

        return <Typography variant={"body2"} fontSize={"11px"} lineHeight={2.0}>{list ? " - " : ""}{value}</Typography>
    }

    let higlights: JSX.Element[] = props.items.map(i => HighlightItem(i.value, i.list))

    // higlights.push(HighlightItem("On Average 2 Games a Day", true))
    // higlights.push(HighlightItem("Most on Played on  Wednesday", true))
    // // higlights.push(HighlightItem("Longest Streaks", true))
    // higlights.push(HighlightItem("Least Played on  Sunday", true))
    // higlights.push(HighlightItem("Favorite Maps", true))
    // higlights.push(HighlightItem("Win Rate: 52%"))

    return <Box width={"100%"}>
        <List>
            {props.items.map(item => {
                return <ListItemItem
                    fontSize={"0.8rem"}
                    secondary={undefined}
                    icon={undefined}
                    label={`${item.list ? " - " : ""}${item.value}`}
                />
            })}
        </List>
    </Box>
    //
    //
    // return <Stack justifyContent={"space-around"} spacing={0} direction="row">
    //     <Stack>
    //         {/*<Box height={"50px"}></Box>*/}
    //         <Stack>
    //             {higlights}
    //         </Stack>
    //     </Stack>
    // </Stack>
}

const getMetaDataForObjectQuickStatsData = (target: ObjectQuickStatsData, group: "civilizations" | "maps") => {
    let iconData: IconData = {
        group: group,
        key: target.key
    }

    return {
        meta_data: {name: target.key, icon_data: iconData},
        n: target.n,
        prop: target.prop,
        win_rate: target.win_rate
    }

}

type TViewMode = "maps" | "civs" | undefined

export function FavoriteCivsShowcaseTest(props: { topCiv: ObjectQuickStatsData, topMap: ObjectQuickStatsData, mode: TViewMode, onChangeMode: (mode: TViewMode) => void }) {

    // const [focus, _setFocus] = useState<"top" | "bottom" | undefined>(undefined)

    const focus = props.mode === "maps" ? "top" : (props.mode === "civs" ? "bottom" : undefined)
    const setFocus = (m: "top" | "bottom" | undefined) => {
        props.onChangeMode(m === "top" ? "maps" : (m === "bottom" ? "civs" : undefined))
    }

    // let dataCivs = GetRandomMapsShowCaseSample();
    // let d1 = Object.values(dataCivs)[0];
    //
    // let dataMaps = GetRandomCivShowCaseSample();
    // let d2 = Object.values(dataMaps)[1]

    let d1 = getMetaDataForObjectQuickStatsData(props.topMap, "maps")
    let d2 = getMetaDataForObjectQuickStatsData(props.topCiv, "civilizations")

    const selectedItem = focus === "top" ? props.topMap : (focus === "bottom" ? props.topCiv : undefined)

    if (d1 && d2 && d1.meta_data.icon_data && d2.meta_data.icon_data) {
        d1.meta_data.icon_data.key = "9";

        let topIcon = <ObjectIcon size={100} borderless data={d1.meta_data.icon_data}/>
        let bottomIcon = <ObjectIcon size={100} borderless data={d2.meta_data.icon_data}/>

        let defaultTop = {
            visibility: focus === "bottom" ? "hidden" : "visible",
            // clipPath: "polygon(0 0, 0% 100%, 100% 0)"
        }
        let focusTop = {
            clipPath: undefined,
            zIndex: 100
        }

        let defaultBottom = {
            // visibility: focus === "top" ? "hidden" : "visible",
            // clipPath: "polygon(100% 100%, 0% 100%, 100% 0)"
        }
        let focusBottom = {
            clipPath: undefined,
            zIndex: 100
        }

        let defaultSep = {
            clipPath: "polygon(86% 10%, 90% 14%, 14% 90%, 10% 86%)",
        }
        let focusAnySep = {
            clipPath: undefined,
            visibility: "hidden"
        }


        let selectedTop = focus === "top" ? focusTop : defaultTop;
        let selectedBottom = focus === "bottom" ? focusBottom : defaultBottom;
        let selectedSep = defaultSep;//focus === undefined ? defaultSep : focusAnySep;


        return <Stack alignItems={"center"}>
            <Box position={"relative"} className={styles.parentContainer}>
                {/*// @ts-ignore*/}
                <Box
                    className={`${styles.item} ${styles.top} ${focus === "top" ? styles.selected : (focus === "bottom" ? styles.hidden : undefined)}`}
                    onClick={() => {
                        let t = focus === "top" ? undefined : "top" as "top" | undefined
                        setFocus(t)
                    }}
                    sx={{
                        top: "0px",
                        position: "absolute",
                        width: " 105px",
                        height: "105px",
                        ...selectedTop
                        // backgroundColor: "red",
                    }}>{topIcon}</Box>
                {/*// @ts-ignore*/}
                <Box
                    onClick={() => {

                        let t = focus === "bottom" ? undefined : "bottom" as "bottom" | undefined
                        setFocus(t)
                    }}
                    className={`${styles.item} ${styles.bottom} ${focus === "bottom" ? styles.selected : (focus === "top" ? styles.hidden : undefined)}`}

                    sx={{

                        top: "0px",
                        position: "absolute",
                        width: " 105px",
                        height: "105px",
                        // ...selectedBottom,

                        // backgroundColor: "blue",
                        // clipPath: "polygon(100% 100%, 0% 100%, 100% 0)"
                    }}>{bottomIcon}</Box>

                {/*// @ts-ignore*/}
                <Box
                    className={`${styles.seperator} ${focus !== undefined ? styles.hidden : ""}`}
                    sx={{

                        width: " 105px",
                        height: "105px",

                        backgroundColor: "rgba(44,44,44,0.92)",
                        ...selectedSep
                        // clipPath: "polygon(86% 10%, 90% 14%, 14% 90%, 10% 86%)",
                        // clipPath: "polygon(77.5% 17.5%, 82.5% 22.5%, 22.5% 82.5%, 17.5% 77.5%)",
                    }}/>

            </Box>
            <Fade in={selectedItem !== undefined}>
                <Stack>
                    <Stack justifyContent={"space-around"} alignItems={"center"} direction="row"
                           marginTop={"-17.5px !important"}>
                        <PropLabel size={"l"} value={selectedItem ? selectedItem.prop : 0.05} label={"play rate"}/>
                        <Box width={"32.5px"}/>
                        <PropLabel size={"l"} value={selectedItem ? selectedItem.win_rate : 0.5} baseline={0.5}
                                   label={"win rate"}/>
                    </Stack>
                    <Stack direction={"row"} justifyContent={"space-around"}>
                        <Typography fontSize={"0.8rem"}>{selectedItem?.label}</Typography>
                    </Stack>
                </Stack>
            </Fade>

        </Stack>

    }
    return <Box>No</Box>
}

export function PlayerSummaryStatsRenderer(props: { data: PlayerQuickStatsTable }) {
    const test_data = GetRandomEloHistorySample()

    const [currentMode, setCurrentMode] = useState<TViewMode>(undefined);

    let startElo = props.data.last100GamesData[0].closing_elo;
    let endElo = props.data.last100GamesData[props.data.last100GamesData.length - 1].closing_elo;
    let eloPrctChange = Math.round((1 / (startElo + endElo)) * (endElo - startElo) * 1000) / 10;

    let higlightsItems: { value: string, list: boolean }[] = [];

    for (let h of props.data.statsHighlights) {
        higlightsItems.push({value: h, list: true})
    }

    let totalGames = Object.values(props.data.mostPlayedCivs).map(v => v.n).reduce((p, c) => p + c, 0)


    let topCivs = GetTopN(props.data.mostPlayedCivs, 7)
    let topMaps = GetTopN(props.data.mostPlayedMaps, 7)

    return <Box sx={{flexGrow: 1}}>
        <Grid container spacing={1}>

            <Grid item xs={4}>
                {/*// @ts-ignore*/}
                <Stack flexGrow={"1"} position={"relative"} justifyContent={"space-between"} height={"100%"}>

                    <Typography variant={"h5"}
                                whiteSpace={"nowrap"}
                                fontSize={"16px"}>
                        {totalGames >= 100 ? "Last 100 Games Summary" : "Quick Stats"}
                    </Typography>

                    <EloProgressPlot data={props.data.last100GamesData}/>
                    <Stack justifyContent={"center"} direction="row">
                        <Typography fontSize={"12px"} color={"disabled.main"}>Daily (Close) Elo History</Typography>
                    </Stack>
                    <Box position={"absolute"} bottom={"10px"} right={"10px"}>
                        <Stack justifyContent={"flex-end"} direction="row" spacing={0} alignItems={"center"}>
                            <Stack justifyContent={"space-around"} spacing={0} direction="row" alignItems={"center"}>
                                <Typography color={startElo > endElo ? "red" : "green"}>
                                    {startElo > endElo ? <ArrowDropDownIcon/> : <ArrowDropUpIcon/>}
                                </Typography>
                            </Stack>
                            <Box alignSelf={"center"}>
                                <Typography>{eloPrctChange > 0 ? "+" : ""}{eloPrctChange}%</Typography>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </Grid>
            <Grid item xs={8}>
                <Grid container spacing={0}>

                    {/*Row 1*/}

                    <Grid item xs={5}>
                        <Stack alignItems={"center"} width={"100%"} marginBottom={"5px"}>
                            <Typography variant={"h6"}
                                        fontSize={"14px"}>
                                Favorite Map/Civ
                            </Typography>
                        </Stack>
                    </Grid>
                    <Grid item xs={7}>
                        <Stack direction={"row"} justifyContent={"space-between"} width={"100%"} marginBottom={"0px"}>

                            {currentMode === undefined ? <Typography
                                    alignSelf={"center"}
                                    variant={"h6"}
                                    fontSize={"14px"}>
                                    Highlights </Typography> :

                                <React.Fragment>
                                    {currentMode === "civs" ? <Typography
                                        alignSelf={"center"}
                                        variant={"h6"}
                                        fontSize={"14px"}>
                                        Most Played Civs </Typography> : <Typography
                                        alignSelf={"center"}
                                        variant={"h6"}
                                        fontSize={"14px"}>
                                        Most Played Maps </Typography>}
                                    <ButtonBase sx={{alignSelf: "center"}} onClick={() => {
                                        setCurrentMode(undefined)
                                    }}>
                                        <ClearIcon sx={{fontSize: "16px !important;"}}/>
                                    </ButtonBase>
                                </React.Fragment>
                            }

                        </Stack>
                    </Grid>

                    {/*Row 2*/}

                    {/*<Grid item xs={7} padding={"0 !important"}>*/}
                    {/*    <Highlights items={higlightsItems}/>*/}
                    {/*    <Typography variant={"subtitle2"} fontSize={"9px"}>*includes all games ever played</Typography>*/}
                    {/*</Grid>*/}
                    {/*<Grid item xs={5} padding={"0 !important"} marginTop={"5px"}>*/}
                    {/*    /!*<Typography variant={"overline"} lineHeight={1}>Most Played Civs</Typography>*!/*/}
                    {/*    <Stack direction={"row"}>*/}
                    {/*        <MostPlayedMaps data={props.data.mostPlayedMaps}/>*/}
                    {/*        <FavoriteCivsShowcase data={props.data.mostPlayedCivs} show={"other"}/>*/}
                    {/*    </Stack>*/}
                    {/*</Grid>*/}

                    <Grid item xs={5} padding={"0 !important"}>
                        <Stack alignItems={"center"} width={"100%"}>
                            {/*<FavoriteCivsShowcase data={props.data.mostPlayedCivs} show={"first"}/>*/}
                            <FavoriteCivsShowcaseTest topCiv={topCivs[0] as ObjectQuickStatsData}
                                                      topMap={topMaps[0] as ObjectQuickStatsData}
                                                      mode={currentMode}
                                                      onChangeMode={(m) => setCurrentMode(m)}
                            />
                        </Stack>
                    </Grid>

                    <Grid item xs={7} padding={"0 !important"}>
                        <Stack alignItems={"start"} width={"100%"}>
                            {currentMode === undefined ? <Highlights items={higlightsItems}/> :
                                <ObjectIconList items={currentMode === "maps" ? topMaps : topCivs}
                                                group={currentMode === "civs" ? "civilizations" : currentMode}/>}
                        </Stack>
                    </Grid>

                    {/*Row 3*/}
                    {/*<Grid item xs={7} padding={"0 !important"} marginTop={"5px"}>*/}
                    {/*    <Typography marginTop={"5px"} variant={"overline"} lineHeight={1}>Most Played Maps</Typography>*/}
                    {/*    <MostPlayedMaps data={props.data.mostPlayedMaps}/>*/}
                    {/*</Grid>*/}

                    {/*<Grid item xs={5} padding={"0 !important"} marginTop={"5px"}>*/}
                    {/*    TODO show a single civ/map icon hoverable, with full list shown only on click/hover*/}

                    {/*    <Typography variant={"overline"} lineHeight={1}>Most Played Civs</Typography>*/}
                    {/*    <FavoriteCivsShowcase data={props.data.mostPlayedCivs} show={"other"}/>*/}
                    {/*</Grid>*/}
                </Grid>
            </Grid>
        </Grid>
    </Box>

    // return <Box>
    //     <Stack spacing={2}>
    //         <Stack spacing={2} direction="row">
    //             <Grid item xs={4}>
    //                 <Stack spacing={0} position={"relative"}>
    //                     <Typography variant={"h5"}
    //                                 whiteSpace={"nowrap"}
    //                                 fontSize={"16px"}>{totalGames >= 100 ? "Last 100 Games Summary" : "Quick Stats"}</Typography>
    //                     <Box marginLeft={"-15px"}>
    //                         <EloProgressPlot data={props.data.last100GamesData}/>
    //                     </Box>
    //                     <Stack justifyContent={"center"} direction="row">
    //                         <Typography fontSize={"12px"} color={"disabled.main"}>Daily Elo History</Typography>
    //                     </Stack>
    //
    //                     <Stack justifyContent={"space-around"} direction="row" spacing={0}>
    //                         {/*// @ts-ignore*/}
    //                         <Stack justifyContent={"space-around"} direction="column" spacing={0}>
    //                             <Typography
    //                                 fontSize={"11px"}>Elo {startElo} {"->"} {endElo} </Typography>
    //                             <Typography
    //                                 fontSize={"11px"}> {props.data.last100GamesData[0].date} {"->"} {props.data.last100GamesData[props.data.last100GamesData.length - 1].date}</Typography>
    //                         </Stack>
    //                         <Stack justifyContent={"flex-end"} spacing={0} direction="row">
    //                             <Typography color={startElo > endElo ? "red" : "green"}>
    //                                 {startElo > endElo ? <ArrowDropDownIcon/> : <ArrowDropUpIcon/>}
    //                             </Typography>
    //                             <Typography>{eloPrctChange > 0 ? "+" : ""}{eloPrctChange}%</Typography>
    //                         </Stack>
    //                     </Stack>
    //                 </Stack>
    //
    //             </Grid>
    //             <Grid item xs={5}>
    //                 <Stack justifyContent={"space-between"}>
    //                     <Highlights items={higlightsItems}/>
    //
    //                     <Typography variant={"subtitle2"} fontSize={"9px"}>*includes all games ever played</Typography>
    //                     <MostPlayedMaps data={props.data.mostPlayedMaps}/>
    //
    //                 </Stack>
    //
    //             </Grid>
    //             <Grid item xs={3}>
    //                 <FavoriteCivsShowcase data={props.data.mostPlayedCivs}/>
    //             </Grid>
    //         </Stack>
    //     </Stack>
    // </Box>
}