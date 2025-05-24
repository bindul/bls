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

import * as React from "react";
import {Badge, CardBody, CardFooter, CardHeader, CardTitle, Col, Container, Row} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import type {LeagueAccoladeType, LeagueDetails} from "../../../data/league/league-details";
import Loader from "../loader";
import {PlayCircleFill} from "react-bootstrap-icons";
import {type Breakpoint, BS_BP_XS} from "../ui-utils";
import {VacantOrAbsentOpponentScoring} from "../../../data/league/league-setup-config";
import {CollapsibleContainer} from "../collapsible-container";

interface CodeMaps {
    code: string;
    label: string;
}

const durationWeekLabels: CodeMaps[] = [
    {code: "WK", label: "Weeks"},
    {code: "MT", label: "Months"},
    {code: "TW", label: "Two Times a Week"},
    {code: "TW", label: "Fortnights"}
]

interface PropValueLineProps {
    prop: string;
    value: React.ReactNode;
}
function PropValueLine({ prop, value }: PropValueLineProps) {
    // return <div><span className="text-primary-emphasis">{prop} : </span><span>{value}</span></div>;
    return <Row><Col className="text-primary-emphasis">{prop}</Col><Col>: {value}</Col></Row>
}

function LeagueSummaryInfo({leagueDetails}: LeagueSummaryDataFunctionProps) {
    const mapDurationUnits = (code: string | undefined) => {
        return durationWeekLabels.find(dl => dl.code === code)?.label ?? "";
    }
    return (
        <>
            <PropValueLine prop="USBC Sanctioned" value={leagueDetails.usbcSanctioned ? "Yes" : "No"}/>
            <PropValueLine prop="Bowls On" value={leagueDetails.bowlingDays?.bowlsOn?.format("dddd[s]")}/>
            <PropValueLine prop="Practice Starts" value={leagueDetails.bowlingDays?.startTime?.format("h:mm a")}/>
            <PropValueLine prop="Start Date" value={leagueDetails.bowlingDays?.startDate?.format("ddd, MMM Do YYYY")}/>
            <PropValueLine prop="Games per Matchup" value={leagueDetails.bowlingDays?.gamesPerWeek}/>
            <PropValueLine prop="Duration" value={
                leagueDetails.bowlingDays?.duration + " " + mapDurationUnits(leagueDetails.bowlingDays?.durationUnit)
            }/>
            {leagueDetails.bowlingDays?.positionRounds &&
                <PropValueLine prop="Position Rounds" value={
                    leagueDetails.bowlingDays?.positionRounds.map((element, index) => {
                        let val = "";
                        if (index == 0) {
                            val = mapDurationUnits(element?.substring(0, 2)) + " "
                        }
                        val += element.substring(2) + " ";
                        return val;
                    })
                }/>
            }
            {leagueDetails.onlineScoring?.map(o =>
                <Card border="info" className="mt-1 mb-1 p-0">
                    <CardHeader className="py-1 px-2">Online Scoring</CardHeader>
                    <CardBody className="py-1 px-2">
                        <PropValueLine prop="Platform" value={o.platform}/>
                        {o.leagueSecretary && <>
                            <PropValueLine prop="Center Id" value={o.leagueSecretary.centerId}/>
                            <PropValueLine prop="League Id" value={o.leagueSecretary.leagueId}/>
                            {o.leagueSecretary.centerDashboardUrl &&
                                <a href={o.leagueSecretary.centerDashboardUrl} target="_blank" rel="noreferrer" className="float-start">Center Dashboard</a>}
                            {o.leagueSecretary.leagueDashboardUrl &&
                                <a href={o.leagueSecretary.leagueDashboardUrl} target="_blank" rel="noreferrer" className="float-end">League Dashboard</a>}
                        </>
                        }
                    </CardBody>
                </Card>
            )}
        </>);
}

function LeagueRules({leagueDetails}: LeagueSummaryDataFunctionProps) {
    const scoringRules = leagueDetails.scoringRules;
    if (scoringRules == undefined) {
        return <></>;
    }
    const createVacantOrAbsentScoringStatement = (voaos :VacantOrAbsentOpponentScoring | undefined) => {
        let out = "";
        if (voaos && voaos.allowed) {
            if (voaos.scoringType === "FORFEIT") {
                out += "Opponent Forfeit, all points awarded";
            } else if (voaos.scoringType === "POINTS_WITHIN_AVG") {
                out += "Score within"
                if (voaos.pointsWithinAverageConfig && voaos.pointsWithinAverageConfig.pointsWithinTeamAverage) {
                    out = out + " " + voaos.pointsWithinAverageConfig.pointsWithinTeamAverage;
                }
                out += " pins of team average / game"
            }
        }
        return out;
    }

    return (<>
        <PropValueLine prop="Team Lineup / Roster Size" value={`${scoringRules.lineup} / ${scoringRules.roster}`}/>
        <PropValueLine prop="Legal Minimum Lineup" value={scoringRules.legalMinLineup}/>
        <PropValueLine prop="Substitutes Allowed" value={scoringRules.subsAllowed ? "Yes" : "No"}/>
        <PropValueLine prop="Handicapped" value={scoringRules.handicap?.type != "NONE" ? "Yes" : "No"}/>
        {scoringRules.handicap &&
            scoringRules.handicap.type === "PCT_AVG_TO_TGT" &&
            scoringRules.handicap?.pctAvgToTargetConfig &&
            <PropValueLine prop="Handicap" value={<>
                <span className="text-info-emphasis">{scoringRules.handicap?.pctAvgToTargetConfig?.pctToTarget}%</span> of
                (<span className="text-info-emphasis">{scoringRules.handicap?.pctAvgToTargetConfig?.target}</span> - AVG)
            </>}/>
        }
        <PropValueLine prop="Blinds Allowed" value={scoringRules.blindPenalty?.allowed ? "Yes" : "No"}/>
        <PropValueLine prop="Blind Penalty" value={scoringRules.blindPenalty?.defaultPenalty}/>
        {scoringRules.blindPenalty?.missedMatchupsPenalty &&
            scoringRules.blindPenalty?.missedMatchupsPenalty > 0 &&
            <PropValueLine prop="Missed Days Blind Penalty" value={<>
                <span className="text-info-emphasis">{scoringRules.blindPenalty?.missedMatchupsPenalty}</span> pins after&nbsp;
                <span className="text-info-emphasis">{scoringRules.blindPenalty?.missedMatchupsThreshold}</span> days
            </>}/>
        }
        {scoringRules.pointScoring?.matchupPointScoringRule &&
            scoringRules.pointScoring?.matchupPointScoringRule === "PPG_PPS" &&
            scoringRules.pointScoring?.ppgPpsMatchupPointScoringConfig && <>
                <PropValueLine prop="Point Scoring" value={<>
                    <span className="text-info-emphasis">{scoringRules.pointScoring.ppgPpsMatchupPointScoringConfig.pointsPerGame}</span> /game +&nbsp;
                    <span className="text-info-emphasis">{scoringRules.pointScoring.ppgPpsMatchupPointScoringConfig.pointsPerSeries}</span> /series
                </>}/>
                <PropValueLine prop="Point On Tie" value={<>
                    <span className="text-info-emphasis">{scoringRules.pointScoring.ppgPpsMatchupPointScoringConfig.pointsPerGameOnTie}</span> /game +&nbsp;
                    <span className="text-info-emphasis">{scoringRules.pointScoring.ppgPpsMatchupPointScoringConfig.pointsPerSeriesOnTie}</span> /series
                </>}/>
                {scoringRules.pointScoring.ppgPpsMatchupPointScoringConfig.absentOpponentAllowed &&
                    <PropValueLine prop="Absent Opponent Scoring" value={scoringRules.pointScoring.ppgPpsMatchupPointScoringConfig.absentOpponentAllowed ? "Yes | " + createVacantOrAbsentScoringStatement(scoringRules.pointScoring.absentOpponentScoring) : "No"}/>
                }
                {scoringRules.pointScoring.ppgPpsMatchupPointScoringConfig.vacantOpponentAllowed &&
                    <PropValueLine prop="Vacant Team Opponent Scoring" value={scoringRules.pointScoring.ppgPpsMatchupPointScoringConfig.vacantOpponentAllowed ? "Yes | " + createVacantOrAbsentScoringStatement(scoringRules.pointScoring.vacantOpponentScoring) : "No"}/>
                }
            </>
        }
    </>);
}

function LeagueHonorRoll({leagueDetails} : LeagueSummaryDataFunctionProps) {
    const findPlayer = (playerId: string) => {
        let playerName: string = "UNKNOWN";
        leagueDetails.teams.forEach((team) => {
            playerName = team.roster.find(player => player.id === playerId)?.name ?? "UNKNOWN";
        })
        return playerName;
    }
    const findTeam = (teamId: string) => {
        return leagueDetails.teams.filter(team => team.id === teamId).map(team => team.name);
    }

    const accoladeLabels = new Map<LeagueAccoladeType, string>([
        ["IND-SCRATCH-GAME", "Scratch Game"],
        ["IND-SCRATCH-SERIES", "Scratch Series"],
        ["IND-GAME-OVER-AVERAGE", "Game over Average"],
        ["IND-SERIES-OVER-AVERAGE", "Series over Average"],
        ["IND-HIGH-AVERAGE", "High Average"],
        ["TEAM-SCRATCH-GAME", "Team Scratch Game"],
        ["TEAM-SCRATCH-SERIES", "Team Scratch Series"]
    ])

    const numberFormat = Intl.NumberFormat("en-US", {style: "decimal", maximumFractionDigits: 2})
    return (<>
        <Card border="info" className="mt-1 mb-1 p-0">
            <CardHeader className="py-1 px-2 text-white bg-info"><span className="fs-6">Honor Roll</span></CardHeader>
            {leagueDetails.leagueAccolades.map(accolade => (
                <CardBody className="py-1 px-1 my-0 mx-2">
                    <Container>
                        <Row>
                            <Col className="bg-info-subtle text-info-emphasis">{accoladeLabels.get(accolade.type)}</Col>
                        </Row>
                        <Row>
                            <Col>{accolade.when?.format("DD MMM")}</Col>
                            <Col className="col-auto text-start">{accolade.type.startsWith("IND") ? findPlayer(accolade.who) : findTeam(accolade.who)}</Col>
                            <Col className="text-end">{(accolade.description && accolade.description.length > 0) ? accolade.description : numberFormat.format(accolade.howMuch)}</Col>
                        </Row>
                    </Container>
                </CardBody>))}
            <CardFooter><small>Honor Roll only considers achievements from <em>tracked teams</em>.</small></CardFooter>
        </Card>
    </>);
}

interface LeagueSummaryDataFunctionProps {
    leagueDetails: LeagueDetails;
}
interface LeagueSummaryDataProps {
    leagueDetails: LeagueDetails;
    currentBreakpoint: Breakpoint;
}
function LeagueSummaryData({leagueDetails, currentBreakpoint}: LeagueSummaryDataProps) {

    return (
    <>
        <Container fluid="true">
            {/*The notation below goes to 2 cols above sm, 3 cols above md: className="row row-cols-1 row-cols-sm-2 row-cols-md-3 justify-content-evenly"*/}
            <Row>
                <Col md={4}>
                    <Card className="text-start mx-0 mb-0 h-100" border="secondary">
                        <CollapsibleContainer divId="league-honor-roll" headerTitle="Honor Roll" currentBreakpoint={currentBreakpoint} hideBelowBreakpoint={BS_BP_XS}>
                            <CardBody className="py-1 py-sm-2">
                                <LeagueHonorRoll leagueDetails={leagueDetails}/>
                            </CardBody>
                        </CollapsibleContainer>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-start mx-0 mb-0 h-100" border="secondary">
                        <CollapsibleContainer divId="league-rules" headerTitle="League Rules" currentBreakpoint={currentBreakpoint} hideBelowBreakpoint={BS_BP_XS}>
                            <CardBody className="py-1 py-sm-2">
                                <LeagueRules leagueDetails={leagueDetails}/>
                            </CardBody>
                        </CollapsibleContainer>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-start mx-0 mb-0 h-100" border="secondary">
                        <CollapsibleContainer divId="league-info" headerTitle="League Info" currentBreakpoint={currentBreakpoint} hideBelowBreakpoint={BS_BP_XS}>
                            <CardBody className="py-1 py-sm-2">
                                <LeagueSummaryInfo leagueDetails={leagueDetails} />
                            </CardBody>
                        </CollapsibleContainer>
                    </Card>
                </Col>
            </Row>
        </Container>
    </>);
}

export interface LeagueSummaryParams {
    leagueDetails: LeagueDetails | null;
    leagueDetailsLoading: boolean;
    currentBreakpoint: Breakpoint;
    children?: React.ReactNode;
}

const LeagueSummary: React.FC<LeagueSummaryParams> = ({leagueDetails, leagueDetailsLoading, currentBreakpoint, children}) => {
    return (
        <>
            <Card border="primary" className="mb-2 mx-0 px-0">
                <CardHeader className="px-2">
                    League Summary
                    {leagueDetails && !leagueDetails.completed && <Badge bg="success" className="align-middle float-end"><PlayCircleFill/> Ongoing</Badge>}
                </CardHeader>
                {/*Still Loading*/}
                {leagueDetailsLoading && <div className="card-body"><Loader/></div>}
                {leagueDetails &&
                    <CardBody className="px-2">
                        <CardTitle as="h4" className="pb-2 d-flex justify-content-center">
                            <div className="text-center">{leagueDetails.season} {leagueDetails.name}&nbsp;<small className="text-body-secondary">@ {leagueDetails?.center}</small></div>
                        </CardTitle>
                        <LeagueSummaryData leagueDetails={leagueDetails} currentBreakpoint={currentBreakpoint}/>
                    </CardBody>
                    }
            </Card>
            {children}
        </>);
}

export default LeagueSummary;