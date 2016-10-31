import React, { Component } from 'react';

import styles from './Example.css';

export default class ExampleCSSIcon extends Component {

    render() {
        return (
            <div>
                <h1>Example CSS Icon</h1>
                <p>This is an SVG icon rendered via CSS</p>
                <div className={styles.icon} />
            </div>
        );
    }

}
