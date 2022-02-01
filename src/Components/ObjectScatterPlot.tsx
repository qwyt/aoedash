import * as React from "react";
import {useEffect, useMemo, useRef, useState} from "react";
import {DataRendererExtensions, IPathObjectExtension, IViewInfoExtensions} from "./DefaultDataRenderer";
import {
    DataItemType,
    NewDataGroupWithLabel,
    NewDataGroupWithLabelPagedView,
    NewDataSampleWithSummary, TableGroup,
    TTableGroup
} from "../Data/CheckType";
import {Box, Button, GridSize, Stack} from "@mui/material";
import {Scatter} from "react-chartjs-2";
import {ControlItemWithLabel} from "./DescriptiveStats/DescriptiveStatsTableRenderer";
import {DatasetSelectionButtonGroup} from "./DescriptiveStats/DatasetSelectionButtonGroup";
import {
    GenericTable,
    IconData,
    MetaData,
    NewDataGroup, NewDataRowXy,
    NewDataSample,
    NewDataTable,
    NewDataTableGroupWithSummary
} from "../Data/ModelGenerated";
import {GetIconUrl} from "../UI/ObjectIcon";
import {GridItem} from "./Grid/GridItem";

import {Chart, registerables} from 'chart.js';
import {IDataTableForNewNewDataTable} from "./Table/DataTable";
import {TBaselineTableGroupSampleDelegate} from "../Data/BaselineProviders";
import {OnSelectTopLevelGridItem} from "./Grid/GridView";
import annotationPlugin from 'chartjs-plugin-annotation';
import {propToPercent} from "../Utils";

Chart.register(...registerables);
Chart.register(annotationPlugin);


const __TEST_CHART = Chart

// @ts-ignore
const overridenDraw = Chart.registry.elements.items.point.prototype.draw

// @ts-ignore
Chart.registry.elements.items.point.prototype.draw = function (ctx, opt) {
    let temp = overridenDraw.bind(this)


    if (this.options.hoverBorderWidth === STYLE_BASELINE_ITEMS) {
        ctx.filter = "drop-shadow(0px 0px 0px 10px #FF0000 ) ";
        // ctx.filter = "drop-shadow(0px 0px 0px 10px rgba(255,0,0,0.8))";
    } else if (this.options.hoverBorderWidth === 0) {
        ctx.filter = "grayscale(1)";
    } else if (this.options.hoverBorderWidth === -1) {
        ctx.filter = "grayscale(1) opacity(0.5)";
    } else if (this.options.hoverBorderWidth === 0) {
        ctx.filter = "none";
    }
    // else if (this.options.hoverBorderWidth === STYLE_SELECTED_WHEN_BASELINE_ITEMS) {
    //     return;
    // }
    temp(ctx, opt)

}

export interface ScatterPlotBaselineProvider {
    getBaselineData: TBaselineTableGroupSampleDelegate
    key: string
    label: string

}

const STYLE_BASELINE_ITEMS = -30
const STYLE_SELECTED = 10

// /const STYLE_SELECTED_WHEN_BASELINE_ITEMS = 101


export interface IObjectScatterPlotProps {
    data: NewDataGroupWithLabel | NewDataGroupWithLabelPagedView | NewDataTable

    baselineDataProviders: ScatterPlotBaselineProvider[]
}

export type TObjectScatterPlotProps = IObjectScatterPlotProps & DataRendererExtensions & IPathObjectExtension


type TScatterPlotDataSource = { data: NewDataSampleWithSummary, altView?: GenericTable }
export const ObjectScatterPlot = (props: TObjectScatterPlotProps) => {
    const [selectedBaseline, setSelectedBaseline] = useState<string | undefined>(undefined)
    const [selectedItemKey, setSelectedItemKey] = useState<string | undefined>(undefined);

    let dataPoints: { x: number, y: number, r: number, label: string }[] = []

    const chartRef = useRef<HTMLElement>(null)
    let images: any[] = []

    const isDetailsView = !props.data.hasOwnProperty("samples")

    const buildDataSource: () => TScatterPlotDataSource = () => {
        if (props.data.hasOwnProperty("samples")) {
            let data = props.data as NewDataGroupWithLabel

            if (data.alt_view) {
                return {altView: data.alt_view, data: data.samples["All"] as NewDataSampleWithSummary}
            } else {
                return {data: data.samples["All"] as NewDataSampleWithSummary}
            }
        } else {
            let data = props.data as NewDataTable

            // @ts-ignore
            let tableGroups: TableGroup = {
                get(key: string) {
                    return this[key] as NewDataTableGroupWithSummary
                },
                // set(key: string, val: NewDataTableGroupWithSummary) {
                //     this[key] = val
                // },
            }
            // let tableGroups: TTableGroup = new Map<string, NewDataTableGroupWithSummary>();

            for (let row_key of Object.keys(data.data)) {
                let row = data.data[row_key];
                let gr: NewDataTableGroupWithSummary = {
                    summary: {},
                    n: row.n,
                    prop: row.prop,
                    win_rate: row.win_rate,
                    meta_data: row.meta_data
                }
                tableGroups[row_key] = gr
                // tableGroups.set(row_key, gr)
            }

            let tempSample: NewDataSampleWithSummary = {name: data.label, size: 0, tableGroups: tableGroups}

            return {data: tempSample}

        }
    }

    useEffect(() => {

        setTimeout(() => {
            let chart = chartRef.current as any;
            if (chart) {

                for (let ds of chart.config._config.data.datasets) {
                    if (ds.hoverBorderWidth === STYLE_SELECTED) {
                        ds.hidden = selectedBaseline !== undefined;
                        // ds.hoverBorderWidth = STYLE_SELECTED_WHEN_BASELINE_ITEMS
                    }

                    if (ds.hidden && selectedBaseline === undefined) {
                        ds.hidden = false;
                    }

                }

                chart.update()
            }

        }, 220)
    }, [selectedBaseline])


    const getPointDef = (style?: number) => {
        return {
            order: 100,
            pointHoverRadius: 10,
            pointHitRadius: 10,
            pointRadius: 10,
            backgroundColor: 'rgb(255, 99, 132)',
            hoverRadius: 32,
            hoverBorderWidth: style ? style : 1,
            hoverBorderColor: 'green',
        }
    }

    let getImgStyle = (iconData: IconData, w?: number, h?: number) => {
        let img = new Image();
        img.src = GetIconUrl(iconData);
        img.crossOrigin = "Anonymous";
        img.width = 32
        img.height = 32
        // img.classList.add('TESTTEST')


        // img.style.opacity = "0.1";// = "color:#f00;padding:5px;"
        // img.style.cssText = "opacity: 0.4; filter: 'alpha(opacity=40)';"
        //                                c[0].element.options.pointStyle.style.opacity = 0.4;
        //                             c[0].element.options.pointStyle.style.filter = 'alpha(opacity=40);';

        return img;

    }
    let dataSourceContainer = useMemo(() => buildDataSource(), [])


    const [datasetsSource, setDatasetsSource] = useState<undefined | any[]>(undefined)

    // let datasetsSource = useMemo(() => {
    useEffect(() => {

        let dataSource = dataSourceContainer.data;

        let _datasets = Object.keys(dataSource.tableGroups).map((key, i) => {
            let item = dataSource.tableGroups.get(key) as NewDataTableGroupWithSummary;
            let label = `${item.meta_data?.name} ${propToPercent(item.win_rate)}%/${propToPercent(item.prop)}%`

            let pointStyle: HTMLCanvasElement | HTMLImageElement | "circle" = "circle";
            if (item.meta_data && item.meta_data.hasOwnProperty('icon_data')) {
                let md = item.meta_data as MetaData


                const iconDataValid = md.icon_data;// All civ icons should be now available. && (md.icon_data.group === "maps" || (parseInt(md.icon_data.key) < 38))

                if (iconDataValid) {
                    pointStyle = getImgStyle(md.icon_data as IconData)

                    images.push(pointStyle)
                }
            }

            let data: { x: number, y: number, r: number, key: string, label: string, tooltip: string }[];

            let missingValue = false;
            if (dataSourceContainer.altView) {
                let altItemRow = dataSourceContainer.altView.data[key] as NewDataRowXy;

                missingValue = altItemRow === undefined
                let innerLabel = altItemRow ? altItemRow.label : label ? label : "unknown"

                data = [{
                    // @ts-ignore
                    x: altItemRow ? altItemRow.x : dataSourceContainer.altView.bounds.x.min + 0.05 * i,
                    // @ts-ignore
                    y: altItemRow ? altItemRow.y : dataSourceContainer.altView.bounds.y.max + 0.05,
                    r: 10,
                    key: key,
                    tooltip: `${missingValue ? "Not Enough Data " : ""}${innerLabel}`,
                    label: innerLabel
                }]

                // pointStyle = "circle"

            } else {
                data = [{
                    x: item.prop,
                    y: item.win_rate,
                    r: 10,
                    key: key,
                    label: label ? label : "unknown",
                    tooltip: label ? label : `Unknown[${key}]`
                }]
            }
            let r = {
                ...getPointDef(),
                id: key,
                pointStyle: pointStyle,
                label: key,
                data: data,
                error: missingValue
            }

            if (missingValue) {
                r.backgroundColor = "red"
            }
            return r
        })

        setDatasetsSource(_datasets)
        // return _datasets
    }, [])

    // @ts-ignore
    let datasets = chartRef && chartRef.current ? [...chartRef.current.config._config.data.datasets] : datasetsSource
    // let datasets = datasetsSource

    if (datasets) {
        for (let bp of props.baselineDataProviders) {
            const key = `${bp.key}_b`
            // @ts-ignore
            let idx_TO_DELETE = datasets.findIndex((v) => v.id === key)
            if (idx_TO_DELETE !== -1) {
                datasets.splice(idx_TO_DELETE, 1);
            }
        }
    }
    let annotations: any = {};
    if (chartRef.current && datasets && selectedBaseline && selectedItemKey) {

        // datasets = [...chartRef.current.config._config.data.datasets]
        // datasets = [...datasetsSource]
        let baselineProvider = props.baselineDataProviders.find((b) => b.key === selectedBaseline)

        if (baselineProvider) {
            let baselineData = baselineProvider.getBaselineData(selectedItemKey, "civ")

            let dataItems = baselineData.filter(di => di.label !== "All").map((di) => {
                let d = di.value;
                if (d) {
                    // let d = baselineData[di] as NewDataTableGroupWithSummary

                    let name = d.meta_data ? `${d.meta_data?.name} - Elo ${di.label}` : ` Elo ${di.label}`

                    annotations[`label_${di.label}`] = {
                        type: 'label',
                        xValue: d.prop,
                        yValue: d.win_rate - 0.0125,
                        content: [di.label],
                        borderColor: "",
                        color: "white",
                        font: {
                            size: 12
                        },
                        backgroundColor: 'rgba(4,4,4, 0.25)',
                    }

                    return {
                        x: d.prop,
                        y: d.win_rate,
                        r: 40,
                        key: di.label,
                        label: name ? name : di.label,
                        tooltip: name
                    }
                }
            })
            //@ts-ignore
            let pointStyle = getImgStyle(baselineData[0].value.meta_data.icon_data as IconData)

            // TODO HACK FIX currently sate is stored in chart state, therefore it can't be rerendered with new data
            // TODO store state (if clicked, etc) separately instead!

            const key = `${baselineProvider.key}_b`
            // @ts-ignore
            // let idx_TO_DELETE = datasets.findIndex((v) => v.id === key)
            // if (idx_TO_DELETE) {
            //     datasets = datasets.splice(idx_TO_DELETE, 1);
            // }

            datasets.push({
                ...getPointDef(STYLE_BASELINE_ITEMS),
                order: 1,
                id: key,
                pointStyle: pointStyle,
                label: baselineProvider.key,
                data: dataItems
            })
        }
    }

    let config: any = undefined;
    const selectItem = (selected: any, datasets: any[]) => {

        let needUpdate = false;
        for (let ds of datasets) {

            if (ds.hoverBorderWidth === STYLE_BASELINE_ITEMS) {
                continue;
            }

            if (selected === undefined) {
                if (ds.hoverBorderWidth !== 1) {
                    needUpdate = true;
                    ds.hoverBorderWidth = 1;
                }

                if (ds.hidden) {
                    ds.hidden = false;
                }

            } else if (ds.id === selected) {
                if (ds.hoverBorderWidth !== STYLE_SELECTED) {
                    ds.hoverBorderWidth = STYLE_SELECTED
                    needUpdate = true;
                }

                if (selectedBaseline && ds.hidden !== true) {
                    needUpdate = true;
                    ds.hidden = true

                } else if (selectedBaseline === undefined && ds.hidden) {
                    needUpdate = true;
                    ds.hidden = false

                }
            } else {
                if (ds.hoverBorderWidth !== -1) {
                    needUpdate = true;
                    ds.hoverBorderWidth = -1;
                }
                // if (ds.hoverBorderWidth !== 0) {
                //     needUpdate = true;
                //     ds.hoverBorderWidth = 0;
                // }
            }
        }

        if (needUpdate)
            (chartRef.current as any).update()


        setTimeout(() => {
            setSelectedItemKey(selected)
        }, 55)

    }

    if (datasetsSource) {
        const data = {
            datasets: datasets
        };


        //e.chart.config._config.data.datasets

        config = {
            type: 'scatter',
            data: data,
            options: {
                interaction: {
                    intersect: false,
                    mode: 'point',
                },
                // multiTooltipTemplate: "<%= datasetLabel %> - <%= value %>",

                onHover: (e: any, c: any, chart: any) => {
                    // if (c.length > 0) {
                    e.native.target.style.cursor = c[0] ? 'pointer' : 'default';

                    let md = chart.getDatasetMeta(0)
                    if (c[0]) {
                        if (c[0].element.options.hoverBorderWidth === STYLE_BASELINE_ITEMS) {
                            e.native.target.style.cursor = 'help';
                        }
                        console.log(1)
                        // e.native.target.style.background = "purple";
                        // e.native.target.style.filter = "grayscale(1)";
                        // e.native.target.style.border = "3px solid #FF0000";
                    }
                    // let point = this.getElementAtEvent(e);
                    // if (point.length) e.target.style.cursor = 'pointer';
                    // else e.target.style.cursor = 'default';

                    // } else {
                    // for (let el of c) {
                    //     el.element.options.pointStyle.style.background = "purple";
                    //     el.element.options.pointStyle.style.filter = "grayscale(1)";
                    //     el.element.options.pointStyle.style.border = "3px solid #FF0000";
                    // }

                    let anyReset = false
                    let anyChanged = false
                    e.chart.config._config.data.datasets.forEach((ds: any, idx: number) => {

                        if (ds.hoverBorderWidth === STYLE_BASELINE_ITEMS) {
                            return;
                        }

                        if (ds.pointStyle.width !== undefined) {

                            // if (d)
                            if (!anyChanged && c.find((el: any) => el.datasetIndex === idx)) {
                                ds.pointStyle.width = 64
                                ds.pointStyle.height = 64
                                ds.order = 2

                                // c[0].element.options.pointStyle.style.opacity = 0.4;
                                // c[0].element.options.pointStyle.style.filter = 'alpha(opacity=40);';

                                anyChanged = true;

                            } else if (ds.pointStyle.width !== 32 && ds.hoverBorderWidth !== 10) {
                                ds.pointStyle.width = 32
                                ds.pointStyle.height = 32
                                ds.pointStyle.className = 32
                                ds.pointStyle.className = "TESTTEST"
                                ds.order = 90
                                //    opacity: 0.4;
                                //     filter: alpha(opacity=40); /* msie */
                                // ds.pointStyle.style.opacity = 0.4;
                                // ds.pointStyle.style.filter = 'alpha(opacity=40);'

                                anyReset = true;
                            }
                            // else if (ds.)
                        }
                    })
                    if ((anyChanged || anyReset) && chartRef.current) {
                        (chartRef.current as any).update()
                    }
                },
                onClick: (e: any, c: any, t: any) => {

                    let selected: any = undefined;
                    for (let el of c) {
                        selected = e.chart.config._config.data.datasets.find((d: any, idx: number) => idx === el.datasetIndex);
                        break;
                    }

                    if (selected && selected.hoverBorderWidth === STYLE_BASELINE_ITEMS) {
                        return;
                    } else {
                        selectItem(selected ? selected.id : undefined, e.chart.config._config.data.datasets)
                    }
                },
                // responsive: true,
                // maintainAspectRatio: false,
// bezierCurve: true,
                plugins: {

                    legend: {
                        display: false
                    },

                    title: {
                        display: false,
                        // text: (ctx: any) => 'Chart.js Line Chart - stacked=' + ctx.chart.options.scales.y.stacked
                    },
                    annotation: {
                        annotations: annotations
                    },
                    tooltip: {
                        intersect: false,
                        mode: 'point',
                        // external: externalTooltipHandler,
                        // position: "nearest",
                        callbacks: {
                            label: function (t: any, d: any) {
                                // return `${t.raw.label} order: ${t.element.options.order}`
                                return `${t.raw.tooltip}`
                                // return `${JSON.stringify({d.datasets[t.datasetIndex]})} 123`
                            }

                            // label: (tooltipItem: any) => {
                            //     return `${tooltipItem.dataset.label} ${tooltipItem.formattedValue}`
                            //     // return `${tooltipItem.dataset.label} ${Math.round((Number(tooltipItem.formattedValue) * 100000)) / 1000}%`
                            //     // return yValFormatted[tooltipItem.dataIndex]
                            // }
                        }


                    },
                },
                // interaction: {
                //     mode: 'nearest',
                //     axis: 'x',
                //     intersect: false
                // },
                scales: {
                    x: {
                        // min: props.x_range ? props.x_range.min : undefined,
                        // max: props.x_range ? props.x_range.max : undefined,

                        title: {
                            display: true,
                            // display: !minimal,
                            text: 'Play Rate'
                        },
                        ticks: {
                            // display: !minimal,
                        },
                        grid: {
                            // display: !minimal,
                            // drawBorder: !minimal,
                        }

                    },
                    y: {
                        // min: 0.45,
                        // max: 0.65,
                        // // min: props.y_range ? props.y_range.min : 0,
                        // max: props.y_range ? props.y_range.max : 1,
                        stacked: false,
                        title: {
                            display: true,
                            text: 'Win Rate'
                        },
                        ticks: {
                            // display: !minimal,
                            // callback: function (label: any, index: any, labels: any) {
                            //     return normalized ? `${Math.round(Number(label) * 100)}%` : `  ${label}  `
                            // }
                        },
                        grid: {
                            // display: !minimal,
                            // drawBorder: !minimal,
                        }

                    }
                },
                elements: {
                    point: {
                        // hoverBorderWidth: function (context: any) {
                        //     return Math.round(159);
                        //     // return Math.round(8 * context.raw.v / 1000);
                        // },


                    },
                    img: {
                        hoverBackgroundColor: "purple"
                    }
                }
            }
        }
        ;
    }

// const plot = <Bar {...config} redraw={true}/>


// let baselineSelectionButtons = [
//     {
//         icon: undefined,
//         label: "None",
//         onClick: () => setSelectedBaseline(undefined),
//         selected: selectedBaseline === undefined
//     },
//     {
//         icon: undefined,
//         disabled: true,
//         label: "All Maps",
//         onClick: () => setSelectedBaseline("all_maps"),
//         selected: selectedBaseline === "all_maps"
//     },
//     {
//         icon: undefined,
//         disabled: true,
//         label: "Elo ",
//         onClick: () => setSelectedBaseline("elo_bracket"),
//         selected: selectedBaseline === "elo_bracket"
//     }
// ]
    let baselineSelectionButtons = [{
        icon: undefined,
        label: "None",
        onClick: () => setSelectedBaseline(undefined),
        selected: selectedBaseline === undefined
    }, ...props.baselineDataProviders.map((d) => {

        return {
            icon: undefined,
            label: d.label,
            onClick: () => setSelectedBaseline(d.key),
            selected: selectedBaseline === d.key
        }
    })]


    const clearSelectedItemKey = () => {
        if (config && chartRef.current) {
            // @ts-ignore
            let ds = chartRef.current.config._config.data.datasets
            selectItem(undefined, ds)
        }
    }

    let selectedItemHeader = <Stack direction={"row"} justifyContent={"space-between"} width={"100%"}>
        <Button onClick={() => clearSelectedItemKey()}>
            Clear
        </Button>
        <Button
            onClick={() => selectedItemKey ? OnSelectTopLevelGridItem(selectedItemKey, props.path.value, props.path.set) : undefined}>
            Show More
        </Button>
    </Stack>

    let overrideType = () => {
        if (selectedItemData !== undefined && selectedItemData.meta_data !== undefined && selectedItemData.meta_data.hasOwnProperty("desc")) {
            let metaData = selectedItemData.meta_data as MetaData
            if (metaData.desc) {
                if (metaData.desc.group_name === "maps" && isDetailsView) {
                    return "map_type_nested"
                }
            }
        }
        return undefined;
    }
    // "map_type_nested"

    let selectedItemData = selectedItemKey ? dataSourceContainer.data.tableGroups.get(selectedItemKey) : undefined
    let selectedItem = (selectedItemData && config && selectedItemKey) ? <GridItem
        independent
        size={{xs: 4, sm: 4, md: 4, lg: 4, xl: 4}}
        vertical={true}
        overrideType={overrideType()}
        headerItems={selectedItemHeader}
        data={selectedItemData}/> : undefined;

    return <Box>
        <Stack>
            <Stack justifyContent={"flex-end"}>
                {props.baselineDataProviders.length > 0 && <ControlItemWithLabel label={"Compare:"}>
                    <DatasetSelectionButtonGroup buttons={baselineSelectionButtons}/>
                </ControlItemWithLabel>}
            </Stack>

            {config && <Stack direction="row" spacing={5}>
                <Box width={"75%"}>
                    {/*// @ts-ignore*/}
                    <Scatter ref={chartRef} {...config}/>
                </Box>
                <Box flexGrow={1} width={isDetailsView ? "28%" : "22%"}>
                    {selectedItem}
                </Box>
                {isDetailsView && <Box width={"5px"}></Box>}
            </Stack>}

            {/*<JSONTree data={dataSource}/>*/}

        </Stack>
    </Box>

}


// export function ObjectScatterPlotForDataTable(props: IDataTableForNewNewDataTable & DataRendererExtensions & IViewInfoExtensions & IPathObjectExtension) {
//
//     return <Box>SCATTER!</Box>
// }
//
