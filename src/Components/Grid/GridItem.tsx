import * as React from 'react';

import {
    IconData,
    MetaData,
    NewDataRow,
    NewDataTable,
    NewDataTableGroupWithSummary,
    PlayerMetaData
} from "../../Data/ModelGenerated";
// import {StatsValueElement} from "../../../../WebApp/src/Components/Other/StatsValueElement";
import {
    Box,
    Card, CardActions,
    CardContent,
    CardHeader,
    CardMedia,
    Grid,
    GridSize,
    makeStyles,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DoubleArrowRoundedIcon from '@mui/icons-material/DoubleArrowRounded';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import {propToPercent} from "../../Utils";
import {ObjectIcon} from "../../UI/ObjectIcon";
import {DataEntry, MatchSample} from "../../../../WebApp/src/Data/StatsViewTypes";
import {ISummaryStat, StatsValueElement} from "../../UI/StatsValueElement";
import {DataItemType} from "../../Data/CheckType";
import styles from "./GridItem.module.scss"
import {useContext} from "react";
import {DataProviderContext} from "../../Internal/DataProvider";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export interface IGridItemProps {

    data: NewDataTableGroupWithSummary
    size?: TGridItemSize
    onSelectItem?: () => void

    independent?: boolean

    vertical?: boolean
    headerItems?: JSX.Element;

    overrideType?: DataItemType

    tall?: boolean
}

export type TGridItemSize = { xs: GridSize, sm: GridSize, md: GridSize, lg: GridSize, xl: GridSize }

const getValueFieldForEntry = (target: NewDataRow, key?: "prop" | "win_rate") => {
    // let val: number = 0.4242;
    let _key = key === undefined ? "win_rate" : key
    return target[_key]
}


const buildChildDataItems = (data: NewDataTableGroupWithSummary) => {
    let childDataItems: [string, NewDataRow][] = [];
    if (!data.hasOwnProperty("lazy")) {
        if (data.tables) {
            let mainTable = data.tables["strategies_table"] as NewDataTable;
            if (mainTable === undefined)
                mainTable = data.tables["civs_table"] as NewDataTable;

            if (mainTable === undefined)
                mainTable = data.tables[Object.keys(data.tables)[0]] as NewDataTable


            if (mainTable !== undefined) {
                childDataItems = Object.keys(mainTable.data).map(function (key) {
                    return [key, mainTable.data[key]];
                });
            }
        }
    }
    childDataItems.sort((a: any, b: any) => getValueFieldForEntry(b[1]) - getValueFieldForEntry(a[1]))
    return childDataItems
}
const genrateSummaryStatsRows = (type: DataItemType, item: NewDataTableGroupWithSummary, baseline?: number) => {
    let summaryStats: ISummaryStat[] = []

    if (type === "civ" || type === "map_type_nested") {
        summaryStats.push({
            label: "Win Rate",
            value: item.win_rate,
            unit: "%",
            baseline: 0.5,
            baselineMagnitude: 0.1
        })
        summaryStats.unshift({
            label: "Play Rate",
            value: item.prop, // propToPercent(item.prop),
            unit: "%",
            // baseline: 1 / Object.keys(data.tableGroups).length, TODO
            baselineMagnitude: 0.5
        })


    } else if (type === "map_type") {
        summaryStats.push({
            label: "Play Rate",
            value: item.prop,// propToPercent(item.prop),
            unit: "%",
            // baseline: 1 / Object.keys(data.tableGroups).length,
            baselineMagnitude: 0.2
        })

    } else if (type === "profile_id") {
        let meta = item.meta_data as PlayerMetaData
        summaryStats.push({
            label: "Latest Elo",
            value: meta.latest_elo,
            unit: undefined,
            total: [0, 3000]
        })

        summaryStats.push({
            label: "Win Rate",
            value: item.win_rate,
            unit: "%",
            baseline: 0.5
        })


    } else if (type === "rating_bin") {

    }

    summaryStats.push({
        label: "Total Games",
        value: item.n,
        unit: ""
    })
    return summaryStats
}


export function GridItemCardContainer(props: {
    size?: TGridItemSize
    onSelectItem?: any,
    content: JSX.Element
    sx?: any
    vertical?: boolean
    tall?: boolean
}) {
    let cardContent = <Card
        className={`${styles.card} ${props.tall ? styles.tall : ""} ${props.vertical ? styles.vertical : styles.horizontal} ${"props.extended" ? "styles.wide" : ""}`}>
        {props.content}

    </Card>
    return cardContent
}

export function GridItemContainer(props: {
    size?: TGridItemSize
    onSelectItem?: any,
    content: JSX.Element
    sx?: any
    tall?: boolean
}) {
    let size: TGridItemSize = props.size ? props.size : {xs: 12, sm: 6, md: 4, lg: 4, xl: 4}

    let cardContent = <GridItemCardContainer {...props} tall={props.tall}/>
    return <Grid item
                 sx={props.sx}
                 className={`${styles.container} ${props.tall ? styles.tall : ""} ${props.onSelectItem ? styles.clickable : ""}`} {...size}
                 onClick={props.onSelectItem}>
        {cardContent}
    </Grid>

}

export function GridItem(props: IGridItemProps) {

    let itemNameLabel: string = props.data.meta_data ? props.data.meta_data.name : "Name Not Found!";
    let itemLabelSubtext = undefined;//"a.k.a placeholder";
    if (props.data.meta_data && props.data.meta_data.hasOwnProperty("profile_id")) {
        let playerMeta = props.data.meta_data as PlayerMetaData;

        let availableNames = playerMeta.names.filter(n => n !== playerMeta.name)
        if (availableNames.length > 0) {
            itemLabelSubtext = `a.k.a ${availableNames.join(", ")}`
        }
    }


    let summaryStats: ISummaryStat[] = [];

    if (props.data.meta_data) {
        // if (props.data.meta_data.hasOwnProperty("desc")) {
        let type: DataItemType

        if (props.overrideType) {
            type = props.overrideType;
        } else {
            if (props.data.meta_data.hasOwnProperty("desc")) {
                let metaData = props.data.meta_data as MetaData
                if (metaData.desc)
                    type = metaData.desc.group_name as DataItemType;
            } else {
                type = "profile_id"
            }
        }
        summaryStats = genrateSummaryStatsRows(type, props.data)
        // }
    }

    let itemLabel = <React.Fragment>
        <Tooltip title={itemNameLabel} className={styles.infoIcon}>
            <InfoOutlinedIcon fontSize="small"/>
        </Tooltip>

        <div className={styles.headerContainer}>
            <Stack>
                <Typography className={styles.header}>{itemNameLabel}</Typography>
                {itemLabelSubtext ? <Typography fontSize={"12px"}>{itemLabelSubtext}</Typography> : <Box height={18}/>}

            </Stack>
        </div>
    </React.Fragment>


    const buildObjectIcon = (key: string, data: NewDataRow, size?: number) => {
        let tooltip = `${key}, Win Rate : ${propToPercent(getValueFieldForEntry(data))}%`

        if (data.meta_data.icon_data) {
            return <ObjectIcon borderless
                               tooltip={{show: true, value: tooltip}}
                               data={data.meta_data.icon_data}
                               size={size ? size : 18}/>
        } else return <div><span>{data.meta_data.name}</span></div>
    }


    let extendedStatsView: JSX.Element | undefined;
    if (true) {
        let staticSample = props.data;


        let childDataItems = buildChildDataItems(staticSample)

        if (childDataItems.length > 0) {
            let childDataItemsFiltered = childDataItems.filter((d) => d[1].n > 5)
            let mostPopularCivs = childDataItemsFiltered.slice(0, Math.min(childDataItemsFiltered.length - 1, 5)).map((d) => buildObjectIcon(d[0], d[1], props.vertical ? 32 : undefined))
            let leastPopularCivs = childDataItemsFiltered.slice(Math.max(childDataItemsFiltered.length - 5, 0)).map((d: [string, any]) => buildObjectIcon(d[0], d[1], props.vertical ? 32 : undefined))

            // @ts-ignore
            let type_label = ""

            let item_desc = ""
            if (props.data.meta_data && props.data.tables) {
                type_label = props.data.tables["civ"] !== undefined ? "Civs" : "Maps"

                if (props.data.meta_data.hasOwnProperty("highest_elo")) {
                    item_desc = ` played by ${props.data.meta_data.name} (in at least 5 games)`
                } else {
                    let meta = props.data.meta_data as MetaData

                    if (type_label === "Civs") {
                        item_desc = ` on ${meta.name}`
                    } else {
                        item_desc = ` for ${meta.name}`
                    }
                }
            }

            if (props.vertical) {

                extendedStatsView = <Stack>
                    <Stack>
                        <Stack marginTop={"10px"} spacing={0}>
                            <Stack direction={"row"} justifyContent={"space-between"}>

                                <Typography>
                                    Best {type_label}
                                </Typography>
                                <KeyboardDoubleArrowUpIcon style={{color: "forestgreen", transform: "scale(-1, 1)"}}
                                                           fontSize={"small"}/>

                            </Stack>
                            <Stack direction={"row"} justifyContent={"space-between"}>
                                {mostPopularCivs}
                            </Stack>
                        </Stack>

                        <Stack marginTop={"10px"} spacing={0}>
                            <Stack direction={"row"} justifyContent={"space-between"}>
                                <Typography>
                                    Worst {type_label}
                                </Typography>
                                <KeyboardDoubleArrowDownIcon style={{color: "red", transform: "scale(-1, 1)"}}
                                                             fontSize={"small"}/>
                            </Stack>
                            <Stack direction={"row"} justifyContent={"space-between"}>
                                {leastPopularCivs}
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            } else {

                extendedStatsView = <div className={styles.civsListContainer}>
                    <div className={styles.civsList}>
                        {mostPopularCivs}
                    </div>

                    <div className={styles.civsListContainerLabelContainer}>
                        {/*<div>Most</div>*/}
                        {/*<div>*/}
                        <DoubleArrowRoundedIcon style={{color: "forestgreen", transform: "scale(-1, 1)"}}
                                                fontSize={"small"}/>
                        {/*</div>*/}
                        <div className={styles.civListTable}>
                            {/*<div>*/}

                            <Tooltip title={`${type_label} with the highest win rate ${item_desc}`}>
                                {/*<React.Fragment>*/}
                                <div className={styles.tooltip}>
                                    <div>Best</div>
                                    {/*</div>*/}
                                    {/*<div>*/}
                                    <div>{type_label}</div>
                                </div>
                                {/*</React.Fragment>*/}
                            </Tooltip>
                            {/*</div>*/}
                            {/*<div>{"TODO"}</div>*/}
                        </div>

                        {/*<div>*/}
                        <DoubleArrowRoundedIcon style={{color: "red"}} fontSize={"small"}/>
                        {/*</div>*/}
                        {/*<div>Least</div>*/}
                    </div>
                    <div className={styles.civsList}>
                        {leastPopularCivs}

                    </div>
                </div>
            }
            // extendedStatsView = <div className={styles.civsListContainer}>
            //     <div className={styles.civsList}>
            //         {mostPopularCivs}
            //     </div>
            //
            //     <div className={styles.civsListContainerLabelContainer}>
            //         {/*<div>Most</div>*/}
            //         {/*<div>*/}
            //         <DoubleArrowRoundedIcon style={{color: "forestgreen", transform: "scale(-1, 1)"}}
            //                                 fontSize={"small"}/>
            //         {/*</div>*/}
            //         <div className={styles.civListTable}>
            //             {/*<div>*/}
            //
            //             <Tooltip title={`${type_label} with the highest win rate ${item_desc}`}>
            //                 {/*<React.Fragment>*/}
            //                 <div className={styles.tooltip}>
            //                     <div>Best</div>
            //                     {/*</div>*/}
            //                     {/*<div>*/}
            //                     <div>{type_label}</div>
            //                 </div>
            //                 {/*</React.Fragment>*/}
            //             </Tooltip>
            //             {/*</div>*/}
            //             {/*<div>{"TODO"}</div>*/}
            //         </div>
            //
            //         {/*<div>*/}
            //         <DoubleArrowRoundedIcon style={{color: "red"}} fontSize={"small"}/>
            //         {/*</div>*/}
            //         {/*<div>Least</div>*/}
            //     </div>
            //     <div className={styles.civsList}>
            //         {leastPopularCivs}
            //
            //     </div>
            // </div>
        }
    }
    let iconData: IconData | undefined;

    if (props.data.meta_data && props.data.meta_data.hasOwnProperty("icon_data")) {
        // @ts-ignore
        iconData = props.data.meta_data.icon_data
    }

    let innerContent: JSX.Element;
    if (props.vertical) {
        let dataContent = <React.Fragment>
            <Stack direction={"column"}>
                {summaryStats.map((stat) => {
                    return <React.Fragment>
                        <Typography variant={"subtitle2"}>{stat.label}</Typography>
                        <Box><StatsValueElement {...stat}/></Box>
                    </React.Fragment>

                })}
            </Stack>
        </React.Fragment>

        innerContent = <Stack justifyContent={"space-between"}>
            <Stack direction={"row"} justifyContent={"space-between"} width={"100%"}>
                <Typography variant={"h5"}>{itemNameLabel}</Typography>
            </Stack>
            <CardContent sx={{padding: "4px"}}>

                <Stack direction={"row"} spacing={2}>
                    <Stack justifyContent={"flex-start"}>
                        <CardMedia className={styles.cardMedia}>

                            <div style={{"width": 100, height: 100}}>
                                {iconData && <ObjectIcon size={100}
                                                         data={iconData}/>}
                                {!iconData && <HelpOutlineIcon sx={{fontSize: 100}}/>}
                            </div>

                        </CardMedia>
                    </Stack>
                    {dataContent}
                </Stack>
                <Stack>
                    {extendedStatsView}
                </Stack>
            </CardContent>

            <CardActions>
                {/*<Stack direction={"row"}>*/}
                {props.headerItems}
                {/*</Stack>*/}
            </CardActions>

        </Stack>
    } else {
        let dataContent = <React.Fragment>
            <div>
                <table className={styles.detailsTable}>
                    {summaryStats.map((stat) => {
                        return <tr>
                            <td>{stat.label}</td>
                            <td><StatsValueElement {...stat}/></td>
                        </tr>

                    })}
                </table>
            </div>
        </React.Fragment>

        innerContent = <React.Fragment>
            <div className={styles.cardMain}>
                <div className={styles.iconContainer}>
                    {props.headerItems}
                    <CardMedia className={styles.cardMedia}>

                        <div style={{"width": 100, height: 100}}>
                            {iconData && <ObjectIcon size={100}
                                                     data={iconData}/>}
                            {!iconData && <HelpOutlineIcon sx={{fontSize: 100}}/>}
                        </div>


                    </CardMedia>
                </div>
                <div className={styles.cardContent}>{itemLabel}{dataContent}</div>
            </div>


            {extendedStatsView}
        </React.Fragment>
    }
    if (props.independent) {
        return <GridItemCardContainer size={props.size}
                                      tall={props.tall}
                                      vertical={props.vertical}
                                      onSelectItem={props.onSelectItem}
                                      content={innerContent}/>
    } else {
        return <GridItemContainer size={props.size}
                                  tall={props.tall} onSelectItem={props.onSelectItem}
                                  content={innerContent}/>
    }
}