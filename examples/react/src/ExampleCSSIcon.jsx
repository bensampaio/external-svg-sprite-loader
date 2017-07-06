import React, { Component } from 'react';

import styles from './ExampleCSSIcon.css';

/**
 * @class ExampleCSSIcon
 */
export default class ExampleCSSIcon extends Component {

    /**
     * Renders the CSS Icon example.
     * @returns {XML}
     */
    render() {
        return (
            <div>
                <h1>Example CSS Icon</h1>
                <p>This is an SVG icon rendered via CSS</p>
                <div className={styles.code} />
                <div className={styles.tail} />
            </div>
        );
    }

}
