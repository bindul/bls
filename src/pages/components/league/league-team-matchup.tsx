/*
 * Copyright (c) 2025. Bindul Bhowmik
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {type FC, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import moment from "moment";

import {Badge, Card, CardBody, CardHeader, Col, Row, Stack, Table} from "react-bootstrap";
import {
    ArrowsCollapse,
    ArrowsExpand,
    BoxArrowDown,
    BoxArrowUp
} from "react-bootstrap-icons";

import {isNonEmptyString} from "../../../data/utils/utils";
import type {LeagueDetails} from "../../../data/league/league-details";
import {TrackedLeagueTeam} from "../../../data/league/league-team-details";
import {type Breakpoint, BS_BP_XS, isBreakpointSmallerThan} from "../ui-utils";
import Loader from "../loader";
import {type LeagueMatchup, type MatchupType, SeriesScore, TeamScore} from "../../../data/league/league-matchup";
import MatchupDetailsDisplay from "./league-team-matchup-details";

const MatchupTypeConversion :Map<MatchupType, string> = new Map([
    ["REGULAR-DIVISION", "Division"],
    ["REGULAR-INTER-DIVISION", "Inter Division"],
    ["POSITION", "Position"],
    ["POSITION-INTER-DIVISION", "Position"],
    ["POSITION-INTRA-DIVISION", "Position"],
    ["FUN", "Non League"],
    ["OTHERS", "Non League"]
]);

interface TeamNameInfoProps {
    division?: string;
    teamNumber?: number;
    name?: string;
    enteringPosition?: string;
}
const TeamNameInfo :FC<TeamNameInfoProps> = ({teamNumber, name, enteringPosition}: TeamNameInfoProps) => {
    return (<>
        <span>#{teamNumber} {name}&nbsp;
            {isNonEmptyString(enteringPosition) && <small> [ {enteringPosition} ]</small>}
        </span>
    </>);
}

interface GameSummaryAndPointsProps {
    teamNumber?: number;
    teamScore?: TeamScore;
    currentBreakpoint?: Breakpoint;
}
const GameSummaryAndPoints :FC<GameSummaryAndPointsProps> = ({teamNumber, teamScore, currentBreakpoint}: GameSummaryAndPointsProps) => {
    return (<>
    {teamScore && teamScore.games && teamScore.series &&
        <Table bordered size="sm" className={`p-0 lh-1 my-1 text-end ${isBreakpointSmallerThan(currentBreakpoint, BS_BP_XS) ? "fs-xs" : ""}`}>
            <tbody>
                <tr>
                    {teamNumber && teamNumber > 0 && <td rowSpan={2} className="align-middle text-center fw-semibold">#{teamNumber}</td>}
                    {teamScore.games.map(g => <td className="p-1">{g.effectiveScratchScore}</td>)}
                    <td className="p-1">{teamScore.series.effectiveScratchScore}</td>
                </tr>
                <tr>
                    {teamScore.games.map(g => <td  className={`p-1 ${g.pointsWon > 0 ? "bg-success-subtle" : ""}`}>{g.hdcpScore}</td>)}
                    <td className={`p-1 ${teamScore.series.pointsWon > 0 ? "bg-success-subtle" : ""}`}>{teamScore.series.hdcpScore}</td>
                </tr>
            </tbody>
        </Table>}
    </>);
}

interface MatchupDetailsExplandedProps {
    week: number;
    expanded: boolean;
}

interface MatchupDisplayProps {
    leagueDetails: LeagueDetails | null;
    matchup: LeagueMatchup;
    teamDetails: TrackedLeagueTeam;
    currentBreakpoint?: Breakpoint;
}
const MatchupDisplay :FC<MatchupDisplayProps> = ({leagueDetails, matchup, teamDetails, currentBreakpoint}: MatchupDisplayProps) => {

    const[matchupDetailsExpanded, setMatchupDetailsExpanded] = useState<MatchupDetailsExplandedProps[]>([]);
    const[showMatchupDetails, setShowMatchupDetails] = useState<boolean>(true);

    useEffect(() => {
        const today = moment();
        if (!matchup.bowlDate || matchup.bowlDate.isAfter(today) || !matchup.scores || !matchup.scores.games || matchup.scores.games.length == 0) {
            // We don't have data for this matchup
            setShowMatchupDetails(false);
        }
    }, [matchup]);

    const isVisible = (week: number) => {
        const cd = matchupDetailsExpanded.find(mde => mde.week === week);
        if (cd) {
            return cd.expanded;
        } else {
            setMatchupDetailsExpanded([
                ...matchupDetailsExpanded,
                {week: week, expanded: false}
            ]);
            return false;
        }
    }

    const toggleVisiblity = (week: number) => {
        const cd = matchupDetailsExpanded.find(mde => mde.week === week);
        if (cd) {
            cd.expanded = !cd.expanded;
        } else {
            setMatchupDetailsExpanded([
                ...matchupDetailsExpanded,
                {week: week, expanded: false}
            ]);
        }
    }

    const calculateTeamHdcp = (seriesScore? : SeriesScore, preCalcHdcp?: number)=> {
        let hdcp = "UNKNOWN";
        if (seriesScore && seriesScore.hdcp && seriesScore.games) {
            hdcp = String(seriesScore.hdcp / seriesScore.games);
        } else if (preCalcHdcp && preCalcHdcp > 0) {
            hdcp = preCalcHdcp.toString();
        }
        return hdcp;
    }

    const twoDigitNumberFormat = Intl.NumberFormat("en-US", {style: "decimal", minimumIntegerDigits: 2});
    const opponentTeamId = matchup.opponent?.teamId;
    const opponent = leagueDetails?.otherTeams.find(ot => ot.id === opponentTeamId);
    const weekPrefix = leagueDetails?.bowlingDays?.durationUnit ?? "WK";

    return (<>
        <Col>
            <Card border={showMatchupDetails ? "primary" : "dark"} className="mx-auto px-0 py-0 w-100">
                <CardHeader className={`text-light fw-semibold px-2 py-0 ${showMatchupDetails ? "bg-primary" : "bg-dark"}`}>
                    <Stack direction="horizontal" gap={3}>
                        <div>{weekPrefix} {twoDigitNumberFormat.format(matchup.week)}</div>
                        <div>{matchup.scheduledDate?.format("DD MMM")}</div>
                        <div className="me-auto">
                            {matchup.bowlDate && !matchup.bowlDate.isSame(matchup.scheduledDate, "day") &&
                                <>&nbsp;<small><Badge bg="light">{matchup.bowlDate.isBefore(matchup.scheduledDate, "day") ? `Pre-Bowl` : `Post-Bowl`}</Badge></small></>}
                        </div>
                        <div>Lanes {twoDigitNumberFormat.format(matchup.lanes[0])} - {twoDigitNumberFormat.format(matchup.lanes[1])}</div>
                    </Stack>
                </CardHeader>
                <CardBody className="py-0 px-1 mb-auto">
                    <Stack direction="horizontal" gap={2}>
                        <div className="me-auto">
                            <Stack direction="vertical" className="mx-auto">
                                <div className="align-middle">
                                    <TeamNameInfo division={teamDetails.division} teamNumber={teamDetails.number} name={teamDetails.name} enteringPosition={matchup.enteringRank}/>
                                    <br/><span className="fs-sm">hdcp: {calculateTeamHdcp(matchup.scores?.series, teamDetails.teamStats?.handicap)}</span>
                                </div>
                                <div className="d-none d-sm-block">
                                    {showMatchupDetails && <GameSummaryAndPoints teamScore={matchup.scores} currentBreakpoint={currentBreakpoint}/>}
                                </div>
                            </Stack>
                        </div>
                        <div>
                            <Stack direction="vertical" className="text-center h-100">
                                <div><small className={matchup.matchup.startsWith("POSITION") ? "text-danger" : ""}>{MatchupTypeConversion.get(matchup.matchup)}</small></div>
                                <div className="my-auto align-middle">
                                    {showMatchupDetails && <span className="fs-5">{matchup.pointsWonLost[0]} - {matchup.pointsWonLost[1]}</span>}
                                </div>
                                {/* Expand / Collapse for larger screens - small screens is a little further down*/}
                                <div className="d-none d-sm-block w-auto">
                                    {showMatchupDetails &&
                                        <Link to="#" onClick={() => {toggleVisiblity(matchup.week)}}>{isVisible(matchup.week)?
                                            <><ArrowsCollapse className="fw-bold"/><br/><span className="fs-xs">Hide Game Details</span></> :
                                            <><ArrowsExpand className="fw-bold"/><br/><span className="fs-xs">Game Details</span></>}
                                        </Link>
                                    }
                                </div>
                            </Stack>
                        </div>
                        <div className="ms-auto">
                            <Stack direction="vertical" className="mx-auto">
                                <div className="text-end align-middle">
                                    <TeamNameInfo division={opponent?.division} teamNumber={opponent?.number} name={opponent?.name} enteringPosition={matchup.opponent?.enteringRank}/>
                                    <br/><span className="fs-sm">hdcp: {calculateTeamHdcp(matchup.opponent?.scores?.series, matchup.opponent?.teamHdcp)}</span>
                                </div>
                                <div className="d-none d-sm-block">
                                    {showMatchupDetails && <GameSummaryAndPoints teamScore={matchup.opponent?.scores} currentBreakpoint={currentBreakpoint}/>}
                                </div>
                            </Stack>
                        </div>
                    </Stack>
                    <Stack direction="horizontal" gap={0} className="d-block d-sm-none my-1">
                        <div>
                            {showMatchupDetails && <GameSummaryAndPoints teamNumber={teamDetails.number} teamScore={matchup.scores} currentBreakpoint={currentBreakpoint}/>}
                        </div>
                        <div>
                            {showMatchupDetails && <GameSummaryAndPoints teamNumber={opponent?.number} teamScore={matchup.opponent?.scores} currentBreakpoint={currentBreakpoint}/>}
                        </div>
                        {/* Expand / Collapse for small screens */}
                        {showMatchupDetails && <div className="border border-primary-subtle bg-secondary my-1">
                            <div className="mx-auto d-table">
                                <Link to="#" onClick={() => {toggleVisiblity(matchup.week)}}>{isVisible(matchup.week)?
                                    <><BoxArrowUp className="fw-bold fs-sm"/> <span className="fs-sm">Hide Details</span></> :
                                    <><BoxArrowDown className="fw-bolder fs-sm"/> <span className="fs-sm">Show Details</span></>}
                                </Link>
                            </div>
                        </div>}
                    </Stack>
                </CardBody>
                <CardBody className={`p-0 mx-1 my-1 ${isVisible(matchup.week) ? "d-block" : "d-none"}`}>
                    {showMatchupDetails && <MatchupDetailsDisplay leagueDetails={leagueDetails} teamDetails={teamDetails} matchup={matchup} currentBreakpoint={currentBreakpoint} />}
                </CardBody>
                <div className="my-auto"/>
            </Card>
        </Col>
    </>);
}

interface LeagueTeamMatchupsProps {
    leagueDetails: LeagueDetails | null;
    teamDetails: TrackedLeagueTeam;
    currentBreakpoint: Breakpoint;
    leagueDetailsLoading: boolean;
}
const LeagueTeamMatchup : FC<LeagueTeamMatchupsProps> = ({leagueDetails, teamDetails, leagueDetailsLoading, currentBreakpoint}) => {
    return (<>
        {leagueDetailsLoading && <div className="card-body"><Loader/></div>}
        {teamDetails &&
            <CardBody className="px-0 py-1 border border-secondary-subtle">
                <Card className="mx-1">
                    <CardHeader className="text-white bg-dark text-center fw-bolder py-1">Matchups</CardHeader>
                    <CardBody className="mx-0 px-1 px-sm-2 py-2">
                        <Row className="row-cols-1 row-cols-lg-2 g-2">
                            {teamDetails.matchups.map(matchup => <MatchupDisplay leagueDetails={leagueDetails} matchup={matchup} teamDetails={teamDetails} currentBreakpoint={currentBreakpoint}/>)}
                        </Row>
                    </CardBody>
                </Card>
            </CardBody>
        }
    </>);
}

export default LeagueTeamMatchup;