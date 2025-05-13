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

// Using the Bootswatch lumen theme - Switch to CDN later: https://bootswatch.com/help/
import 'bootswatch/dist/lumen/bootstrap.min.css';
import './sass/bls.scss';

import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Route, Routes} from "react-router-dom";
import {HashRouter} from "react-router";

import Layout from "./pages/layout";
import Home from "./pages/home";
import League from "./pages/league";
import LeagueTeam from "./pages/league-team";
import NoPage from "./pages/nopage";
import {LeagueContextContextProvider} from "./pages/components/league/league-list-context"

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout/>}>
                <Route index element={<Home/>}/>
                <Route path="/league/:leagueId?" element={<League/>}>
                    <Route path=":teamId?" element={<LeagueTeam/>}/>
                </Route>
                <Route path="*" element={<NoPage/>}/>
            </Route>
        </Routes>

    )
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter>
            <LeagueContextContextProvider>
                <App/>
            </LeagueContextContextProvider>
        </HashRouter>
    </StrictMode>
)
