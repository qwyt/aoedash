import * as React from "react";
import {PlayerStatsViewQueryResponseMetaData} from "../../Data/Model";
import {Alert, Box, LinearProgress, LinearProgressProps, Stack, Typography} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import {END_POINTS_URL} from "../../Data/config";
import JSONTree from "react-json-tree";
import {clear} from "@testing-library/user-event/dist/clear";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export interface PlayerStatsQueryJobInfoRendererProps {

    full: boolean
    data: PlayerStatsViewQueryResponseMetaData
    profileId?: string
}

function LinearProgressWithLabel(props: LinearProgressProps & { value: number, label: string }) {
    return (
        <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Box sx={{width: '100%', mr: 1}}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{minWidth: 35}}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(
                    props.value,
                )}% (${props.label})`}</Typography>
            </Box>
        </Box>
    );
}

type TJobStatusCollection = { [jobId: number]: any }

export function PlayerStatsQueryJobInfoRenderer(props: PlayerStatsQueryJobInfoRendererProps) {


    // const [jobFinished, setJobFinished ] = useState<undefined | "succeeded" | "failed">(undefined);
    const [jobIntervalRef, setJobIntervalRed] = useState<{ query: TJobStatusCollection, extrapolate: TJobStatusCollection }>({
        query: {},
        extrapolate: {}
    })

    const [buildProgress, setBuildProgress] = useState<undefined | { message: string, progReal: number, progExrapolated: number }>(undefined)

    const buildProgressRef = useRef<undefined | { message: string, progReal: number, progExrapolated: number }>(undefined)
    buildProgressRef.current = buildProgress;


    const currentJobId = props.data.scheduled_or_running_job?.job_id

    const getReportAgeDays = () => {
        if (props.data.last_finished_job) {
            let dateFinishedS = Date.parse(props.data.last_finished_job.last_updated)
            if (!isNaN(dateFinishedS)) {
                const diffDays = Math.floor(Math.abs(Date.now() - new Date(dateFinishedS).getTime()) / (1000 * 60 * 60 * 24));
                return diffDays
            }
        }
        return false
    }

    useEffect(() => {
        const queryStatusForJob = () => {
            if (currentJobId !== undefined) {
                let url = `${END_POINTS_URL}/__s_/job_status/${currentJobId}`

                // (buildProgress === undefined ? 0 : (buildProgress.prog + 5))
                fetch(url).then(response => response.json()).then(data => {

                    if (data.status === 10) {
                        // eslint-disable-next-line no-restricted-globals
                        // location.reload();
                    }

                    let s = -1;
                    s = data.status * 10;

                    setBuildProgress({message: data.data.error, progReal: s, progExrapolated: s})
                }).catch((error) => {
                    setBuildProgress({message: error.toString(), progReal: -1, progExrapolated: -1})
                });

            }
        }

        const extrapolateProgress = () => {

            if (buildProgressRef.current) {
                if (buildProgressRef.current.progExrapolated < 99) {
                    setBuildProgress({
                        ...buildProgressRef.current,
                        progExrapolated: buildProgressRef.current.progExrapolated + 1
                    })
                } else {
                    setBuildProgress({
                        ...buildProgressRef.current,
                        progExrapolated: buildProgressRef.current.progReal
                    })
                }
            }
        }

        if (currentJobId !== undefined) {

            let doSet = false
            let query = {...jobIntervalRef.query}
            if (jobIntervalRef.query[currentJobId] === undefined) {
                let queryInterval = setInterval(queryStatusForJob, 2500)
                query[currentJobId] = queryInterval;
                doSet = true
            }

            let extrapolate = {...jobIntervalRef.extrapolate};
            if (jobIntervalRef.extrapolate[currentJobId] === undefined) {
                let extrapolateInterval = setInterval(extrapolateProgress, 375)
                extrapolate[currentJobId] = extrapolateInterval;
                doSet = true
            }

            if (doSet) {
                setJobIntervalRed({
                    query: query,
                    extrapolate: extrapolate
                })
            }
        }

    }, [currentJobId])


    const buildProgressDep = buildProgress ? buildProgress.progReal : 0

    useEffect(() => {

        if (buildProgress && (buildProgress.progReal <= -1 || buildProgress.progReal >= 100)) {

            for (let t of Object.values(jobIntervalRef.query)) {
                clearInterval(t)
            }
            for (let t of Object.values(jobIntervalRef.extrapolate)) {
                clearInterval(t)
            }
        } else {
            ;
        }

    }, [buildProgressDep])

    let infoMessage: JSX.Element;
    if (props.data.last_finished_job) {
        let dateFinishedS = Date.parse(props.data.last_finished_job.last_updated)

        let dateAgeDescription: string;
        if (isNaN(dateFinishedS)) {
            dateAgeDescription = `Was generated on ${props.data.last_finished_job.last_updated}`
        } else {
            dateAgeDescription = `Is ${getReportAgeDays()} days (or around that) old`
        }

        if (props.data.scheduled_or_running_job) {
            infoMessage = <span>
        <p>{dateAgeDescription}</p>
        <p>A new report is being generated, the window will refresh automatically when it's ready</p>
    </span>
        } else {
            infoMessage = <span>
        <p>{dateAgeDescription}</p>
    </span>
        }

    } else {

        infoMessage = <span>
        <p>A stats dashboard has not yet been generated for this player</p>
            {props.data.scheduled_or_running_job &&
                <React.Fragment>
                    <p>Please wait while we prepare the data (feel free to close the window and return later)</p>
                    <p></p>
                </React.Fragment>}
    </span>

    }


    let dontShowAlert = false;

    // is a job running now?
    // if (props.data.last_finished_job?.job_id === undefined){
    //     dontShowAlert = true;
    // }
    // else if (props.data.last_finished_job && props.data.scheduled_or_running_job)
    if (!props.data.scheduled_or_running_job) {
        dontShowAlert = true;
    }

    // let dontShowAlert = getReportAgeDays() === 0 && props.data.last_finished_job !== undefined && props.data.last_finished_job.status === 10

    const [showError, setShowError] = useState(false)

    const showErrorProps = {
        onClick: () => {
            setShowError(!showError)
        },
        cursor: "pointer"
    }

    let ret: JSX.Element
    if (buildProgress && buildProgress.progReal <= -1) {
        ret = <Alert severity={"error"}>
            <Stack>
                <Box>Something Went Wrong!</Box>
                <Box>Could not generate a report for {props.profileId}</Box>
                <Box>Please try refreshing the page and contact [TODO] if the problem persists</Box>

                <Stack direction={"row"} alignItems={"center"}> {showError ? <ExpandLessIcon {...showErrorProps}/> :
                    <ExpandMoreIcon {...showErrorProps}/>} {showError ? "Hide Details" : "Show Details"}</Stack>
                <Box visibility={showError ? "visible" : "hidden"}>Error: {buildProgress.message}</Box>
            </Stack>
        </Alert>
    } else if (dontShowAlert) {
        ret = <div>Data Last Updated {props.data.last_finished_job?.last_updated} </div>
    } else if (props.full) {
        ret = <div>TODO</div>
    } else {
        ret = <Alert severity="warning">
            {infoMessage}
            {buildProgress &&
                <LinearProgressWithLabel value={buildProgress.progExrapolated}
                                         label={buildProgress.message}/>}
        </Alert>
    }

    return <div>
        {ret}
        <JSONTree data={props}/>
    </div>
}