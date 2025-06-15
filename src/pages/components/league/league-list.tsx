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
import {AvailableLeagues, LeagueInfo} from "../../../data/league/league-info";
import Loader from "../loader";
import ErrorDisplay from "../error-display";
import {
    LEAGUE_LIST_CACHE_CATEGORY,
    leagueInfoListFetcher
} from "../../../data/league/league-api";
import {useCachedFetcher} from "../../../data/utils/data-loader";

import Card from "react-bootstrap/Card"
import ListGroup from "react-bootstrap/ListGroup"
import ListGroupItem from "react-bootstrap/ListGroupItem";
import {Badge, CardBody, CardFooter, CardHeader, CardTitle} from 'react-bootstrap';
import {ArrowRightShort, PlayCircleFill} from "react-bootstrap-icons";
import {Link, type To} from "react-router-dom";
import * as React from "react";
import {useCallback} from "react";

interface LeagueLinkProps {
    condition :boolean;
    teamId? :string;
    to? :To;
    children? :React.ReactNode;
}
// TODO Change it from class component to Functional Component
class LeagueLink extends React.Component<LeagueLinkProps, {}> {
    render() {
        if (this.props.condition && this.props.to != undefined) {
            return (
                <Link to={this.props.to} key={this.props.teamId} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start">
                    {this.props.children}
                </Link>
            );
        } else {
            return (<ListGroupItem eventKey={this.props.teamId} className="bg-dark-subtle disabled">{this.props.children}</ListGroupItem>);
        }
    }
}

/**
 * Javascript / Typescript STUPIDITY!!: That we have to define this interface, or it passes an object to JSX
 */
interface LeagueProps {
    league: LeagueInfo;
}
function League({league} :LeagueProps) {
    // TODO: See if there is a better way to render the link from react router Link
    // TODO: Relook at this style if we end up with more than one team in a league
    // ListGroupItem complains about the to attribute, but works fine with it
    // @ts-ignore
    return (<>
        {league.teams?.map(team => (
            <LeagueLink condition={league.hasData()} teamId={team.id} to={`/league/${league.id}/${team.id}`} key={team.id}>
                <div>
                    <span className="fw-light text-muted">{league.name} <ArrowRightShort /> </span>
                    <span {...league.hasData() ? {className: "card-link"} : {}}>{team.name}</span>
                </div>
                {league.ongoing && <Badge bg="success" className="align-middle"><PlayCircleFill/> Playing</Badge>}
            </LeagueLink>
        ))}
    </>);
}

function LeagueList() {
    const fetcher = useCallback(leagueInfoListFetcher, []);
    const { data, isLoading, error } = useCachedFetcher<AvailableLeagues>(fetcher, LEAGUE_LIST_CACHE_CATEGORY);

    return (
        <Card className="mb-3">
            <CardHeader as="h3">Leagues & Teams</CardHeader>
            {/*Still Loading*/}
            {isLoading && <div className="card-body"><Loader /></div>}
            {/*Set error handling here, or the rest of the component does not get displayed*/}
            {error && <ErrorDisplay message="Error loading leagues. Nothing else on the site will probably work." error={error}/>}
            {data && data.seasons?.map(season => (
                <CardBody className="border-primary" key={season.season}>
                    <CardTitle>{season.season} Season</CardTitle>
                    <ListGroup id={season.season}>
                        {season.leagues && season.leagues.map(league => (
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