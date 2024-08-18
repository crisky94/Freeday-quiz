import { useEffect, useState } from 'react';

const CountdownBar = ({ seconds }) => {
    const [currentSeconds, setCurrentSeconds] = useState(seconds);

    useEffect(() => {
        if (currentSeconds > 0) {
            const interval = setInterval(() => {
                setCurrentSeconds(prev => prev - 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [currentSeconds]);

    const segments = Array.from({ length: seconds }).map((_, index) => (
        <div
            key={index}
            style={{
                flex: 1,
                backgroundColor: index < currentSeconds ? '#3498db' : '#ecf0f1',
                transition: 'background-color 0.5s ease'
            }}
        />
    ));

    return (
        <div
            style={{
                display: 'flex',
                height: '10px',
                width: '100%',
                backgroundColor: '#ecf0f1',
                borderRadius: '5px',
                overflow: 'hidden',
            }}
        >
            {segments}
        </div>
    );
};

export default CountdownBar;