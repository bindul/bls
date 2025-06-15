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

// Using the Bootswatch lumen theme - Switch to CDN later: https://bootswatch.com/help/
import 'bootswatch/dist/lumen/bootstrap.min.css';
import './sass/bls.scss';

import {ContextCacheProvider} from "./pages/components/cache/context-cache.tsx";

import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {Route, Routes} from "react-router-dom";
import {HashRouter} from "react-router";

import Layout from "./pages/layout";
import Home from "./pages/home";
import League from "./pages/league";
import NoPage from "./pages/nopage";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout/>}>
                <Route index element={<Home/>}/>
                <Route path="/league/:leagueId?/:teamId?" element={<League/>}/>
                <Route path="*" element={<NoPage/>}/>
            </Route>
        </Routes>

    )
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <HashRouter>
            <ContextCacheProvider>
                <App/>
            </ContextCacheProvider>
        </HashRouter>
    </StrictMode>
)
