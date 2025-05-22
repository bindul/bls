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
import {BookmarkStarFill} from "react-bootstrap-icons";
import LeagueList from './components/league/league-list.tsx';
import PlayerList from "./components/player/player-list.tsx";

const Home :FC = () => {
    return (
        <>
            {/*Highlight of the week | style="max-width: 20rem;"*/}
            <div className="container-fluid">
                <div className="card border-success mb-3">
                    <div className="card-header">Recent Highlights</div>
                    <div className="card-body">
                        <h4 className="card-title">News from recent games</h4>
                        <p className="card-text"><BookmarkStarFill /> Just playing around with the idea!</p>
                    </div>
                </div>
            </div>
            <div className="container-md">
                <div className="row">
                    <div className="col-md">
                        {/* Seasons / Teams */}
                        <LeagueList />
                    </div>
                    <div className="col-md">
                        {/* Players */}
                        <PlayerList />
                    </div>
                </div>
            </div>
        </>
    )
};

export default Home;