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

export class PlayerInfo {
    id: string;
    name: string;

    constructor(data :any) {
        this.id = data['id'];
        this.name = data['name'];
    }
}

export class Players {
    players: PlayerInfo[];

    constructor(data: any) {
        this.players = data['players']?.map((p :any) => new PlayerInfo(p)) ?? [];
        this.players.sort((a:any, b:any) => a.id.localeCompare(b.id));
    }
}