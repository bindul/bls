/*
 * Copyright (c) 2025. Bindul Bhowmik
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import  {type FC} from "react";
import {useParams} from "react-router-dom";
import LeagueSummary from "./components/league/league-summary.tsx";

import Loader from "./components/loader";
import ErrorDisplay from "./components/error-display";
import {LEAGUE_LIST_CACHE_CATEGORY, leagueInfoListFetcher} from "../data/league/league-api.ts";
import {AvailableLeagues} from "../data/league/league-info.ts";
import {useCachedFetcher} from "../data/utils/data-loader.tsx";
import LeagueList from "./components/league/league-list.tsx";

const League :FC = () => {
    const { leagueId } = useParams(); //TODO Add teamId later

    if (!leagueId) {
        return <LeagueList/>;
    }

    // Check if league is valid
    const { data: leagueListData, isLoading: leagueListLoading, error: leagueListLoadError } = useCachedFetcher<AvailableLeagues>(leagueInfoListFetcher, LEAGUE_LIST_CACHE_CATEGORY);
    if (leagueListLoading) {
        return <Loader />
    }
    if (leagueListLoadError) {
        return <ErrorDisplay message="Error loading leagues. Nothing else on the site will probably work." error={leagueListLoadError}/>
    }
    if ((leagueListData && !leagueListData.findLeague(leagueId)) || leagueListLoadError) {
        return (<>
            <LeagueList />
            <ErrorDisplay message="Incorrect League ID. Please select a correct league."/>
        </>);
    }

    return (
        <>
            {leagueListData && <LeagueSummary leagueInfo={leagueListData.findLeague(leagueId)}/>}
        </>
    )
};

/*
Test Code
import { League } from "./types/leagues.ts";
import './App.css'

async function test() {
  const res = await fetch('/data/league-2425-summer-beer.json');
  let l1: League = new League(await res.json());
  l1.computeLeagueStats();
  alert(JSON.stringify(l1));
}

function App() {
  return (
    <button onClick={test}>Test</button>
  )
}
 */

export default League;