import React, { memo } from 'react';

import armchairSilhouette from '../../images/glypho/armchairSilhouette.svg';
import facebook from '../../images/glypho/facebook.svg';
import flaskOutline from '../../images/glypho/flaskOutline.svg';
import heartRateMonitor from '../../images/glypho/heartRateMonitor.svg';
import houseOutline from '../../images/glypho/houseOutline.svg';
import layersIcon from '../../images/glypho/layersIcon.svg';
import oldFashionBriefcase from '../../images/glypho/oldFashionBriefcase.svg';
import quaverOutline from '../../images/glypho/quaverOutline.svg';
import speechBubblesOutline from '../../images/glypho/speechBubblesOutline.svg';
import switchesOnAndOff from '../../images/glypho/switchesOnAndOff.svg';
import videoPlayerOutline from '../../images/glypho/videoPlayerOutline.svg';

import CssExample from './CssExample.jsx';
import styles from './Glypho.css';
import SvgExample from './SvgExample.jsx';

const Glypho = () => (
    <>
        <h1>Glypho icons</h1>
        <CssExample list={Object.values(styles)} />
        <SvgExample list={[
            armchairSilhouette,
            facebook,
            flaskOutline,
            heartRateMonitor,
            houseOutline,
            layersIcon,
            oldFashionBriefcase,
            quaverOutline,
            speechBubblesOutline,
            switchesOnAndOff,
            videoPlayerOutline,
        ]} />
        <div>
            Icons made by <a href="https://www.flaticon.com/authors/bogdan-rosu" title="Bogdan Rosu">Bogdan Rosu</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" rel="noopener noreferrer" target="_blank" title="Creative Commons BY 3.0">CC 3.0 BY</a>
        </div>
    </>
);

export default memo(Glypho);
