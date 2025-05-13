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

export class AvailableLeagues {
    seasons: LeagueSeason[];

    constructor(data: any) {
        this.seasons = data['seasons-leagues']?.map((sl :any) => new LeagueSeason(sl)) ?? [];
    }

    findLeague(leagueId: string) {
        for (let i = 0; i < this.seasons.length; i++) {
            if (this.seasons[i].leagues != null) {
                let league :LeagueInfo | undefined = this.seasons[i].leagues.find((league :LeagueInfo) => league.id === leagueId);
                if (league != undefined) {
                    return league;
                }
            }
        }
    }
}

export class LeagueSeason {
    season: string;
    leagues: LeagueInfo[];

    constructor(data: any) {
        this.season = data.season;
        this.leagues = data.leagues?.map((s :any) => new LeagueInfo(s)) ?? [];
    }
}

export class LeagueInfo {
    id: string;
    name: string;
    dataLoc?: string;
    hasData: boolean = false;
    ongoing: boolean = false;
    teams: LeagueInfoTeam[];

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        if (data["data-loc"] != undefined) {
            this.dataLoc = data["data-loc"];
            this.hasData = true;
        }
        if (data["ongoing"]) {
            this.ongoing = data["ongoing"];
        }
        this.teams = data.teams?.map((t: any) => t as LeagueInfoTeam) ?? [];
    }
}

export interface LeagueInfoTeam {
    id: string;
    name: string;
}