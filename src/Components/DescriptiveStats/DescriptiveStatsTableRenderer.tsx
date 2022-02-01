import JSONTree from "react-json-tree";
import {
    DescriptiveStatsTable,
    DescriptiveStatsValue,
    DescriptiveStatsView,
    IconData,
    MetaData,
    MissingValue
} from "../../Data/ModelGenerated";
import {DataTableWrapper} from "../Table/DataTableWrapper";
import * as React from "react";
import {useMemo, useState} from "react";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

import styles from "./DescriptiveStatsTableRenderer.module.scss"

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ClearIcon from '@mui/icons-material/Clear';
import SubjectIcon from '@mui/icons-material/Subject';
import {ButtonGroup, Grid, IconButton, Menu, MenuItem, Stack, Tooltip, Typography} from "@mui/material";
import {propToPercent} from "../../Utils";
import {ObjectIcon} from "../../UI/ObjectIcon";
import {LinePlotSeries, TimeSeriesLinePlot} from "../TimeSeriesLinePlot";
import {DatasetSelectionButtonGroup, IToggleButtonGroupButtonData} from "./DatasetSelectionButtonGroup";

const FIXED_Y_MAX = 0.05;

export interface IDescriptiveStatsTableRendererProps {

    table: DescriptiveStatsTable
}


interface AnalyticsStatsData {

}

const GetGamePeriodMinuteLabel = (range: [number, number], ew?: boolean) => {

//    TODO EW
    let minutesLabel: string
    let [start, end] = range

    if (start === 5) {
        minutesLabel = `before minute ${end}`
    } else if (end < 100) {
        minutesLabel = `between min ${start} and ${end}`
    } else {
        minutesLabel = `after min ${start}`
    }

    let periodLabel: string | undefined;

    if (start <= 20 && end <= 20) {
        periodLabel = "Early game"
    } else if (start <= 20 && end <= 40) {
        periodLabel = "Early to mid game"
    } else if (start >= 20 && end <= 40) {
        periodLabel = "Mid game"
    } else if (start <= 20 && end >= 40) {
        periodLabel = "Before late game"
    } else if (start <= 40 && end <= 60) {
        periodLabel = "Mid to late game"
    } else if (start >= 40 && end <= 60) {
        periodLabel = "Late game"
    } else if (start <= 40 && end <= 90) {
        periodLabel = "Mid to very late game"
    } else if (start <= 60 && end <= 90) {
        periodLabel = "Late to very late game"
    } else if (start >= 60 && end <= 90) {
        periodLabel = "Very late game"
    } else if (start <= 60) {
        periodLabel = "Late to extra late game"
    } else if (start <= 90) {
        periodLabel = "Very late to extra late game"
    } else if (start >= 90) {
        periodLabel = "Extra late game"
    }

    if (periodLabel) {
        return `${periodLabel} (${minutesLabel})`
    } else {
        return minutesLabel
    }
}


function BuildAnalyticsStats(props: { table: DescriptiveStatsTable }) {
// "All" , "Only Won", "Only Lost"
//     let onlyWonSeries
    try {
        let all: DescriptiveStatsView = props.table.data_views["All"] as DescriptiveStatsView
        let onlyWon: DescriptiveStatsView = props.table.data_views["Only Won"] as DescriptiveStatsView
        let onlyLost: DescriptiveStatsView = props.table.data_views["Only Lost"] as DescriptiveStatsView


        let rangeValsWonMore: number[] = []
        let rangeValsLostMore: number[] = []

        for (let i = 0; i < all.x_values.length; i++) {
            let x = all.x_values[i];
            if (onlyWon.y_values[i] > onlyLost.y_values[i]) {
                rangeValsWonMore.push(x)
            } else {
                rangeValsLostMore.push(x)
            }
        }

        const getRanges = (source: number[]) => {
            let _winMoreRanges = source.reduce((r: number[][], n: number) => {
                const lastSubArray = r[r.length - 1];

                if (!lastSubArray || lastSubArray[lastSubArray.length - 1] !== n - 1) {
                    let temp: number[] = []
                    r.push(temp);
                }

                r[r.length - 1].push(n);

                return r;
            }, []);
            return _winMoreRanges
        }

        const calcWinRateForRange = (rangeXVals: number[]) => {
            let start = rangeXVals[0]
            let end = rangeXVals[rangeXVals.length - 1]

            let allValsSum = all.y_values.filter((y, ix) => all.x_values[ix] >= start && all.x_values[ix] <= end).reduce((sum, v) => sum + v, 0);
            let allTargetValsSum = onlyWon.y_values.filter((y, ix) => onlyWon.x_values[ix] >= start && onlyWon.x_values[ix] <= end).reduce((sum, v) => sum + v, 0);


            let allValsCount = all.count.value * allValsSum
            let targetValsCount = onlyWon.count.value * allTargetValsSum

            if (allValsCount <= 1 || targetValsCount <= 1) {
                return NaN;
            }
            let winRate = (1 / (allValsCount)) * (targetValsCount)

            // console.log(`winRate : ${winRate} targetIndex range: ${JSON.stringify(rangeXVals)} allValsCount: ${JSON.stringify(allValsCount)} targetValsCount: ${JSON.stringify(targetValsCount)}`)

            return winRate
        }

        const LineWrapper = (content: string) => {
            return <Typography variant={"body2"}>
                - {content}
            </Typography>
        }

        //Finds absolute best and worst ranges by compare KDE series diff
        const getBestWorstRanges = () => {


            let kdeDiff = onlyWon.y_values.map((yWon, ii) => yWon - onlyLost.y_values[ii])

            const getMinMax = (max: boolean, values: number[]) => {

                let targetValue = max ? Math.max(...values) : Math.min(...values)
                let targetIndex = values.indexOf(targetValue)

                let currentMean = 0, nextMean = 0, ix = 0, propAllGamesInRange = 0;
                let currentRange: [number, number] = [targetIndex, targetIndex];
                let dontStop = true;
                while (dontStop) {

                    let testRange: [number, number] = [...currentRange]

                    testRange = [testRange[0] - 1, testRange[1] + 1]

                    if (testRange[0] < 0 || testRange[1] === values.length) {
                        break;
                    } else if (ix > 1) {
                        nextMean = calcWinRateForRange(testRange)
                        currentMean = calcWinRateForRange(currentRange)
                    }
                    currentRange = [...testRange]
                    propAllGamesInRange = all.y_values.slice(currentRange[0], currentRange[1]).reduce((sum, v) => sum + v, 0);

                    dontStop = max ? nextMean >= currentMean : nextMean <= currentMean;


                    ix++;
                }

                return {range: currentRange, meanWinRate: currentMean, prop: propAllGamesInRange}
            }

            let absMax = getMinMax(true, kdeDiff)
            let absMin = getMinMax(false, kdeDiff)

            const indexToX = (idxRange: [number, number], xVals: any[]) => {
                return xVals.slice(idxRange[0], idxRange[1])
            }


            // @ts-ignore
            absMax = {...absMax, range: indexToX(absMax.range, all.x_values)}
            // @ts-ignore
            absMin = {...absMin, range: indexToX(absMin.range, all.x_values)}

            return {
                max: absMax,
                min: absMin
            }
        }

        let winMoreRanges = getRanges(rangeValsWonMore)
        let winLessRanges = getRanges(rangeValsLostMore)

        const pronoun = {single: "You", dative: "Your"}

        pronoun.single = props.table.label

        const buildRangeData = (_ranges: number[][], max?: "best" | "worst") => {

            let rangesData = _ranges.map((range) => {

                let start = range[0]
                let end = range[range.length - 1]

                if ((end - start) < 5)
                    return undefined

                let all_won_y_vals = onlyWon.y_values.filter((y, ix) => onlyWon.x_values[ix] >= start && onlyWon.x_values[ix] <= end)
                let all_lost_y_vals = onlyWon.y_values.filter((y, ix) => onlyWon.x_values[ix] >= start && onlyWon.x_values[ix] <= end)
                let all_y_vals = all.y_values.filter((y, ix) => all.x_values[ix] >= start && all.x_values[ix] <= end)

                let propOfWonMatches = all_won_y_vals.reduce((sum, v) => sum + v, 0);
                let propOfAllMatches = all_y_vals.reduce((sum, v) => sum + v, 0);
                // let winRate = 1 / all_y_vals.length * all_won_y_vals.length

                let totalMatchesInPeriod = propOfAllMatches * all.count.value
                let totalWonMatchesInPeriod = propOfWonMatches * onlyWon.count.value

                if (totalMatchesInPeriod < 10)
                    return undefined

                let winRate = (1 / (totalMatchesInPeriod)) * (totalWonMatchesInPeriod)


                let contentText: string = "MISSING";
                if (max === undefined) {
                    let minutesLabel = GetGamePeriodMinuteLabel([start, end], false);
                    contentText = `${minutesLabel}, win rate: ${propToPercent(winRate, 2)}%, total games: ${Math.round(totalMatchesInPeriod)}`
                } else {
                    let minutesLabel: string

                    if (start === 5) {
                        minutesLabel = `Before minute ${end}`
                    } else if (end < 100) {
                        minutesLabel = `Between minutes ${start} and ${end}`
                    } else {
                        minutesLabel = `After minute ${start}`
                    }

                    if (max === "best") {
                        contentText = `${pronoun.dative} absolute best* period is ${minutesLabel.toLowerCase()} when ${pronoun.dative} win rate rises to ${propToPercent(winRate, 2)}% (total games: ${Math.round(totalMatchesInPeriod)})`

                    } else if (max === "worst") {
                        contentText = `${pronoun.dative} absolute worst* period is ${minutesLabel.toLowerCase()} when ${pronoun.dative} win rate falls to ${propToPercent(winRate, 2)}% (total games: ${Math.round(totalMatchesInPeriod)})`
                    }
                }

                return {
                    content: <Box>
                        {LineWrapper(contentText)}
                    </Box>,
                    data: {}
                }

            });

            let r = rangesData.filter(r => r !== undefined) as { content: JSX.Element, data: any }[]
            return r;
        }

        let bestRangesData = buildRangeData(winMoreRanges)
        let worstRangesData = buildRangeData(winLessRanges)

        // let absBestRangesData = buildRangeData([[10,15]])
        // let absWorstRangesData = buildRangeData([[10,15]])
        // let {bestWinRange, worstLoseRange} = getBestWorstRanges()
        // let absBestRangesData = undefined;// buildRangeData(bestWinRange)
        // let absWorstRangesData = undefined;// buildRangeData(worstLoseRange)


        let absBestWorst = getBestWorstRanges();


        let absWorstRangesData = buildRangeData([[absBestWorst.min.range[0], absBestWorst.min.range[absBestWorst.min.range.length - 1]]], "worst")
        let absBestRangesData = buildRangeData([[absBestWorst.max.range[0], absBestWorst.max.range[absBestWorst.max.range.length - 1]]], "best")

        return <Box>
            {/*<div>*/}
            {/*    WORST BEST:*/}
            {/*</div>*/}
            {/*<div>{JSON.stringify(getBestWorstRanges(), null, 2)}</div>*/}
            {/*<div>-</div>*/}
            <Typography variant={"body1"}>{pronoun.single} tend to do best:</Typography>
            {bestRangesData.map(l => <Box>{l.content}</Box>)}
            {absBestRangesData.map(l => <Box>{l.content}</Box>)}


            {/*<Typography>Your bestestest period is</Typography>*/}
            {/*{absBestRangesData.map(l => <Box>{l.content}</Box>)}*/}
            <br/>

            <Typography variant={"body1"}>And Worst:</Typography>
            {worstRangesData.map(l => <Box>{l.content}</Box>)}
            {absWorstRangesData.map(l => <Box>{l.content}</Box>)}

            {/*<Typography>Your worstestest period is</Typography>*/}
            {/*{absWorstRangesData.map(l => <Box>{l.content}</Box>)}*/}

            {/*<Typography>KDE Sum:</Typography>*/}
            {/*<div>Won : {onlyWon.y_values.reduce((sum, v) => sum + v, 0)}</div>*/}
            {/*<div>Lost : {onlyLost.y_values.reduce((sum, v) => sum + v, 0)}</div>*/}
            {/*<div>All : {all.y_values.reduce((sum, v) => sum + v, 0)}</div>*/}
            {/*<Typography>{JSON.stringify(winMoreRanges, null, 2)}</Typography>*/}
            {/*<Typography>Only Won y: {JSON.stringify(onlyWon.y_values, null, 2)}</Typography>*/}
            {/*<Typography>Only Lost y: {JSON.stringify(onlyLost.y_values, null, 2)}</Typography>*/}
            <br/>
            <br/>
            <Typography variant={"subtitle2"}>* TODO </Typography>
            <Typography variant={"subtitle2"}>TODO (only when civ picked) </Typography>
            <Typography variant={"subtitle2"}>X civ is ${pronoun.dative} 10th best civ </Typography>

            <Typography variant={"subtitle2"}>Show standard best/worst </Typography>

            <Typography variant={"subtitle2"}>Compare most different period with civ X vs all civs </Typography>
        </Box>
    } catch {
        return <Box>
            <Typography>Could not build table</Typography>
        </Box>
    }
}


interface IBaselinePickerButtonGroupProps {
    mode: "all" | "filtered"
}

const getUniqueIconGroupKeys = (table: DescriptiveStatsTable) => {

    let all: DescriptiveStatsView = table.data_views["All"] as DescriptiveStatsView
    let filterGroups: { [viewGroup: string]: { [key: string]: MetaData & { disabled: boolean } } } = {}

    for (let viewGroup of Object.keys(all.filtered_views)) {


        filterGroups[viewGroup] = {}
        for (let viewKey of Object.keys(all.filtered_views[viewGroup])) {

            let view = all.filtered_views[viewGroup][viewKey]


            let disabled = view.hasOwnProperty("reason");
            // let viewData = view as DescriptiveStatsView;

            if (filterGroups[viewGroup][viewKey] === undefined && view.meta_data) {
                filterGroups[viewGroup][viewKey] = {...view.meta_data, disabled: disabled}
            }
        }
    }


    return filterGroups
}

const DescriptiveStatsStatsTable = (props: { data: DescriptiveStatsView, filteredData?: DescriptiveStatsView }) => {

    let data = props.filteredData ? props.filteredData : props.data;
    let benchmarkData = props.filteredData ? props.data : undefined;

    const getValue = (k: string, targetObj: DescriptiveStatsView) => {
        // @ts-ignore

        let item: any | DescriptiveStatsValue = targetObj[k]

        if (item.hasOwnProperty("value")) {
            return item as DescriptiveStatsValue;
        }
        return undefined

    }

    const LABELS_MAP = {
        // "min" : "1st Quartile",
        "q1": "1st Quartile",
        "median": "Median Duration",
        "mean": "Mean Duration",
        "q3": "3rd Quartile",
        "max": "Longest Game",
        "count": "Sample Count",
    }

    let itemNameVariant = "subtitle2"
    let itemValueVariant = "body1"
    let itemBenchVariant = "body2"

    let lines = Object.keys(LABELS_MAP).map((k, i) => {
        let dataItem = getValue(k, data);
        let benchItem = benchmarkData ? getValue(k, benchmarkData) : undefined;

        // @ts-ignore
        let labelName = LABELS_MAP[k] as string;

        if (dataItem) {
            let benchLabel: undefined | JSX.Element;

            if (benchItem) {
                let diff = dataItem.value - benchItem.value;
                let value = Math.round(diff * 10) / 10;
                let valueStr = `(${value > 0 ? "+" : ""}${value})`;
                let tooltipLabel = `${labelName} only for games played with ${props.filteredData?.meta_data.name}: ${dataItem.value}min (for all : ${benchItem.value}min)`

                benchLabel = <Tooltip title={tooltipLabel}>

                    <Typography
                        // @ts-ignore
                        variant={itemBenchVariant}
                        sx={{
                            marginLeft: "5px",
                            color: diff > 0 ? "red" : diff < 0 ? "green" : undefined
                        }}>{valueStr}</Typography>
                </Tooltip>
                // benchLabel = `  (${JSON.stringify(benchItem.value)})  -> (${value > 0 ? "+" : ""}${value})`
                // benchLabel = ` (${value > 0 ? "+" : ""}${value}) `

            }
            //
            return <Box sx={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                <Box sx={{display: "flex", justifyContent: "space-between", flexGrow: "1", marginRight: "10px"}}>
                    {/*// @ts-ignore*/}
                    <Typography variant={itemNameVariant}>{labelName}</Typography>
                    {/*// @ts-ignore*/}
                    <Typography variant={itemValueVariant}>{dataItem.value}{dataItem.unit}</Typography>
                    {/*<Typography sx={{width: "50px", marginRight: "25px"}}>{k}</Typography>*/}
                    {/*<Typography sx={{width: "60px", marginRight: "10px"}}>{dataItem.value}min</Typography>*/}
                </Box>
                {benchLabel && <Box sx={{minWidth: "75px", width: "75px", cursor: "help"}}>
                    {benchLabel}
                </Box>}
            </Box>
        }
        return undefined
    })

    return <Box sx={{padding: "5px"}}>
        {/*{lines}*/}
        {lines.filter((v) => v !== undefined)}
    </Box>

}

interface ObjectIconMenuProps {

    disabled?: boolean

    selectedItem: { value: string | false, set: (key: string | false) => void }

    label: string,
    views: { [key: string]: DescriptiveStatsView | MissingValue }
}

interface IObjectIconOrDefaultGroupButtonProps {
    onClick: any
    onClear: () => void
    disabled?: boolean
    target: IconData | undefined
    defaultLabel: string
    tooltip?: string
}

const ObjectIconOrDefaultGroupButton = (props: IObjectIconOrDefaultGroupButtonProps) => {

    let args = {
        className: styles.ObjectIconOrDefaultGroupButton,
        endIcon: <KeyboardArrowDownIcon/>, onClick: props.onClick, disabled: props.disabled
    }

    let tooltip = props.tooltip ? {show: true, value: props.tooltip} : undefined
    if (props.target) {

        let item = <ObjectIcon borderless={true}
                               size={30}
                               tooltip={tooltip}
                               data={props.target}/>

        args.endIcon = <IconButton size={"small"} onClick={(ev) => {
            props.onClear()
            ev.stopPropagation();
            ev.nativeEvent.stopImmediatePropagation();

        }}> <ClearIcon/></IconButton>

        // @ts-ignore
        // return <Box {...args}>{item}</Box>
        // return <IconButton {...args} >{item}</IconButton>
        return <Button {...args} startIcon={item}/>
    } else {
        return <Button {...args}>
            {props.defaultLabel}
        </Button>
    }


}

const ObjectIconMenu = (props: ObjectIconMenuProps) => {
    // const [open, setOpen] = useState(false)

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const selectItem = (key: string | false) => {

        handleClose()

        if (!props.disabled)
            props.selectedItem.set(key)
    }

    const BuildMenuItemForObject = (key: string, target: MissingValue | DescriptiveStatsView) => {
        let iconData = target.meta_data?.icon_data

        let disabled = target.hasOwnProperty("reason")


        return <MenuItem onClick={() => {
            selectItem(key)
        }}
                         disabled={disabled}>
            <Box sx={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                <Box>
                    {iconData && <ObjectIcon borderless={true} data={iconData}/>}
                </Box>
                <Box marginLeft={"5px"}>
                    <Typography>{target.meta_data?.name ? target.meta_data?.name : key}</Typography>
                </Box>
            </Box>
        </MenuItem>
    }


    const menu = <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
            style: {
                maxHeight: 400,
                // width: '20ch',
            },
        }}
        MenuListProps={{
            'aria-labelledby': 'basic-button',
        }}
    >
        {Object.keys(props.views).map((k, idx) => BuildMenuItemForObject(k, props.views[k]))}
    </Menu>

    const getButtonForGroup = (groupKey: string, selected: string | false) => {

        // let content = `${groupKey} [${selected}]`;
        // let args = {endIcon: <KeyboardArrowDownIcon/>, onClick: handleClick, disabled: props.disabled}
        // if (selected) {
        //     let iconData = props.views[selected].meta_data?.icon_data;
        //
        //     let item = iconData ? <ObjectIcon borderless={true}
        //                                       tooltip={{show: true, value: props.views[selected].meta_data?.name}}
        //                                       data={iconData}/> : selected;
        //
        //     // @ts-ignore
        //     return <Box {...args}>{item}</Box>
        // } else {
        //     return <Button {...args}>
        //         {groupKey}
        //     </Button>
        // }

        let tooltip = selected ? `${props.views[selected].meta_data?.name}` : undefined;
        let iconData = selected ? props.views[selected].meta_data?.icon_data : undefined;
        return <ObjectIconOrDefaultGroupButton onClick={handleClick}
                                               onClear={() => {
                                                   props.selectedItem.set(false)
                                               }}
                                               disabled={props.disabled} target={iconData}
                                               defaultLabel={groupKey}
                                               tooltip={tooltip}/>
    }

    return <React.Fragment>
        {getButtonForGroup(props.label, props.selectedItem.value)}
        {menu}
    </React.Fragment>
    // return <Button endIcon={<KeyboardArrowDownIcon/>}>
    //     {groupKey}
    //     <ObjectIconMenu/>
    // </Button>

}

type TSelectedFilterItems = { [key: string]: false | string }

interface IFilterDatasetControlsProps {

    selected: { value: TSelectedFilterItems, set: (value: TSelectedFilterItems) => void }
    table: DescriptiveStatsTable
}

const FilterDatasetControls = (props: IFilterDatasetControlsProps) => {

    const all: DescriptiveStatsView = props.table.data_views["All"] as DescriptiveStatsView

    if (all.filtered_views) {

        const cuts = Object.keys(all.filtered_views).filter(k => Object.keys(all.filtered_views[k]).length > 1)

        const selectedFilterItems = props.selected.value;
        const setSelectedFilterItems = props.selected.set;


        const getDisabled = (groupKey: string) => {

            let anySet = Object.values(selectedFilterItems).find(v => v !== false)
            if (anySet) {
                return selectedFilterItems[groupKey] === false;
            }
            return false
        }

        const getIconMenuFor = (groupKey: string, views: { [key: string]: DescriptiveStatsView | MissingValue }) => {
            return <ObjectIconMenu
                disabled={getDisabled(groupKey)}
                selectedItem={{
                    value: selectedFilterItems[groupKey],
                    set: (val) => {
                        const cp = {...selectedFilterItems}
                        cp[groupKey] = val
                        setSelectedFilterItems(cp)
                    }
                }} label={groupKey} views={views}/>
        }


        return <Box sx={{display: "flex", alignItems: "center"}}>
            {/*<Typography>{JSON.stringify(selectedFilterItems, null, 3)} </Typography>*/}
            <ButtonGroup variant={"outlined"} color={"info"}>
                {cuts.map((key, idx) => getIconMenuFor(key, all.filtered_views[key]))}
            </ButtonGroup>
        </Box>
    }
    return <Box>Missing View</Box>
}

export const ControlItemWithLabel = (props: { children: JSX.Element | JSX.Element[], label?: string }) => {

    let label = props.label ?
        <Typography variant="overline" sx={{marginRight: "1rem"}}>{props.label}</Typography> : undefined;
    return <Box sx={{display: "flex", flexDirection: "column"}} className={styles.ControlItemWithLabelWrapper}>
        {label}
        <Box>
            {props.children}
        </Box>
    </Box>

}

export const MissingValueBox = (props: {}) => {
    return <Box sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }}>
        <Box sx={{marginBottom: "100px"}}>
            <Typography align="center" color="disabled.main" component="h6" variant="h6">Not Enough
                Data</Typography>
            <Typography align="center" sx={{color: "disabled.main"}} variant="subtitle1">At least 20
                games
                required</Typography>
        </Box>
    </Box>
}

export function DescriptiveStatsTableRenderer(props: IDescriptiveStatsTableRendererProps) {
    let all: DescriptiveStatsView = props.table.data_views["All"] as DescriptiveStatsView

    if (all.filtered_views === undefined) {
        return <Box>Missing Data <JSONTree data={props}/></Box>
    }
    return <_DescriptiveStatsTableRenderer {...props}/>
}

function _DescriptiveStatsTableRenderer(props: IDescriptiveStatsTableRendererProps) {

    // return <JSONTree data={props.table}/>

    const [focusedDataset, setFocusedDataset] = useState<string | undefined>("All")
    let all: DescriptiveStatsView = props.table.data_views["All"] as DescriptiveStatsView


    const cuts = Object.keys(all.filtered_views)

    const getDefaultSelectedFilterItemState = () => {
        let s: { [key: string]: string | false } = {}
        for (let k of cuts) {
            s[k] = false
        }
        return s
    }

    const [selectedFilterItems, setSelectedFilterItems] = useState(getDefaultSelectedFilterItemState())

    let optionDep = Object.keys(props.table.data_views).length

    const filterValuesMetaData = useMemo(() => getUniqueIconGroupKeys(props.table), [optionDep]);

    const [_selectedBaseline, setSelectedBaseline] = useState<string | undefined>("full_dataset")


    const DEFAULT_COLORS = {
        // "All" : "primary",
        "Only Won": "green",
        "Only Lost": "red"
    }

    const DEFAULT_ICONS = {
        "All": <SubjectIcon/>,
        "Only Won": <EmojiEventsIcon/>,
        "Only Lost": <ArrowDownwardIcon/>
    }

    let buttons: IToggleButtonGroupButtonData[] = []

    let analysisTable = <Box>
        <BuildAnalyticsStats table={props.table}/>
    </Box>

    // let analysisTable = <Card>
    //     <div>
    //         <div>Analysis</div>
    //         <div>TODO</div>
    //         {/*<div>Early Game, before minute 17 your win rate is XX%</div>*/}
    //         {/*<div>Late Game, after minute 38 your win rate is XX%</div>*/}
    //         {/*<div>You tend to struggle:</div>*/}
    //         {/*<div>Mid Game, between minute 21 and minute 38 you only win XX% of your games</div>*/}
    //         {/*<div>You win RH% of your games in this period, TG% more than an average player in your ELO range.</div>*/}
    //
    //         {/*<div>Best Civs</div>*/}
    //         {/*<div>Your best [periods are]</div>*/}
    //         {/*<div>Cumans min XY - ZV (WR% win rate)</div>*/}
    //         {/*<div>Huns min XY - ZV (WR% win rate)</div>*/}
    //         {/*<div>Asstecs min XY - ZV (WR% win rate)</div>*/}
    //
    //         {/*<div>Worst Civs</div>*/}
    //         {/*<div>Your best [periods are]</div>*/}
    //         {/*<div>Chinese min XY - ZV (WR% win rate)</div>*/}
    //         {/*<div>Smth XY - ZV (WR% win rate)</div>*/}
    //         {/*<div>Smth min XY - ZV (WR% win rate)</div>*/}
    //
    //         {/*<div> TODO CIV NAMES SHOULD BE CLICKABLE LINKS THAT SET FILTER TO CIV</div>*/}
    //         {/*<div> TODO Same for maps and make a toggle button to switch</div>*/}
    //
    //         {/*<div>*only civs with +20 games included</div>*/}
    //
    //     </div>
    // </Card>
    const focusedDatasetDataAll: DescriptiveStatsView | undefined = props.table.data_views[focusedDataset ? focusedDataset : "All"].hasOwnProperty("reson") ? undefined : props.table.data_views[focusedDataset ? focusedDataset : "All"] as DescriptiveStatsView;

    const selectedFilterViewGroup = Object.keys(selectedFilterItems).find(k => selectedFilterItems[k] !== false);
    const selectedFilterViewItem = selectedFilterViewGroup ? selectedFilterItems[selectedFilterViewGroup] : undefined

    let notEnoughData = false;
    let focusedDatasetData: DescriptiveStatsView | undefined;
    if (selectedFilterViewItem && focusedDatasetDataAll) {
        if (selectedFilterViewGroup) {
            let dataTemp = focusedDatasetDataAll.filtered_views[selectedFilterViewGroup][selectedFilterViewItem];
            focusedDatasetData = dataTemp.hasOwnProperty("mean") ? dataTemp as DescriptiveStatsView : undefined;
            notEnoughData = focusedDatasetData === undefined;
        }
    }

    const selectedBaseline = _selectedBaseline === "full_dataset" && focusedDatasetData === undefined ? undefined : _selectedBaseline;

    let seriesInitial: LinePlotSeries[] = Object.keys(props.table.data_views).filter((k) =>
        !props.table.data_views[k].hasOwnProperty('reason')).map((key, ix) => {
        let data = props.table.data_views[key] as DescriptiveStatsView

        let icon = DEFAULT_ICONS.hasOwnProperty(key) ?
            // @ts-ignore
            DEFAULT_ICONS[key] :
            <SubjectIcon/>

        buttons.push({
            label: key,
            icon: icon,
            onClick(): void {
                setFocusedDataset(key)
            },
            selected: key === focusedDataset
        })

        let y_values: number[] | undefined;
        let baseline: number[] | undefined;

        if (selectedFilterViewItem && selectedFilterViewGroup) {
            let item = data.filtered_views[selectedFilterViewGroup][selectedFilterViewItem];
            if (!item.hasOwnProperty("reason")) {
                y_values = (item as DescriptiveStatsView).y_values;
                if (selectedBaseline === "full_dataset") {
                    baseline = data.y_values;
                }
            } else {
                y_values = undefined;
            }
        } else {
            y_values = data.y_values;
        }
        return {
            id: ix,
            label: data.meta_data ? data.meta_data.name : key,
            data: y_values,
            baseline: baseline,
            borderColor: key === focusedDataset ? (DEFAULT_COLORS.hasOwnProperty(key) ?
                // @ts-ignore
                DEFAULT_COLORS[key]
                : "primary") : undefined
        }
    })

    const series = seriesInitial.filter((s) => s !== undefined) as LinePlotSeries[]
    const y_max_vals = Math.max(...series.filter(s => s.data !== undefined).map(s => s.data as number[]).flat())
    const y_max_baseline = Math.max(...series.filter(s => s.baseline !== undefined).map(s => s.data as number[]).flat())

    const y_max = Math.max(y_max_baseline, y_max_vals, FIXED_Y_MAX)


    const noneBaselineButton: IToggleButtonGroupButtonData = {
        icon: undefined,
        label: "None",
        onClick: () => setSelectedBaseline(undefined),
        selected: selectedBaseline === undefined
    }
    const otherPlayersBaselinesButton: IToggleButtonGroupButtonData = {
        icon: undefined,
        disabled: true,
        label: "All Players (WIP)",
        onClick: () => setSelectedBaseline("other_players"),
        selected: selectedBaseline === "other_players"
    }

    let baselineSelectionButtons: IToggleButtonGroupButtonData[] = [noneBaselineButton, otherPlayersBaselinesButton]
    if (focusedDatasetData) {
        baselineSelectionButtons.push({
            icon: undefined,
            label: `All ${selectedFilterViewGroup === "civ" ? "Civs" : "Maps"}`,
            onClick: () => setSelectedBaseline("full_dataset"),
            selected: selectedBaseline === "full_dataset"
        })
    }

    return <Box>
        <DataTableWrapper title={props.table.label}>
            <Grid container spacing={2} sx={{
                // height: 400,
                padding: "5px"
            }}>
                <Grid item xs={8} md={8}>
                    <Stack justifyContent="flex-start" direction="row" spacing={4}>

                        <ControlItemWithLabel label={"Filter by:"}>
                            <FilterDatasetControls
                                selected={{value: selectedFilterItems, set: setSelectedFilterItems}}
                                table={props.table}/>
                        </ControlItemWithLabel>
                        <ControlItemWithLabel label={"Baseline:"}>
                            <DatasetSelectionButtonGroup buttons={baselineSelectionButtons}/>
                        </ControlItemWithLabel>
                    </Stack>
                    {/*<Box sx={{height: "40px"}}/>*/}
                    <TimeSeriesLinePlot x_vals={all.x_values}
                                        series={series}
                                        y_range={{min: 0, max: Math.round((y_max + 0.015) * 1000) / 1000}}
                                        x_range={{min: 0, max: 100}}
                    />
                </Grid>
                <Grid item xs={4} md={4}>
                    <Stack direction="row" spacing={2}>
                        <ControlItemWithLabel label={"Show Stats For:"}>
                            <DatasetSelectionButtonGroup buttons={buttons}/>
                        </ControlItemWithLabel>
                    </Stack>
                    {!notEnoughData && focusedDatasetDataAll && <DescriptiveStatsStatsTable
                        data={focusedDatasetDataAll}
                        filteredData={focusedDatasetData}/>}
                    {notEnoughData &&
                        <MissingValueBox/>}
                </Grid>

                <Grid item xs={12} md={12}>
                    {analysisTable}
                </Grid>
            </Grid>
            <span>{y_max}</span>
            <JSONTree data={props.table}/>

            <div></div>
            <div></div>
            <div></div>
            <div></div>

            <div>filterValuesMetaData:</div>

        </DataTableWrapper>


        <Box>
            <div><JSONTree data={filterValuesMetaData}/></div>
        </Box>
    </Box>
}