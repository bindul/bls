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

import NewsHighlights from "./components/news/news";
import LeagueList from './components/league/league-list';
import PlayerList from "./components/player/player-list";

const Home :FC = () => {
    return (
        <>
            {/*Highlight of the week | style="max-width: 20rem;"*/}
            <div className="container-fluid">
                <NewsHighlights />
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