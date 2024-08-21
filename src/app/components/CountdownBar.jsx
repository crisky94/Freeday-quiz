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

    const segments = Array.from({ length: seconds }).map((_, index) => {
        const isActive = index < currentSeconds;
        const background = isActive
            ? 'linear-gradient(90deg, #ffffff 0%, #ffffffeb 100%)'
            : '#111111';

        return (
            <div
                key={index}
                style={{
                    flex: 1,
                    background,
                    transition: 'background 0.5s ease'
                }}
            />
        );
    });

    return (
        <div
            style={{
                display: 'flex',
                height: '10px',
                width: '100%',
                backgroundColor: '#111111',
                borderRadius: '5px',
                overflow: 'hidden',
                        }}
        >
            {segments}
        </div>
    );
};

export default CountdownBar;
