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

import {AvailableLeagues} from "../../../data/league/league-info";
import {createContext, useContext} from "react";
import * as React from "react";

export interface LeagueListContextInfo {
    leagues?: AvailableLeagues;
    lastUpdated: Date;
}

const LeagueListContext = createContext<LeagueListContextInfo | undefined>(undefined);

interface LeagueContextProviderParams {
    children?: React.ReactNode;
}

export const LeagueContextContextProvider: React.FC<LeagueContextProviderParams> = ({children} :LeagueContextProviderParams) => {
    const LeagueListContextInfo = {
        lastUpdated: new Date(),
    }
    return  (
        <LeagueListContext.Provider value={LeagueListContextInfo}>
            {children}
        </LeagueListContext.Provider>
    );
}

export const useLeagueListContext = () => {
    return useContext(LeagueListContext);
}
