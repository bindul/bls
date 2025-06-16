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
import {type FC, useCallback} from "react";
import moment from "moment";

import {Card, CardBody, CardHeader, CardText, CardTitle, Stack} from "react-bootstrap";

import {compareMoments} from "../../../data/utils/utils";
import {NEWS_CACHE_CATEGORY, newsFetcher} from "../../../data/news/news-api";
import type {News} from "../../../data/news/news-items";
import {useCachedFetcher} from "../cache/data-loader";
import Loader from "../loader";
import ErrorDisplay from "../error-display";

const NewsHighlights : FC = () => {
    const fetcher = useCallback(newsFetcher, []);
    const { data, isLoading, error } = useCachedFetcher<News>(fetcher, NEWS_CACHE_CATEGORY);

    const twoWeeksBack = moment().subtract(import.meta.env.VITE_NEWS_EXPIRED_AFTER_DAYS, 'd');

    return (<>
        <Card border="success" className="mb-3">
            <CardHeader as="h4">Recent Highlights</CardHeader>
            {isLoading && <CardBody><Loader /></CardBody>}
            {(error != null) && <ErrorDisplay message="Error loading news highlights." error={error} />}
            {data?.newsItems.filter(ni => ni.date.isSameOrAfter(twoWeeksBack))
                .sort((a, b) => compareMoments(a.date, b.date))
                .map((ni, idx) =>
                <CardBody className="border border-secondary py-1 my-1" key={"news-" + idx.toString()}>
                    <Stack direction="horizontal" gap={3}>
                        <div>{ni.date.format("DD MMM")}</div>
                        <div>
                            <Stack direction="vertical">
                                <CardTitle as="h6">{ni.title}</CardTitle>
                                <CardText className="fs-sm">{ni.text}</CardText>
                            </Stack>
                        </div>
                    </Stack>
                </CardBody>
            )}
        </Card>
    </>);
}

export default NewsHighlights;