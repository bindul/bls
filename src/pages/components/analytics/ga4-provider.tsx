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

import {type ReactNode, type FC, useEffect} from "react";
import {useLocation} from "react-router";
import ReactGA from "react-ga4";

const ANALYTICS_TEST_MODE :boolean = import.meta.env.VITE_GA4_TESTMODE;
const DEFAULT_GA4_TRACKING_ID :string = import.meta.env.VITE_GA4_TRACKING_ID;

interface G4ProviderParams {
    trackingId?: string;
    children?: ReactNode;
}

const G4Provider: FC<G4ProviderParams> = ({trackingId = DEFAULT_GA4_TRACKING_ID, children}) => {
    const location = useLocation(); // Get current location for pageview tracking

    useEffect(() => {
        if (ANALYTICS_TEST_MODE) {
            ReactGA.initialize(trackingId, {testMode: true});
        } else {
            ReactGA.initialize(trackingId);
        }
    }, [trackingId])

    useEffect(() => {
        // Track pageviews on route changes
        // TODO Figure out other modes of tracking
        ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search });
    }, [location]);

    return <>{children}</>;
}

export default G4Provider;