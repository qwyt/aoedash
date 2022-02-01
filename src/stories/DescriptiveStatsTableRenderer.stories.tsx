import React from 'react';
import {DescriptiveTableGameDuarationTestData} from "./Data";
import {DescriptiveStatsTableRenderer} from "../Components/DescriptiveStats/DescriptiveStatsTableRenderer";
import {DefaultThemeWrapper} from "../Theme";
import {Card} from "@mui/material";

// export function TestComponent(props: {table: any}){
//   return <div>V: {props.toString()}</div>
// }

export default {
    /* 👇 The title prop is optional.
    * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
    * to learn how to generate automatic titles
    */
    title: 'DescriptiveStatsTable',
    component: DescriptiveStatsTableRenderer,
};

export const TestABC = () => <DefaultThemeWrapper>
    <Card>123</Card>
    <DescriptiveStatsTableRenderer
        table={DescriptiveTableGameDuarationTestData}/>
</DefaultThemeWrapper>
// export const DescriptiveStatsTableRendererStory = () => <TestComponent table={DescriptiveTableGameDuarationTestData}/>
