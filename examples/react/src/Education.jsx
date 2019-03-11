import React, { memo } from 'react';

import apple from '../../images/education/apple.svg';
import books from '../../images/education/books.svg';
import notebook from '../../images/education/notebook.svg';
import school from '../../images/education/school.svg';

import CssExample from './CssExample.jsx';
import styles from './Education.css';
import SvgExample from './SvgExample.jsx';

const Education = () => (
    <>
        <h1>Educations icons</h1>
        <CssExample list={Object.values(styles)} />
        <SvgExample list={[
            apple,
            books,
            notebook,
            school,
        ]} />
        <div>
            Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepick">Freepick</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" rel="noopener noreferrer" target="_blank" title="Creative Commons BY 3.0">CC 3.0 BY</a>
        </div>
    </>
);

export default memo(Education);
