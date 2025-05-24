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

import type {LeagueDetails} from "../../../data/league/league-details";
import Loader from "../loader";
import * as React from "react";
import Card from "react-bootstrap/Card";
import {CardBody, CardFooter, CardHeader, Col, Container, Row, Table} from "react-bootstrap";

interface OtherTeamsProps {
    leagueDetails: LeagueDetails | null;
    leagueDetailsLoading: boolean;
    children?: React.ReactNode;
}

const OtherTeams: React.FC<OtherTeamsProps> = ({leagueDetails, leagueDetailsLoading, children}) => {
    // TODO - Add a wrapper container
    return (
        <>
            <Card border="primary" className="mt-2 mb-2 mx-0 px-0">
                <CardHeader className="px-2">Other League Teams</CardHeader>
                {/*Still Loading*/}
                {leagueDetailsLoading && <div className="card-body"><Loader/></div>}
                {leagueDetails && leagueDetails.otherTeams &&
                    <CardBody className="px-2">
                        <Container fluid>
                            <Table className="table-responsive-sm">
                                <thead>
                                    <tr>
                                        <th>Div</th>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Players</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {leagueDetails.otherTeams.map(otherTeam => (
                                    <tr>
                                        <td>{otherTeam.division}</td>
                                        <td>{otherTeam.number}</td>
                                        <td>{otherTeam.name}</td>
                                        <td>
                                            <Container fluid>
                                                <Row>
                                                    {otherTeam.players && otherTeam.players.map(player => (
                                                        <Col md={3} className="px-0">{player}</Col>
                                                    ))}
                                                </Row>
                                            </Container>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </Container>
                    </CardBody>
                }
                <CardFooter><small>These are usually only teams our <em>tracked teams</em> have played against.</small></CardFooter>
            </Card>
            {children}
        </>
    );
}

export default OtherTeams;