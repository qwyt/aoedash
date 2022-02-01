import Box from "@mui/material/Box";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import * as React from "react";
import {Stack, Typography} from "@mui/material";

export interface IToggleButtonGroupButtonData {

    icon: JSX.Element | undefined;
    label: string
    selected: boolean
    onClick: () => void
    disabled?: boolean
}

interface IToggleButtonGroupProps {

    showIcons?: boolean
    showLabels?: boolean
    buttons: IToggleButtonGroupButtonData[]
}

export const DatasetSelectionButtonGroup = (props: IToggleButtonGroupProps) => {
    return <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            '& > *': {
                m: 1,
            },
        }}
    >
        <ToggleButtonGroup
            value={'left'}
            exclusive
            // onChange={handleAlignment}
            aria-label="text alignment"
        >
            {props.buttons.map((bd) => {

                let iconObj: JSX.Element | string | undefined;

                if (props.showLabels && props.showIcons) {
                    iconObj = <Stack spacing={1} direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
                        {bd.icon}
                        <Typography variant={"overline"}>{bd.label}</Typography>

                    </Stack>
                } else if (props.showIcons) {
                    iconObj = bd.icon
                } else {
                    iconObj = bd.label
                }

                return <ToggleButton value="left" size={"small"}
                                     disabled={bd.disabled}
                                     aria-label="left aligned" selected={bd.selected}
                                     onClick={bd.onClick}>
                    {iconObj}
                    {/*{bd.icon}*/}
                    {/*{bd.label}*/}
                </ToggleButton>
            })}
        </ToggleButtonGroup>
    </Box>

}