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

import type {PlayerDayData} from "./league-team-roster.tsx";
import type {ApexOptions} from "apexcharts";
import {Col, Container, Row} from "react-bootstrap";
import Chart from "react-apexcharts";
import {BS_BP_LG, BS_BP_XS, BS_BP_XXL} from "../ui-utils.tsx";

interface TeamPlayerStatGraphProps {
    playerData: PlayerDayData[];
}

const TeamPlayerStatGraph: React.FC<TeamPlayerStatGraphProps> = ({playerData}) => {
    const chartOptions : ApexOptions = {
        chart: {
            id: 'Player-Averages',
            type: 'line',
        },
        series: [
            {
                name: 'Averages',
                data: playerData.map(p => [p.bowlDate.getTime(), p.average]),
            },
        ],
        xaxis: {
            type: "datetime",
            labels: {
                format: 'dd-MMM'
            }
        },
        yaxis: {
            min: 100,
            max: 300,
            decimalsInFloat: 0
        },
        title: {
            text: "Player Averages"
        },
        noData: {
            text: "Loading..."
        },
        responsive: [
            {
                breakpoint: BS_BP_XS.maxWidth,
                options: {
                    chart: {
                        width: 300
                    },
                    legend: {
                        position: "bottom"
                    }
                }
            },
            {
                breakpoint: BS_BP_LG.maxWidth,
                options: {
                    chart: {
                        width: 450
                    }
                }
            },
            {
                breakpoint: BS_BP_XXL.maxWidth,
                options: {
                    chart: {
                        width: 600
                    }
                }
            }
        ]
    };

    return (
        <Container fluid="true">
            <Row>
                <Col className="d-flex justify-content-center">
                    <Chart
                        options={chartOptions}
                        series={chartOptions.series}
                        type="line"

                    />
                </Col>
            </Row>
        </Container>
    );
}

export default TeamPlayerStatGraph;