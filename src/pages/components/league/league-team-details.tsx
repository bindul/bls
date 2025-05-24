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

import type {LeagueDetails} from "../../../data/league/league-details";
import {CardBody, CardHeader, Col, Container, Row} from "react-bootstrap";
import Loader from "../loader.tsx";
import Card from "react-bootstrap/Card";
import * as React from "react";
import {useEffect, useState} from "react";
import {TrackedLeagueTeam} from "../../../data/league/league-team-details.ts";
import type {LeagueMatchup} from "../../../data/league/league-matchup.ts";
import {ArrowDownCircleFill, Arrows, ArrowUpCircleFill} from "react-bootstrap-icons";
import {type Breakpoint} from "../ui-utils.tsx";
import LeagueTeamRoster from "./league-team-roster.tsx";

interface DataRowProps {
    defn: React.ReactNode;
    value: React.ReactNode
}
function WriteDataRow ({defn, value} : DataRowProps) {
    return (
        <Row className="border rounded-1 border-secondary">
            <Col className="text-body-emphasis bg-secondary px-1">{defn}<span className="float-end">:</span></Col>
            <Col className="px-1">{value}</Col>
        </Row>
    );
}


interface LeagueTeamProps {
    teamDetails: TrackedLeagueTeam;
    leagueDetails: LeagueDetails | null;
}
function LeagueTeamDetailsSummary ({teamDetails, leagueDetails} : LeagueTeamProps) {

    let lastMatchup: LeagueMatchup;
    let nextMatchup: LeagueMatchup;
    for (let i = 0; i < teamDetails.matchups.length; i++) {
        const matchup = teamDetails.matchups[i];
        if (!matchup.scores || !matchup.scores.playerScores || matchup.scores.playerScores.length === 0) {
            nextMatchup = matchup;
            if (i > 0) {
                lastMatchup = teamDetails.matchups[i - 1];
            }
            break;
        }
    }

    const rankComparison = () => {
        let retVal = <Arrows/>
        if (lastMatchup) {
            if (lastMatchup.enteringRank > teamDetails.currentRank) {
                retVal = <ArrowUpCircleFill/>
            } else if (lastMatchup.enteringRank < teamDetails.currentRank) {
                retVal = <ArrowDownCircleFill/>
            }
        }
        return retVal;
    }

    const formatNextMatchupLanes = () => {
        if (nextMatchup) {
            return nextMatchup.lanes[0] + " - " + nextMatchup.lanes[1] ;
        }
    }
    const formatNextMatchupOpponent = () => {
        if (nextMatchup && nextMatchup.opponent && nextMatchup.opponent.teamId) {
            const otherTeam = leagueDetails?.otherTeams.find(ot => ot.id === nextMatchup.opponent?.teamId);
            if (otherTeam) {
                return "#" + otherTeam.number + " " + otherTeam.name;
            }
        }
    }

    const xsColWeight = 12;
    const mdColWeight = 3;

    return (
        <Container fluid="true">
            <Card className="text-start mx-0 mb-0 h-100" border="secondary">
                <CardBody className="py-1 py-sm-2">
                    <Row className="gx-5 gy-1">
                        <Col xs={xsColWeight} md={mdColWeight}>
                            <WriteDataRow defn="Current Rank" value={<>{teamDetails.currentRank} <span className="float-end">{rankComparison()}</span></>}/>
                        </Col>
                        <Col xs={xsColWeight} md={mdColWeight}>
                            <WriteDataRow defn="Points" value={`${teamDetails.pointsWonLost[0]} - ${teamDetails.pointsWonLost[1]}`}/>
                        </Col>
                        <Col xs={xsColWeight} md={mdColWeight}>
                            <WriteDataRow defn="Next Matchup Lanes" value={formatNextMatchupLanes()}/>
                        </Col>
                        <Col xs={xsColWeight} md={mdColWeight}>
                            <WriteDataRow defn="Next Opponent" value={formatNextMatchupOpponent()}/>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Container>
    );
}

interface LeagueTeamDetailsProps {
    leagueDetails: LeagueDetails | null;
    leagueDetailsLoading: boolean;
    currentBreakpoint: Breakpoint;
    teamId?: string;
    children?: React.ReactNode;
}

const LeagueTeamDetails : React.FC<LeagueTeamDetailsProps> = ({leagueDetails, leagueDetailsLoading, currentBreakpoint, teamId}: LeagueTeamDetailsProps) => {
    const [teamDetails, setTeamDetails] = useState<TrackedLeagueTeam | null>(null);

    useEffect(() => {
        if (leagueDetails && teamId) {
            for (let i = 0; i < leagueDetails.teams.length; i++) {
                if (leagueDetails.teams[i].id === teamId) {
                    setTeamDetails(leagueDetails.teams[i]);
                    break;
                }
            }
        }
    }, [teamId, leagueDetails]);

    return (<>
        <Card border="primary" className="mt-2 mb-2 mx-0 px-0">
            {/*Still Loading*/}
            {leagueDetailsLoading && <div className="card-body"><Loader/></div>}
            {teamDetails &&
                <>
                    <CardHeader className="px-2 py-1 bg-primary text-white">
                        <div className="text-center fw-bolder">#{teamDetails.number} {teamDetails.name}</div>
                    </CardHeader>
                    <CardBody className="px-2 py-1">
                        <LeagueTeamDetailsSummary teamDetails={teamDetails} leagueDetails={leagueDetails}/>
                    </CardBody>
                    <LeagueTeamRoster teamDetails={teamDetails} leagueDetailsLoading={leagueDetailsLoading} currentBreakpoint={currentBreakpoint}/>
                    {/*TODO League Details*/}
                </>
            }
        </Card>
    </>);
}

export default LeagueTeamDetails;