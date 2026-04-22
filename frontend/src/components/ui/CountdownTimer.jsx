import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CountdownTimer = ({ targetDate, variant = 'compact', showTitle = true }) => {
    const [timeLeft, setTimeLeft] = useState(null);
    const [isEventDay, setIsEventDay] = useState(false);
    const [isOver, setIsOver] = useState(false);

    function calculateTimeLeft() {
        if (!targetDate) return null;
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                días: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hrs: Math.floor((difference / (1000 * 60 * 60)) % 24),
                min: Math.floor((difference / 1000 / 60) % 60),
                seg: Math.floor((difference / 1000) % 60),
            };
        } else {
            const target = new Date(targetDate);
            const now = new Date();
            const isSameDay = target.getDate() === now.getDate() &&
                              target.getMonth() === now.getMonth() &&
                              target.getFullYear() === now.getFullYear();
            return isSameDay ? "EVENT_DAY" : "OVER";
        }
        return timeLeft;
    }

    useEffect(() => {
        // Initial set
        const res = calculateTimeLeft();
        if (res === "EVENT_DAY") setIsEventDay(true);
        else if (res === "OVER") setIsOver(true);
        else setTimeLeft(res);

        const timer = setInterval(() => {
            const res = calculateTimeLeft();
            if (res === "EVENT_DAY") {
                setIsEventDay(true);
                setTimeLeft(null);
            } else if (res === "OVER") {
                setIsOver(true);
                setTimeLeft(null);
                clearInterval(timer);
            } else {
                setTimeLeft(res);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (isOver) return null;

    if (isEventDay) {
        return (
            <div className={`countdown-event-day ${variant}`}>
                <motion.span 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    ¡Hoy es el gran día!
                </motion.span>
            </div>
        );
    }

    if (!timeLeft) return null;

    if (variant === 'compact') {
        return (
            <div className="countdown-compact">
                <span>{timeLeft.días}D {String(timeLeft.hrs).padStart(2, '0')}H</span>
            </div>
        );
    }

    return (
        <div className="countdown-luxe-container">
            {showTitle && <h2 className="countdown-title">¿CUANTO FALTA?</h2>}
            <div className="countdown-circles">
                {Object.entries(timeLeft).map(([unit, value], i) => (
                    <motion.div 
                        key={unit} 
                        className="countdown-circle-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className="circle-border">
                            <div className="circle-content">
                                <span className="value">{String(value).padStart(2, '0')}</span>
                                <span className="unit">{unit.toUpperCase()}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <style>{`
                .countdown-luxe-container {
                    text-align: center;
                    margin: 20px 0;
                    user-select: none;
                }
                .countdown-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 28px;
                    letter-spacing: 6px;
                    color: rgba(255,255,255,0.7);
                    margin-bottom: 30px;
                    font-weight: 400;
                    text-transform: uppercase;
                }
                .countdown-circles {
                    display: flex;
                    justify-content: center;
                    gap: 30px;
                    flex-wrap: wrap;
                }
                .countdown-circle-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                .circle-border {
                    width: 110px;
                    height: 110px;
                    border-radius: 50%;
                    padding: 4px;
                    background: linear-gradient(135deg, #B76E79, #EABFB9, #B76E79, #8C565E);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                }
                .circle-content {
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 182, 193, 0.15);
                    backdrop-filter: blur(5px);
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                }
                .circle-content .value {
                    font-size: 32px;
                    font-weight: 700;
                    line-height: 1;
                    color: #fff;
                    font-family: 'Inter', sans-serif;
                }
                .circle-content .unit {
                    font-size: 9px;
                    letter-spacing: 2px;
                    margin-top: 4px;
                    color: rgba(255,255,255,0.7);
                    font-weight: 600;
                }

                .countdown-compact {
                    position: absolute !important;
                    top: 10px !important;
                    right: 10px !important;
                    background: rgba(183, 110, 121, 0.4);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(183, 110, 121, 0.5);
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 800;
                    color: #fff;
                    z-index: 10;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                }

                .countdown-event-day {
                    font-family: 'Dancing Script', cursive;
                    color: #B76E79;
                    font-weight: 700;
                }
                .countdown-event-day.luxe {
                    font-size: 42px;
                    text-align: center;
                    margin: 40px 0;
                }
                .countdown-event-day.compact {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    font-size: 14px;
                    background: rgba(255,255,255,0.1);
                    padding: 4px 12px;
                    border-radius: 20px;
                    z-index: 5;
                }

                @media (max-width: 600px) {
                    .countdown-circles { gap: 15px; }
                    .circle-border { width: 85px; height: 85px; }
                    .circle-content .value { font-size: 24px; }
                    .circle-content .unit { font-size: 8px; }
                    .countdown-title { font-size: 20px; letter-spacing: 4px; }
                }
            `}</style>
        </div>
    );
};

export default CountdownTimer;
