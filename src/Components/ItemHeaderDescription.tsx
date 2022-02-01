import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Title from "../Title";



export default function ItemHeaderDescription() {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Title>Daut</Title>
        This is empty because recharts sucks
    </React.Fragment>
  );
}
