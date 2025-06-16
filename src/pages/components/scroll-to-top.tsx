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

import {type FC, useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import {ArrowUpCircle} from "react-bootstrap-icons";

const ScrollToTop: FC = () => {

    const [isVisible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setVisible(scrollPosition > 200); // Would love for this to be variable based on the viewport, need to figure out how
        }

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({top: 0, behavior: "smooth"});
    }

    return (
        /* Back to top button. Inspiration from https://github.com/mdbootstrap/bootstrap-back-to-top-button */
        isVisible && (
        <>
            <Button type="button" className="btn btn-primary btn-floating btn-sm" id="btn-back-to-top" onClick={scrollToTop}>
                <ArrowUpCircle/>
            </Button>
        </>
        )
    );
}

export default ScrollToTop;