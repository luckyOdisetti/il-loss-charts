import { Card } from 'react-bootstrap';
import PropTypes from 'prop-types';
import FadeOnChange from 'components/fade-on-change';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});

function USDValueWidget({ title, value, footnote }) {
    const displayValue = formatter.format(parseFloat(value, 10));

    return (
        <Card className='stats-card no-border'>
            <Card.Body>
                <Card.Title className='stats-card-title'>{title}</Card.Title>
                <Card.Text className='stats-card-body'>
                    <FadeOnChange>{displayValue}</FadeOnChange>
                </Card.Text>
                <p className='card-footnote'>
                    <FadeOnChange>{footnote}</FadeOnChange>
                </p>
            </Card.Body>
        </Card>
    );
}

USDValueWidget.propTypes = {
    title: PropTypes.string,
    value: PropTypes.node.isRequired,
    footnote: PropTypes.node,
};

export default USDValueWidget;
