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
import {type FC, type ReactNode, useCallback} from "react";
import {Link, type To} from "react-router-dom";

import {Badge, Card, CardBody, CardFooter, CardHeader, CardTitle, ListGroup, ListGroupItem} from 'react-bootstrap';
import {ArrowRightShort, PlayCircleFill} from "react-bootstrap-icons";

import {AvailableLeagues, LeagueInfo} from "../../../data/league/league-info";
import {
    LEAGUE_LIST_CACHE_CATEGORY,
    leagueInfoListFetcher
} from "../../../data/league/league-api";
import Loader from "../loader";
import ErrorDisplay from "../error-display";
import {useCachedFetcher} from "../cache/data-loader";

interface LeagueLinkProps {
    hasData :boolean;
    teamId? :string;
    to? :To;
    children? :ReactNode;
}
const LeagueLink :FC<LeagueLinkProps> = ({hasData, teamId, to, children}) => {
    if (hasData && to != undefined) {
        return (
            <Link to={to} key={teamId} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start">
                {children}
            </Link>
        );
    } else {
        return (<ListGroupItem eventKey={teamId} className="bg-dark-subtle disabled">{children}</ListGroupItem>);
    }
}

interface LeagueProps {
    league: LeagueInfo;
}
const League :FC<LeagueProps> = ({league} :LeagueProps)=> {
    // TODO: Relook at this style if we end up with more than one team in a league
    return (<>
        {league.teams.map(team => (
            <LeagueLink hasData={league.hasData()} teamId={team.id} to={`/league/${String(league.id)}/${String(team.id)}`} key={team.id}>
                <div>
                    <span className="fw-light text-muted">{league.name} <ArrowRightShort /> </span>
                    <span {...league.hasData() ? {className: "card-link"} : {}}>{team.name}</span>
                </div>
                {league.ongoing && <Badge bg="success" className="align-middle"><PlayCircleFill/> Playing</Badge>}
            </LeagueLink>
        ))}
    </>);
}

const LeagueList :FC = ()=> {
    const fetcher = useCallback(leagueInfoListFetcher, []);
    const { data, isLoading, error } = useCachedFetcher<AvailableLeagues>(fetcher, LEAGUE_LIST_CACHE_CATEGORY);

    return (
        <Card className="mb-3">
            <CardHeader as="h3">Leagues & Teams</CardHeader>
            {isLoading && <div className="card-body"><Loader /></div>}
            {(error != null) && <ErrorDisplay message="Error loading leagues. Nothing else on the site will probably work." error={error}/>}
            {data?.seasons.map(season => (
                <CardBody className="border-primary" key={season.season}>
                    <CardTitle>{season.season} Season</CardTitle>
                    <ListGroup id={season.season}>
                        {season.leagues.map(league => (
                            <League league={league} key={league.id}/>
                        ))}
                    </ListGroup>
                </CardBody>
            ))}
            {/* TODO Future, may want to start older seasons collapsed. See https://disjfa.github.io/bootstrap-tricks/card-collapse-tricks/ */}
            <CardFooter className="text-muted text-center">
                USBC Seasons run from September to August the following year
            </CardFooter>
        </Card>
    );
}

export default LeagueList;