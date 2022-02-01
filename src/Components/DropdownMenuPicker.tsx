import * as React from 'react';
import {styled, alpha} from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu, {MenuProps} from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import EditIcon from '@mui/icons-material/Edit';
import Divider from '@mui/material/Divider';
import ArchiveIcon from '@mui/icons-material/Archive';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {ListItemText, Stack, Typography} from "@mui/material";
import {TStatsTableNames} from "../Data/CheckType";
import {useEffect, useState} from "react";
import styles from "./SharedStyles.module.scss"

const StyledMenu = styled((props: MenuProps) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
))(({theme}) => ({
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color:
            theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        boxShadow:
            'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
        '& .MuiMenu-list': {
            padding: '4px 0',
        },
        '& .MuiMenuItem-root': {
            '& .MuiSvgIcon-root': {
                fontSize: 18,
                color: theme.palette.text.secondary,
                marginRight: theme.spacing(1.5),
            },
            '&:active': {
                backgroundColor: alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity,
                ),
            },
        },
    },
}));
export type TDropdownMenuPickerValue = { key: TStatsTableNames | string, label: string, disabled?: boolean, disabledLabel?: string | JSX.Element, n?: number, subLabel?: string }

export interface IDropdownMenuPickerProps {
    label: string;
    value: string;
    values: TDropdownMenuPickerValue[];
    onChangeValue: (key: string) => void;
    disabled?: boolean
    disabledLabel?: string
    // dependencies?: {check: string, disableOn: () => string | undefined}
}

export default function DropdownMenuPicker(props: IDropdownMenuPickerProps) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    // const [disabledLabel, setDisabled] = useState<string | undefined>(props.disabled ? props.disabledLabel)

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };


    // useEffect(()=>{
    //     if (props.dependencies) {
    //         setDisabled(props.dependencies.disableOn())
    //     }
    // }, [props.dependencies?.check])

    let selectedValueLabel = props.values.find(v => v.key === props.value)?.label
    let disabledLabel = props.disabledLabel ? props.disabledLabel : "Loading..."
    return (
        <Stack direction={"row"} sx={{alignItems: "center"}}>

            <Typography variant={"subtitle2"} align={"right"}>{props.label}</Typography>

            <Button
                sx={{marginLeft: "5px"}}
                id="demo-customized-button"
                aria-controls="demo-customized-menu"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                variant="contained"
                disableElevation
                disabled={props.disabled}
                size={"small"}
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon/>}
            >
                {props.disabled && <span style={{textTransform: "none"}}>{disabledLabel}</span>}
                {!props.disabled && selectedValueLabel}
            </Button>
            <StyledMenu

                id="demo-customized-menu"
                MenuListProps={{
                    dense: true,
                    disabledItemsFocusable: false,
                    'aria-labelledby': 'demo-customized-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                {props.values.map((v) => {
                    let isSelected = v.key === props.value;
                    return <MenuItem
                        // className={v.disabled ? "Mui-disabled" : undefined}
                        style={{pointerEvents: "visible"}}
                        className={(v.disabled && v.disabledLabel) ? styles.disabledNoHover : undefined}
                        disabled={v.disabled}
                        onClick={() => {

                            if (!v.disabled) {
                                handleClose()
                                props.onChangeValue(v.key);
                            }
                        }}
                        disableRipple>

                        <ListItemText>
                            {v.disabled && v.disabledLabel}
                            {(!v.disabled || !v.disabledLabel) && <span style={{fontWeight: isSelected ? "bold" : undefined}}>{v.label}</span>}
                        </ListItemText>
                        <Stack height={"100"} justifyContent={"flex-end"}>
                            <Typography variant="body2" color="text.secondary" fontSize={10}>
                                {v.n !== undefined ? `n=${v.n}` : ``}
                            </Typography>
                            {/*<Typography variant="body2" color="text.secondary" fontSize={10}>*/}
                            {/*    {v.subLabel}*/}
                            {/*</Typography>*/}
                        </Stack>
                    </MenuItem>
                })}
                {/*<MenuItem onClick={handleClose} disableRipple>*/}
                {/*    <EditIcon/>*/}
                {/*    Edit*/}
                {/*</MenuItem>*/}
                {/*<MenuItem onClick={handleClose} disableRipple>*/}
                {/*    <FileCopyIcon/>*/}
                {/*    Duplicate*/}
                {/*</MenuItem>*/}
                {/*<Divider sx={{my: 0.5}}/>*/}
                {/*<MenuItem onClick={handleClose} disableRipple>*/}
                {/*    <ArchiveIcon/>*/}
                {/*    Archive*/}
                {/*</MenuItem>*/}
                {/*<MenuItem onClick={handleClose} disableRipple>*/}
                {/*    <MoreHorizIcon/>*/}
                {/*    More*/}
                {/*</MenuItem>*/}
            </StyledMenu>
        </Stack>
    );
}
