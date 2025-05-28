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

import type {LeagueDetails} from "../../../data/league/league-details.ts";
import {Frame, type FrameAttributes, type LeagueMatchup, type ScoreLabel} from "../../../data/league/league-matchup.ts";
import {TrackedLeagueTeam} from "../../../data/league/league-team-details.ts";
import {type Breakpoint, BS_BP_XS, BS_BP_XXL, isBreakpointSmallerThan} from "../ui-utils.tsx";
import {type FC, type ReactElement, type ReactNode, useEffect, useMemo, useState} from "react";
import {Row, Col, Badge, Table, CardBody, OverlayTrigger, Tooltip} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import ListGroupItem from "react-bootstrap/ListGroupItem";
import * as icons from 'react-bootstrap-icons';
import {Dot} from "react-bootstrap-icons";
import {CollapsibleContainer} from "../collapsible-container.tsx";

interface IconProps extends icons.IconProps {
    iconName: keyof typeof icons;
}
export const Icon = ({iconName, ...props}: IconProps) => {
    const BootstrapIcon = icons[iconName];
    return <BootstrapIcon {...props}/>;
}

interface FrameAttributeIconInfo {
    attribute: FrameAttributes;
    description: string;
    iconColor: string;
    iconName: keyof typeof icons;
}
const FrameAttributeIcons : Map<FrameAttributes, FrameAttributeIconInfo> = new Map([
    ["Hung", {attribute: "Hung", description: "Got Hung!", iconColor: "red", iconName: "Icon0CircleFill"}],
    ["Star", {attribute: "Star", description: "Beer / Star Frame!", iconColor: "indigo", iconName: "Icon1CircleFill"}],
    ["Gutter-Spare", {attribute: "Gutter-Spare", description: "Gutter - Spare!", iconColor: "teal", iconName: "Icon2CircleFill"}],
    ["Turkey", {attribute: "Turkey", description: "Gobble Gobble... Turkey!", iconColor: "black", iconName: "Icon3CircleFill"}],
    ["Split-Picked-Up", {attribute: "Split-Picked-Up", description: "Split 2 Spare!", iconColor: "cyan", iconName: "Icon4CircleFill"}],
    ["Clean-Game", {attribute: "Clean-Game", description: "Clean Game!", iconColor: "green", iconName: "Icon8CircleFill"}],
    ["Perfect-Game", {attribute: "Perfect-Game", description: "Perfect Game!!!", iconColor: "orange", iconName: "Icon9CircleFill"}],
]);

const findPlayer = (teamDetails: TrackedLeagueTeam, playerId: string | undefined) => {
    return teamDetails.roster.find(player => player.id === playerId)?.name ?? "UNKNOWN";
}

interface OverlaywithTooltipProps {
    children: ReactElement;
    tooltip: ReactNode;
}
const OverlayWithTooltip = ({children, tooltip}: OverlaywithTooltipProps) =>
    (<OverlayTrigger overlay={<Tooltip id={Math.random().toString()}>{tooltip}</Tooltip>}>{children}</OverlayTrigger>);

interface FrameAttributeIconProps {
    attribute: FrameAttributes;
}
const FrameAttributeIcon = ({attribute}: FrameAttributeIconProps) => {


    // "Hung" | "Star" | "Turkey" | "Perfect-Game" | "Clean-Game" | "Gutter-Spare" | "Split-Picked-Up"
    const iconInfo = FrameAttributeIcons.get(attribute);
    return (<>
        {iconInfo && <OverlayWithTooltip tooltip={iconInfo.description}><Icon iconName={iconInfo.iconName} color={iconInfo.iconColor}/></OverlayWithTooltip>}
    </>);
}

interface TeamIndSeriesGameFramesProps extends MatchupDetailsDisplayProps {
    gameIdx: number;
}
const TeamIndSeriesGameFrames = ({matchup, teamDetails, currentBreakpoint, gameIdx}: TeamIndSeriesGameFramesProps) => {

    const [smallScreen, setSmallScreen] = useState(false);
    const playerNames: string[] | undefined = useMemo(() => matchup.scores?.playerScores.map(ps => findPlayer(teamDetails, ps.player)), [matchup, teamDetails]);
    const frames: Frame[][] | undefined = useMemo(() => matchup.scores?.playerScores.map(ps => ps.games[gameIdx].frames), [matchup, gameIdx]);
    useEffect(() => {
        setSmallScreen(isBreakpointSmallerThan(currentBreakpoint, BS_BP_XS) ?? false);
    }, [currentBreakpoint]);

    const writeScoreOrLabel = (b: [number, ScoreLabel?]) => {
        if (b[1]) {
            if (b[1] === "X") {
                return <span className="text-white bg-dark">X</span>
            } else if (b[1] === "/") {
                return <span className="text-white bg-dark">/</span>
            } else if (b[1] === "-" || b[1] === "F") {
                return <span className="">{b[1]}</span>
            } else if (b[1] === "S") {
                return <span className="text-decoration-underline">{b[0]}</span>
            }
        } else {
            return <span className="">{b[0]}</span>
        }
    }

    const writeScoreLabelRow = (f: Frame)=> {
        return (<><td className="p-1 m-0 justify-content-evenly">
            {writeScoreOrLabel(f.ballScores[0])}
            {f.ballScores.length > 1 && writeScoreOrLabel(f.ballScores[1])}
            {f.number == 10 && (f.ballScores.length > 2 && writeScoreOrLabel(f.ballScores[0]))}
        </td>
        </>);
    }

    return (<>
        {playerNames && frames &&
            <Table bordered size="sm" className={`p-0 lh-1 mx-0 my-1 text-center font-monospace fw-lighter ${smallScreen ? "fs-xxs" : "fs-xs"}`}>
                <tbody>
                    <tr>
                        <td className="p-0 m-0"></td>
                        {frames[0].map(f => <td className="p-0 m-0">{f.number}</td>)}
                    </tr>
                    {playerNames.map((pn, pi) => <>
                        <tr>
                            <td scope="row" className="align-middle p-1 m-0 border-bottom-0" rowSpan={2}>{pn.substring(0,2)}</td>
                            {frames[pi].map(f => writeScoreLabelRow(f))}
                        </tr>
                        <tr>
                            {frames[pi].map(f => <td className="p-1 m-0">{f.cumulativeScore}</td>)}
                        </tr>
                        <tr>
                            <td className="p-0 m-0 border-top-0"><Dot/></td>
                            {frames[pi].map(f => <td className="p-1 m-0">
                                {f.attributes?.map(a => <FrameAttributeIcon attribute={a}/>)}
                            </td>)}
                        </tr>
                    </>)}
                </tbody>
            </Table>
        }
    </>);
}

const TeamIndSeriesGameScoresSummary = ({matchup, teamDetails, currentBreakpoint}: MatchupDetailsDisplayProps) => {

    console.log(matchup.scores);
    return (<>
        <Table size="sm" bordered striped responsive={true} className={`p-0 lh-1 my-1 text-end ${isBreakpointSmallerThan(currentBreakpoint, BS_BP_XS) ? "fs-xs" : ""}`}>
            <thead>
                <tr>
                    <th>Player</th>
                    <th scope="col">Ent Avg</th>
                    <th scope="col">Gm 1</th>
                    <th scope="col">Gm 2</th>
                    <th scope="col">Gm 3</th>
                    <th scope="col">SS</th>
                    <th scope="col">+ Hdcp</th>
                </tr>
            </thead>
            <tbody>
                {matchup.scores?.playerScores.map(ps =>
                <tr>
                    <th scope="row text-truncate">{findPlayer(teamDetails, ps.player)}</th>
                    <td className="text-body-tertiary text-end">{ps.enteringAverage}</td>
                    {ps.games.map(g =>
                        <td className="text-end">{g.blind ? <Badge bg="dark" className="float-start">B</Badge> : ""}{g.effectiveScratchScore}</td>
                    )}
                    <td className="text-body-emphasis  text-end">{ps.series.effectiveScratchScore}</td>
                    <td className="text-body-emphasis  text-end">{ps.series.hdcpScore}</td>
                </tr>
                )}
                <tr>
                    <th scope="row" colSpan={2}>Team Gm</th>
                    {matchup.scores?.games.map(g =>
                        <td className="text-body-emphasis text-end">{g.effectiveScratchScore}</td>
                    )}
                    <td className="text-end">{matchup.scores?.series.effectiveScratchScore}</td>
                    <td></td>
                </tr>
                <tr>
                    <th scope="row" colSpan={2}>+ HDCP</th>
                    {matchup.scores?.games.map(g =>
                        <td className="text-primary-emphasis text-end">{g.hdcpScore}</td>
                    )}
                    <td className="text-primary-emphasis text-end">{matchup.scores?.series.hdcpScore}</td>
                    <td></td>
                </tr>
            </tbody>
        </Table>
    </>);
}

interface MatchupDetailsDisplayProps {
    leagueDetails: LeagueDetails | null;
    matchup: LeagueMatchup;
    teamDetails: TrackedLeagueTeam;
    currentBreakpoint?: Breakpoint;
}
const MatchupDetailsDisplay: FC<MatchupDetailsDisplayProps> = ({leagueDetails, matchup, teamDetails, currentBreakpoint}: MatchupDetailsDisplayProps) => {
    const [hasFrameData, setHasFrameData] = useState(true);

    useEffect(() => {
        matchup.scores?.playerScores.forEach(ps => ps.games.forEach(psg => {
            if (!psg.blind && (!psg.frames || psg.frames.length == 0)) {
                setHasFrameData(false); // We are missing frame data for this matchup
            }
        }))
    }, [matchup]);

    return (<>
        <Row className="gy-1 gx-1">
            <Col>
                <Card className="my-1 mx-0">
                    <CardBody className="p-1">
                        <TeamIndSeriesGameScoresSummary leagueDetails={leagueDetails} matchup={matchup} teamDetails={teamDetails} currentBreakpoint={currentBreakpoint}/>
                    </CardBody>
                </Card>
            </Col>
        </Row>
            {hasFrameData &&
                <Row className="gy-1 gx-1">
                    <Col>
                        <Card className="p-0 m-0">
                            <CollapsibleContainer headerTitle={"Frame Data"} divId={matchup.week + "-framedata"} currentBreakpoint={currentBreakpoint} hideBelowBreakpoint={BS_BP_XXL}>
                                <CardBody className="p-0 m-0">
                                    <Row className="row-cols-1 gy-2 gx-2 m-0 p-0">
                                        {matchup.scores?.games.map((_game, g) =>
                                            <Col>
                                                <Card className="my-1 mx-0 h-100">
                                                    <CardBody className="p-1">
                                                        <TeamIndSeriesGameFrames leagueDetails={leagueDetails} matchup={matchup} teamDetails={teamDetails} currentBreakpoint={currentBreakpoint} gameIdx={g}/>
                                                    </CardBody>
                                                </Card>
                                            </Col>
                                        )}
                                    </Row>
                                </CardBody>
                            </CollapsibleContainer>
                        </Card>
                    </Col>
                </Row>
            }
        {matchup.notes && matchup.notes.length > 0 &&
            <Row>
                <Col>
                    <Card className="my-2 mx-0">
                        <CardBody className="p-1">
                            <Card.Subtitle className="p-2 mb-0 d-none d-sm-block">Notes</Card.Subtitle>
                            <ListGroup variant="flush">
                                {matchup.notes.map(n => <ListGroupItem className="fs-sm py-0 px-2 m-0">{n}</ListGroupItem>)}
                            </ListGroup>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        }
    </>);
}

export default MatchupDetailsDisplay;