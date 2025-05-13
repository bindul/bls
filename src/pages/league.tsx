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

import type {FC} from "react";
import {useParams, Outlet} from "react-router-dom";
import LeagueList from "./components/league/league-list.tsx";

const League :FC = () => {
    const { leagueId } = useParams();

    if (!leagueId) {
        return <LeagueList/>;
    }

    return (
        <>
            <h1>League</h1>
            <h2>{leagueId}</h2>

            <Outlet />
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