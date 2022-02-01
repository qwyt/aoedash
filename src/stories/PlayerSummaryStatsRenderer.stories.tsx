import React from 'react';
import {DescriptiveTableGameDuarationTestData} from "./Data";
import {DescriptiveStatsTableRenderer} from "../Components/DescriptiveStats/DescriptiveStatsTableRenderer";
import {DefaultThemeWrapper} from "../Theme";
import {Card} from "@mui/material";
import {PlayerSummaryStatsRenderer} from "../Components/PlayerSummary/PlayerSummaryStatsRenderer";

export default {
    /* 👇 The title prop is optional.
    * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
    * to learn how to generate automatic titles
    */
    title: 'PlayerSummaryStatsRenderer',
    component: PlayerSummaryStatsRenderer,
};

export const TestABC = () => <DefaultThemeWrapper>
    {/*<PlayerSummaryStatsRenderer/>*/}
</DefaultThemeWrapper>
// export const DescriptiveStatsTableRendererStory = () => <TestComponent table={DescriptiveTableGameDuarationTestData}/>
