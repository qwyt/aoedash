import * as React from "react";
import {useState} from "react";
import {Box, Card, Grid, Typography} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export function DataTableWrapper(props: { mainViewItem?: boolean, title: string, children: JSX.Element | JSX.Element[], filterComponents?: any, expanded?: boolean }) {
    const [expanded, setExpanded] = useState(props.expanded === undefined ? true : props.expanded)

    const toggleExpanded = () => {
        setExpanded(!expanded)
    }

    return <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
        <Card>
            <Box sx={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: props.mainViewItem ?  "0px" : "5px",
                marginBottom: props.mainViewItem ?  "0px" : "5px"
            }}>
                {props.mainViewItem ? undefined : <React.Fragment>
                    <Box sx={{display: "flex", alignItems: "center"}}>
                        <IconButton onClick={toggleExpanded}>
                            {expanded ? <ExpandLessIcon/> : <ExpandMoreIcon/>}
                        </IconButton>

                        <Typography>{props.title}</Typography>

                    </Box>
                    {expanded && props.filterComponents}
                </React.Fragment>}
            </Box>
            {/*<Typography>{props.viewInfo.title}</Typography>*/}
            {expanded && props.children}
        </Card>
    </Grid>
}