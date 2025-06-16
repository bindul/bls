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

import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject("LeagueInfoTeam")
export class LeagueInfoTeam {
    @JsonProperty("id", String)
    id: string | undefined = undefined;

    @JsonProperty("name", String)
    name: string | undefined = undefined;
}

@JsonObject("LeagueInfo")
export class LeagueInfo {
    @JsonProperty("id", String)
    id: string | undefined = undefined;

    @JsonProperty("name", String)
    name: string | undefined = undefined;

    @JsonProperty("data-loc", String)
    dataLoc?: string = undefined;

    @JsonProperty("ongoing", Boolean)
    ongoing = false;

    @JsonProperty("teams", [LeagueInfoTeam])
    teams: LeagueInfoTeam[] = [];

    hasData () :boolean {
        return (this.dataLoc != undefined && this.dataLoc.length > 0);
    }
}

@JsonObject("LeagueSeason")
export class LeagueSeason {
    @JsonProperty("season", String)
    season: string | undefined = undefined;

    @JsonProperty("leagues", [LeagueInfo])
    leagues: LeagueInfo[] = [];
}

@JsonObject("AvailableLeagues")
export class AvailableLeagues {

    @JsonProperty("seasons-leagues", [LeagueSeason])
    seasons: LeagueSeason[] = [];

    findLeague(leagueId: string) {
        for (const item of this.seasons) {
            if (item.leagues.length > 0) {
                const league :LeagueInfo | undefined = item.leagues.find((league :LeagueInfo) => league.id === leagueId);
                if (league != undefined) {
                    return league;
                }
            }
        }
    }
}