import React, { Component } from 'react';

import exampleIcon from '../../images/example.svg';

/**
 * @class ExampleSVGIcon
 */
export default class ExampleSVGIcon extends Component {

    /**
     * Renders the SVG Icon example.
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <h1>Example SVG Icon</h1>
                <p>This is an SVG icon rendered via SVG</p>
                <svg viewBox={exampleIcon.viewBox}>
                    <use xlinkHref={exampleIcon.symbol} />
                </svg>
            </div>
        );
    }

}
