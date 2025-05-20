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

import {useCallback} from "react";
import * as React from "react";
import {CardBody, CardHeader, CardTitle} from "react-bootstrap";
import Card from "react-bootstrap/Card";
import {
    LEAGUE_DETAILS_CACHE_CATEGORY,
    leagueTeamDetailsFetcher
} from "../../../data/league/league-api.ts";
import type {LeagueDetails} from "../../../data/league/league-details";
import {type LeagueInfo} from "../../../data/league/league-info";
import {useCachedFetcher} from "../../../data/utils/data-loader";
import ErrorDisplay from "../error-display";
import Loader from "../loader.tsx";

export interface LeagueSummaryParams {
    leagueInfo?: LeagueInfo;
    children?: React.ReactNode;
}

const LeagueSummary: React.FC<LeagueSummaryParams> = ({leagueInfo, children}) => {
    const fetcher = useCallback((dataLoc :string) => leagueTeamDetailsFetcher(dataLoc), []);

    if (leagueInfo == null || leagueInfo.dataLoc == null) {
        return <ErrorDisplay message="Incorrect League ID. Please select a correct league."/>
    }

    const {data, isLoading, error } = useCachedFetcher<LeagueDetails>(fetcher.bind(null, leagueInfo.dataLoc), LEAGUE_DETAILS_CACHE_CATEGORY, leagueInfo.id);
    // console.debug(data);

    return (
        <>
            <Card border="primary" className="mb-3">
                <CardHeader>League Summary</CardHeader>
                {/*Still Loading*/}
                {isLoading && <div className="card-body"><Loader/></div>}
                {/*Set error handling here, or the rest of the component does not get displayed*/}
                {error && <ErrorDisplay message="Error loading league information, please try later or talk to someone."  error={error}/>}
                {data &&
                    <CardBody>
                        <CardTitle as="h3" className="align-content-start">{data.season} {data.name}&nbsp;
                            <small className="text-body-secondary">@ {data?.center}</small>
                        </CardTitle>
                    </CardBody>
                    }
            </Card>
            {children}
        </>);
}

export default LeagueSummary;