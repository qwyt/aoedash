import React from 'react';
import styles from "./StatsValueElement.module.scss"
import {propToPercent} from "../Utils";
import {Box, LinearProgress, Tooltip, Typography} from "@mui/material";


export interface ISummaryStat {

    label: string
    value: number
    unit: "%" | string | undefined

    total?: number | [number, number]
    baseline?: number
    baselineLabel?: string
    baselineMagnitude?: 0.1 | 0.2 | 0.5 | 1

    dontShowProgress?: boolean
}

export function StatsValueElement(props: ISummaryStat) {

    let val = props.value;
    let unitStr = props.unit ? props.unit : "";
    // if (props.total) {
    //     val = 100 / props.max * props.value
    // }
    let valEl: JSX.Element;
    if (props.unit === "%") {
        val = propToPercent(val)
    } else if (props.unit === "") {
        val = Math.round(val)
        // valEl = <div className={styles.label}>{props.value.toFixed(0)}</div>
    }
    // else {
    //     valEl = <div className={styles.label}>{val}
    //         <span>{props.unit}</span></div>
    // }
    //
    let progresColor: undefined | "veryPositive" | "positive" | "neutral" | "negative" | "veryNegative";
    let diff = 0
    if (props.baseline !== undefined && props.baseline !== -1) {
        diff = props.value - props.baseline;
        let mult = props.baselineMagnitude !== undefined ? props.baselineMagnitude : 1
        if (diff > (0.2 * mult)) {
            progresColor = "veryPositive"
        } else if (diff < (-0.2 * mult)) {
            progresColor = "veryNegative"
        } else if (diff < (0.2 * mult) && diff > (mult * 0.035)) {
            progresColor = "positive"
        } else if (diff > (mult * -0.2) && diff < (mult * -0.35)) {
            progresColor = "negative"
        } else {
            progresColor = "neutral"
        }
    }

    let progressBar: JSX.Element | undefined;
    if ((props.total || props.unit === "%") && !props.dontShowProgress) {
        valEl = <div className={styles.label}>{val}
            <span>{unitStr}</span></div>

        let progVal = val;
        if (Array.isArray(props.total)) {
            progVal = (1 / props.total[1]) * (val - props.total[0]);
        } else if (props.total) {
            progVal = 1 / props.total * val;
        }


        progressBar = <LinearProgress value={progVal * (props.unit !== "%" ? 100 : 1)}
                                      variant={"determinate"}
                                      className={`${styles.progressBar} ${progresColor !== undefined ? `${styles.progressColor} ${styles[progresColor]}` : ""}`}

        />
    } else {

        if (props.baseline && progresColor) {
            let baselineRelative = diff / props.baseline;
            valEl = <Box sx={{display: "flex", flexDirection: "column"}}>
                <Typography variant={"body2"} align={"center"}
                            className={`${styles.valueLabel} ${styles[`${progresColor}`]}`}>{`${val}${unitStr}`}</Typography>

                <Tooltip
                    title={
                        <div>{`${propToPercent(baselineRelative)}% ${diff > 0 ? "higher" : "lower"} than all players average (${propToPercent(props.baseline)}%)`}<br/> {props.baselineLabel}
                        </div>}
                    arrow>
                    <Typography variant={"subtitle2"} align={"center"}
                                className={`${styles.baselineLabel} ${styles.valueLabel} ${styles[`${progresColor}`]}`}>
                        {`${diff > 0 ? "+" : ""}${propToPercent(baselineRelative)}%`}
                    </Typography>
                </Tooltip>
            </Box>

        } else {
            valEl =
                <Typography variant={"body2"} align={"center"}>{`${val}${unitStr}`}</Typography>

        }
    }

    return <div className={styles.container}>
        {progressBar}
        {valEl}
    </div>
}