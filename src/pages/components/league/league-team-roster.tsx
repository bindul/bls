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

import {LeaguePlayer, LeaguePlayerStats, TrackedLeagueTeam} from "../../../data/league/league-team-details";
import {type FC, lazy, Suspense, useEffect, useState} from "react";
import {type Breakpoint, BS_BP_SM, BS_BP_XS} from "../ui-utils";
import {CardBody, CardFooter, CardHeader, Col, Container, OverlayTrigger, Row, Table, Tooltip} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import Loader from "../loader";
import {Link} from "react-router-dom";
import {ConeStriped, PersonFillAdd, PersonFillLock, XCircle} from "react-bootstrap-icons";
import * as React from "react";
import type {LeagueAccolade} from "../../../data/league/league-details";
import {RatioGroup} from "../../../data/player/player-stats";

const TeamPlayerStatGraph = lazy(() => import("./league-player-stat-graph"));


export interface PlayerDayData {
    week: number;
    bowlDate: Date;
    enteringAvg: number;
    game1: number;
    game2: number;
    game3: number;
    series: number;
    average: number;
}
function createGameTableData(teamDetails: TrackedLeagueTeam, playerId: string) {
    const data : PlayerDayData[] = [];
    // data.push(["Weeks", "Entering Avg", "Game 1", "Game 2", "Game 3", "Series", "Average"]); // TODO Change 3 game assumption later
    teamDetails.matchups.forEach((matchup) => {
        const playerScore = matchup.scores?.playerScores.find(ps => ps.player === playerId);
        if (playerScore && !playerScore.games[0].blind) {
            // Assuming one game blind is all games blind
            const entry: PlayerDayData = {
                week: matchup.week,
                bowlDate: matchup.bowlDate?.toDate() ?? new Date(), // This should never happen, but just in case
                enteringAvg: playerScore.hdcpSettingDay ? 0 : playerScore.enteringAverage,
                game1: playerScore.games[0].scratchScore,
                game2: playerScore.games[1].scratchScore,
                game3: playerScore.games[2].scratchScore,
                series: playerScore.series.scratchScore,
                average: playerScore.series.average
            };
            data.push(entry);
        }
    });
    return data;
}

interface PlayerStatsDisplayProps {
    playerStats: LeaguePlayerStats;
}
function PlayerStatsDisplay ({playerStats}: PlayerStatsDisplayProps) {
    const writeAccolade = (accolade?: LeagueAccolade)=> {
        let retStr = "";
        if (accolade) {
            retStr = (accolade.description && accolade.description.length > 0) ? accolade.description : String(accolade.howMuch);
            retStr += " on ";
            retStr += accolade.when?.format("DD MMM");
        }
        return retStr;
    }

    const numberFormat = Intl.NumberFormat("en-US", {style: "decimal", maximumFractionDigits: 2});
    const percentFormat = Intl.NumberFormat("en-US", {style: "percent", maximumFractionDigits: 2});
    const writeRatioGroup = (rg : RatioGroup) => {
        let val = "";
        if (rg && rg.denominator > 0) {
            val = percentFormat.format(rg.pct) + " (" + rg.numerator + "/" + rg.denominator + ")";
        }
        return val;
    }
    const displayColLg = 3;
    const displayColMd = 6;

    return (<>
        <Container fluid="true">
            <Row className="gx-2">
                <Col md={displayColMd} lg={displayColLg}>
                    <Card className="text-start mx-0 mb-0 h-100" border="secondary">
                        <CardBody className="py-1 py-sm-2">
                            <WriteStatRow defn="Games" value={playerStats.gameStats.count}/>
                            <WriteStatRow defn="Games - Avg" value={numberFormat.format(playerStats.gameStats.average)}/>
                            <WriteStatRow defn="Games - Min" value={playerStats.gameStats.min}/>
                            <WriteStatRow defn="Games - Max" value={playerStats.gameStats.max}/>
                            <WriteStatRow defn="Games - SD" value={numberFormat.format(playerStats.gameStats.sd)}/>
                            <WriteStatRow defn="300 Games" value={playerStats.games300}/>
                            {playerStats.gameAverages.map((ga, idx) =>
                                <WriteStatRow defn={`Games ${idx + 1} Avg`} value={numberFormat.format(ga)}/>
                            )}
                        </CardBody>
                    </Card>
                </Col>
                <Col md={displayColMd} lg={displayColLg}>
                    <Card className="text-start mx-0 mb-0 h-100" border="secondary">
                        <CardBody className="py-1 py-sm-2">
                            <WriteStatRow defn="Series" value={playerStats.seriesStats.count}/>
                            <WriteStatRow defn="Series - Avg" value={numberFormat.format(playerStats.seriesStats.average)}/>
                            <WriteStatRow defn="Series - Min" value={playerStats.seriesStats.min}/>
                            <WriteStatRow defn="Series - Max" value={playerStats.seriesStats.max}/>
                            <WriteStatRow defn="Series - SD" value={numberFormat.format(playerStats.seriesStats.sd)}/>
                            <WriteStatRow defn="800 Series" value={playerStats.series800}/>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={displayColMd} lg={displayColLg}>
                    <Card className="text-start mx-0 mb-0 h-100" border="secondary">
                        <CardBody className="py-1 py-sm-2">
                            <WriteStatRow defn="Total Pinfall" value={playerStats.pinfall}/>
                            <WriteStatRow defn="Handicap" value={playerStats.handicap}/>
                            <WriteStatRow defn="Best Game over Avg" value={writeAccolade(playerStats.bestGameOverAverage)}/>
                            <WriteStatRow defn="Best Series over Avg" value={writeAccolade(playerStats.bestSeriesOverAverage)}/>
                            <WriteStatRow defn="Average Booster" value={playerStats.averageBoosterSeries} toolTipText={`Bowl a ${playerStats.averageBoosterSeries} series to increase average by 1 pin.`}/>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={displayColMd} lg={displayColLg}>
                    <Card className="text-start mx-0 mb-0 h-100" border="secondary">
                        <CardBody className="py-1 py-sm-2">
                            <WriteStatRow defn="First Ball Average" value={numberFormat.format(playerStats.firstBallAverage)}/>
                            <WriteStatRow defn="Clean Games" value={playerStats.cleanGames}/>
                            <WriteStatRow defn="Strikes" value={writeRatioGroup(playerStats.strikes)}/>
                            <WriteStatRow defn="Spares" value={writeRatioGroup(playerStats.spares)}/>
                            <WriteStatRow defn="Single Pin Spares" value={writeRatioGroup(playerStats.singlePinSpares)}/>
                            <WriteStatRow defn="Picked up Splits" value={writeRatioGroup(playerStats.splits)}/>
                            <WriteStatRow defn="Opens" value={writeRatioGroup(playerStats.opens)}/>
                            <WriteStatRow defn="Consecutive Strikes" value={<>
                                {playerStats.strikesInARow.map(s => <WriteStatRow defn={s[0]} value={s[1]}/>)}
                            </>}/>
                            <WriteStatRow defn="Strike Spare Ratio" value={writeRatioGroup(playerStats.strikesToSpares)}/>
                            <WriteStatRow defn="All Picked Up Avg" value={<><ConeStriped/> {playerStats.allSinglePinsPickedUpAverage} <ConeStriped/></>} toolTipText="Potential Average if all single pin spares were picked up. (Not yet implemented)"/>
                        </CardBody>
                        {playerStats.incompleteFrameData &&
                            <CardFooter><small>Some stats may be missing or incomplete as frame data is missing for some games.</small></CardFooter>
                        }
                    </Card>
                </Col>
            </Row>
        </Container>
    </>);
}

interface StatRowProps {
    defn: React.ReactNode;
    value: React.ReactNode;
    toolTipText?: string;
}
function WriteStatRow ({defn, value, toolTipText} : StatRowProps) {
    return (
        <Row className="border rounded-1 border-secondary">
            <Col className="text-body-emphasis bg-secondary px-1">
                {toolTipText && <OverlayTrigger overlay={
                    <Tooltip id={Math.random().toString()}>{toolTipText}</Tooltip>}>
                    <a href="#" onClick={(e) => e.preventDefault()}>{defn}</a>
                </OverlayTrigger>}
                {!toolTipText && defn}
                <span className="float-end">:</span>
            </Col>
            <Col className="px-1">{value}</Col>
        </Row>
    );
}

interface PlayerGamesTableProps {
    playerGameData : PlayerDayData[];
    currentBreakPoint : Breakpoint;
}
function PlayerGamesTable ({playerGameData, currentBreakPoint}: PlayerGamesTableProps) {
    const [transpose, setTranspose] = React.useState(false);

    useEffect(() => {
        let hideBelowBreakpoint: Breakpoint | null = null;
        if (playerGameData.length > 4) {
            hideBelowBreakpoint = BS_BP_XS;
        } else if (playerGameData.length > 8) {
            hideBelowBreakpoint = BS_BP_SM;
        }
        if (currentBreakPoint && hideBelowBreakpoint && currentBreakPoint.order <= hideBelowBreakpoint.order) {
            setTranspose(true);
        }
    }, [currentBreakPoint, playerGameData]);

    const numberFormat = Intl.NumberFormat("en-US", {style: "decimal", maximumFractionDigits: 2});
    return (<>
        <Container fluid="true">
            <Row>
                <Col className="align-content-center">
                    {transpose &&
                        <Table responsive={true} size="sm" bordered={true}>
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col">Wk</th>
                                    <th scope="col">Avg In</th>
                                    <th scope="col">Gm 1</th>
                                    <th scope="col">Gm 2</th>
                                    <th scope="col">Gm 3</th>
                                    <th scope="col">Ser</th>
                                    <th scope="col">Avg</th>
                                </tr>
                            </thead>
                            <tbody>
                            {playerGameData.map(p =>
                                <tr>
                                    <td>{p.week}</td>
                                    <td>{p.enteringAvg}</td>
                                    <td>{p.game1}</td>
                                    <td>{p.game2}</td>
                                    <td>{p.game3}</td>
                                    <td>{p.series}</td>
                                    <td className={p.average < p.enteringAvg ? "text-danger" : ""}>{numberFormat.format(p.average)}</td>
                                </tr>)}
                            </tbody>
                        </Table>
                    }
                    {!transpose &&
                        <Table responsive={true} size="sm" bordered={true}>
                            <thead className="table-dark">
                                <tr>
                                    <th scope="col">Week</th>
                                    {playerGameData.map(p => <th scope="col">{p.week}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th scope="row">Entering Avg</th>
                                    {playerGameData.map(p => <td>{p.enteringAvg}</td>)}
                                </tr>
                                <tr>
                                    <th scope="row">Game 1</th>
                                    {playerGameData.map(p => <td>{p.game1}</td>)}
                                </tr>
                                <tr>
                                    <th scope="row">Game 2</th>
                                    {playerGameData.map(p => <td>{p.game2}</td>)}
                                </tr>
                                <tr>
                                    <th scope="row">Game 3</th>
                                    {playerGameData.map(p => <td>{p.game3}</td>)}
                                </tr>
                                <tr>
                                    <th scope="row">Series</th>
                                    {playerGameData.map(p => <td>{p.series}</td>)}
                                </tr>
                                <tr>
                                    <th scope="row">Average</th>
                                    {playerGameData.map(p => <td className={p.average < p.enteringAvg ? "text-danger" : ""}>{numberFormat.format(p.average)}</td>)}
                                </tr>
                            </tbody>
                        </Table>
                    }
                </Col>
            </Row>
        </Container>
    </>);
}

interface PlayerDetailsProps {
    playerDetailsDisplay: string;
    teamDetails: TrackedLeagueTeam;
    closePlayerDetails: () => void;
    currentBreakpoint: Breakpoint;
}
function ShowPlayerDetails ({playerDetailsDisplay, teamDetails, closePlayerDetails, currentBreakpoint} : PlayerDetailsProps) {

    const [playerGameData, setPlayerGameData] = useState<PlayerDayData[]>([]);

    useEffect(() => {
        setPlayerGameData(createGameTableData(teamDetails, playerDetailsDisplay));
    }, [teamDetails, playerDetailsDisplay]);

    const player: LeaguePlayer | undefined = teamDetails.roster.find(p => p.id == playerDetailsDisplay);
    const playerStats: LeaguePlayerStats | undefined = player?.playerStats;
    // const playerGameData : PlayerDayData[] =

    return (
        <Card border="dark" className="mt-1 mb-1 p-0 mx-2">
            <CardHeader className="py-1 px-2 text-white bg-dark">
                <span className="fs-6">{player && player.name}</span>
                <span className="float-end"><a onClick={closePlayerDetails}><XCircle/></a></span>
            </CardHeader>
            {playerStats && (<>
                <CardBody className="px-2 py-2">
                    <PlayerStatsDisplay playerStats={playerStats}/>
                </CardBody>
                <CardBody className={"px-2 py-2"}>
                    <PlayerGamesTable playerGameData={playerGameData} currentBreakPoint={currentBreakpoint}/>
                </CardBody>
                <CardBody className={"px-2 py-2"}>
                    <Suspense fallback={<Loader />}>
                        <TeamPlayerStatGraph playerData={playerGameData}/>
                    </Suspense>
                </CardBody>
            </>)}
        </Card>
    );
}

interface LeagueTeamRosterProps {
    teamDetails: TrackedLeagueTeam;
    currentBreakpoint: Breakpoint;
    leagueDetailsLoading: boolean;
}
const LeagueTeamRoster: FC<LeagueTeamRosterProps> = ({teamDetails, currentBreakpoint, leagueDetailsLoading}: LeagueTeamRosterProps) => {
    const [playerDetailsDisplay, setPlayerDetailsDisplay] = useState<string | undefined>(undefined);

    const closePlayerDetails = () => {
        setPlayerDetailsDisplay(undefined);
    }

    return (<>
        {leagueDetailsLoading && <div className="card-body"><Loader/></div>}
        {teamDetails &&
            <CardBody className="px-0 py-1 border border-secondary-subtle">
                <Card className="mx-2">
                    <CardHeader className="text-white bg-dark text-center fw-bolder py-1">Roster</CardHeader>
                    <CardBody className="mx-0 px-0 py-2">
                            <Table responsive={true} size="sm" >
                                <thead>
                                <tr>
                                    {/*Some columns are hidden on smaller screens*/}
                                    <th>Player</th>
                                    <th>Games</th>
                                    <th className="d-none d-md-block">Scratch Pins</th>
                                    <th>Average</th>
                                    <th>Handicap</th>
                                    <th className="d-none d-md-block">Series Avg</th>
                                </tr>
                                </thead>
                                <tbody>
                                {teamDetails.roster.map(p => (
                                    <tr>
                                        <td>{p.status === "REGULAR" ? <PersonFillLock/> : <PersonFillAdd/>} <Link to="#" onClick={() => setPlayerDetailsDisplay(p.id)}>{p.name}</Link></td>
                                        <td>{p.playerStats?.gameStats.count}</td>
                                        <td className="d-none d-md-block">{p.playerStats?.pinfall}</td>
                                        <td>{p.playerStats?.gameStats.average.toFixed(2)}</td>
                                        <td>{p.playerStats?.handicap}</td>
                                        <td className="d-none d-md-block">{p.playerStats?.seriesStats.average.toFixed(2)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                    </CardBody>
                    <CardFooter><small>Click on player names to see advanced stats</small></CardFooter>
                </Card>
                {playerDetailsDisplay && <ShowPlayerDetails playerDetailsDisplay={playerDetailsDisplay} teamDetails={teamDetails} closePlayerDetails={closePlayerDetails} currentBreakpoint={currentBreakpoint}/>}
            </CardBody>
        }
    </>);
}

export default LeagueTeamRoster;