import React, {useState} from 'react';
import {DEFINES} from "../Data/Defines";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {IconData, IconGroup} from "../Data/ModelGenerated";
import Paper from "@mui/material/Paper";
import Badge from "@mui/material/Badge";
import {Tooltip} from '@mui/material';

import styles from "./ObjectIcon.module.scss"
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

export enum ObjectIconTypesEnum {
    Research = "researchEvents",
    Strategy = "playerStrategies",
    CustomEvent = "customEvents",
    PlacedBuilding = "placedBuildingEvents",
    QueuedUnit = "queuedUnitsEvents",
    Civ = "civilizations",
    Object = "objects"
}

export function GetLabelForType(type: ObjectIconTypesEnum) {
    if (type === ObjectIconTypesEnum.Research) {
        return "Tech"
    }
    if (type === ObjectIconTypesEnum.Strategy) {
        return "Strategies"
    }
    if (type === ObjectIconTypesEnum.CustomEvent) {
        return "Other"
    }
    if (type === ObjectIconTypesEnum.PlacedBuilding) {
        return "Buildings"
    }
    if (type === ObjectIconTypesEnum.QueuedUnit) {
        return "Units"
    }
    return "UNDEFINED"
}

export type ObjectIconTypesEnumKeys = keyof typeof ObjectIconTypesEnum
export type TypeMap = { [P in ObjectIconTypesEnumKeys]: string; } // will have strongly typed keys


// export const FALLBACK_ICONS = {ObjectIconTypesEnum.Research : "234"}

export const FALLBACK_ICONS = {
    "researchEvents": ShoppingCartIcon,
    "playerStrategies": ShoppingCartIcon,
    "customEvents": ShoppingCartIcon,
    "placedBuildingEvents": ShoppingCartIcon,
    "queuedUnitsEvents": ShoppingCartIcon,
}

export interface IObjectIconProps {
    data: IconData,
    count?: number
    time?: number
    size?: number
    borderless?: boolean
    tooltip?: { show: boolean, value?: string }
}

export const GetIconUrl = (data: IconData) => {
    let url = `https://cdn.jsdelivr.net/gh/qwyt/aoe2-icon-resources/${data.group}/${parseInt(data.key).toString()}.png`
    return url
}

export function ObjectIcon(props: IObjectIconProps) {

    const [failedToLoadImg, setFailedToLoadImg] = useState(false);
    //TODO add a switch in app context
    const DEBUG_MODE = false
    // return <div>{props.tooltip}</div>

    let fileName = "-1"
    let url = GetIconUrl(props.data);

    let itemLabel: string = "";

    try {
        // @ts-ignore
        itemLabel = DEFINES[props.data.group][props.data.key]
    } catch (ex) {
        itemLabel = props.data.key
    }

    let size = props.size ? props.size : 32

    let item: any;
    item = <img className={styles.image} src={url} width={size} height={size}
                onError={() => {
                    setFailedToLoadImg(true)
                }}/>


    if (!props.borderless) {
        item = <Paper variant="outlined" className={styles.imgContainer} style={{height: size, width: size}}>
            {failedToLoadImg ? <ErrorOutlineIcon/> : item}
        </Paper>
    }

    // @ts-ignore
    if (props.count !== undefined && props.count > 1) {
        item = <Badge badgeContent={props.count} color="primary">
            {item}
        </Badge>
    }


    // let tooltipContent = props.tooltip ? props.tooltip : props.data.description ? props.data.description : itemLabel;// `${props.time} ${itemLabel} (${props.data.group}/${fileName}) ${JSON.stringify(props.data)}`
    //
    // if (DEBUG_MODE) {
    //     tooltipContent = `${props.tooltip} <br> ${props.data.description} ${props.time} ${itemLabel} <br> (${props.data.group}/${fileName}) ${JSON.stringify(props.data)}`
    // }
    let tooltipContent = "Tooltip: TODO"


    if (props.tooltip?.show) {
        return <div className={styles.container}>

            <Tooltip title={props.tooltip.value ? props.tooltip.value : tooltipContent}>
                {/*<Paper variant="outlined" elevation={3}>*/}
                {item}
                {/*</Paper>*/}
            </Tooltip>
        </div>
    }
    return <div className={styles.container}>
        {/*<Paper variant="outlined" elevation={3}>*/}
        {item}
        {/*</Paper>*/}
    </div>

}


