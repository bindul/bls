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

import {HourglassSplit} from "react-bootstrap-icons";
import Card from "react-bootstrap/Card";
import {CardBody, CardFooter, CardHeader, CardText, CardTitle} from "react-bootstrap";

import Loader from "../loader";
import type {Players} from "../../../data/player/player-info";
import {PLAYER_LIST_CACHE_CATEGORY, playerListFetcher} from "../../../data/player/player-api";
import {useCachedFetcher} from "../../../data/utils/data-loader";
import ErrorDisplay from "../error-display";

function PlayerList() {
    const { data, isLoading, error } = useCachedFetcher<Players>(playerListFetcher, PLAYER_LIST_CACHE_CATEGORY);

    return (
        <Card className="mb-3">
            <CardHeader as="h3">Players</CardHeader>
            {/*Still Loading*/}
            {isLoading && <div className="card-body"><Loader /></div>}
            {/*Set error handling here, or the rest of the component does not get displayed*/}
            {error && <ErrorDisplay message="Error loading players. Lots of things on the site will probably not work." error={error}/>}
            {data &&
                <CardBody className="border-primary">
                    <CardTitle><HourglassSplit/> Player Stats (WIP)</CardTitle>
                    <CardText>Future: links to individuals stats pages with numbers across leagues, like:</CardText>
                    <ul>
                        {data.players.map((player, index) => (<li><a href="#" key={index} className="card-link">{player.name}</a></li>))}
                    </ul>
                </CardBody>
            }
            <CardFooter className="text-muted text-center">
                List sorted by when someone last bowled descending and player initials ascending.
            </CardFooter>
        </Card>
    );
}

export default PlayerList;