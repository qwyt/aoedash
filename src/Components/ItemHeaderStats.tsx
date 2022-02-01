import * as React from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from '../Title';

function preventDefault(event: React.MouseEvent) {
    event.preventDefault();
}

export default function ItemHeaderStats() {
    return (
        <React.Fragment>
            <Title>Best Civ</Title>
            <div style={{width: 82, height: 82}}>ICON</div>
            <Typography component="p" variant="h4">

            </Typography>
            <Typography variant={"subtitle1"} color="text.secondary" sx={{flex: 1}}>
                Total Games: 5 (44%)
            </Typography>
            <Typography variant={"subtitle1"}  color="text.secondary" sx={{flex: 1}}>
                Win Percentage: 55% (+7%)
            </Typography>
        </React.Fragment>
    );
}
