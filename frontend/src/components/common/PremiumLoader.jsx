import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PremiumLoader = ({ messageOverride }) => {
    const messages = [
        "Elevando tu experiencia...",
        "Afinando cada detalle de tu evento...",
        "ArchiPlanner: Donde los sueños toman forma...",
        "Organizando una experiencia inolvidable...",
        "Diseñando tu próximo gran momento..."
    ];

    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % messages.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const activeMessage = messageOverride || messages[messageIndex];

    const pathTransition = {
        duration: 1.5,
        ease: "easeInOut"
    };

    return (
        <div className="premium-loader-v5">
            <div className="loader-container">
                {/* Background Glass Orb */}
                <motion.div 
                    className="loader-glass-orb"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1.2, opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* HIGH FIDELITY AUTHENTIC LOGO */}
                <div className="loader-svg-wrapper">
                    <svg id="Capa_2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" className="animated-logo-svg">
                        <g>
                            {/* Tuxedo Dots */}
                            <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} fill="#f8f8f8" cx="539.42" cy="419.06" r="25.85"/>
                            <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} fill="#f8f8f8" cx="539.42" cy="297.89" r="29.08" />
                            <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} fill="#f8f8f8" cx="539.42" cy="540.23" r="22.62"/>
                            
                            {/* Main Icon Body Paths */}
                            <motion.path 
                                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ ...pathTransition, delay: 0.4 }}
                                fill="#f8f8f8" d="M773.32,319.32c-64.15-40.07-130.65-76.03-199.01-107.59,3.27-1.51,6.5-2.99,9.64-4.43,65.19,33.38,128.47,70.81,189.38,112.01h-.01Z"
                            />
                            <motion.path 
                                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ ...pathTransition, delay: 0.5 }}
                                fill="#f8f8f8" d="M763.05,172.31c-.45-4.53-1.31-10.08-2.16-14.57-2.77-14.49-7.22-28.56-13.47-42.03-3.43-7.39-11.79-11.06-19.42-8.16-63.78,22.2-126.22,48.44-186.89,78.55,0-.04-.04-.04-.04-.04l-11.47,5.83h-.12c-31.63,16-62.76,33.01-93.37,51.09-30.56,18.04-60.6,37.09-90.02,57.17-2.9,1.96-6.77.49-7.79-2.94-3.06-10.32-5.67-20.77-7.79-31.3-9.39-45.99-9.79-93.9-1.31-140.05.53-3.1,3.55-5.02,6.49-4.16,34.64,10.28,68.96,21.63,102.96,34.03,24.69,8.98,53.05,20.77,77.57,31.01l12.98-6.45c-24.89-11.47-61.21-27.46-85.94-37.54-38.52-15.71-77.61-30.03-117.07-43.01-4.77-1.59-9.96,1.43-11.1,6.53-4.16,17.83-7.06,35.99-8.69,54.27-4.73,55.09,1.92,111.65,20.85,163.39.16.45.37.9.65,1.31,2.9,4.04,8.37,5.18,12.57,2.49,31.05-20.24,62.72-39.38,94.92-57.37,21.75-12.16,43.74-23.79,65.98-34.89,20.28-10.12,40.77-19.79,61.41-29.01,3.47-1.55,6.94-3.1,10.41-4.61,4.2-1.84,8.41-3.67,12.61-5.47,44.23-18.97,89.24-35.91,134.87-50.72,2.53-.82,5.22.49,6.28,2.98,3.47,8.12,6.2,16.57,8.16,25.14,4.98,21.75,4.9,44.68.04,66.47-.78,3.55-4.65,5.26-7.67,3.43-32.65-19.99-66.47-37.83-101.16-53.33-1.59-.61-3.06-.57-4.24-.08-2.16.9-3.55,3.18-3.55,5.55,0,1.88.94,3.84,3.1,5.06,39.26,20.4,76.76,44.15,112.67,70.06.24.16.49.33.78.45,4.73,2.2,10.28-.24,12.28-5.26,2.65-5.71,5.06-11.55,7.14-17.55,8.37-24.28,11.34-50.64,8.57-76.27h-.02Z"
                            />
                            <motion.path 
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...pathTransition, delay: 0.6 }}
                                fill="#f8f8f8" d="M830.04,282.99c18.76-27.43,35.66-52.15,53.38-78.06-40.26-36.96-86.1-70.74-130.62-111.61,34.2,65.33,36.16,123.35,2.84,196.9,33.48,24.74,37.57,55.18,37.57,55.18-4-3.23-14.95-11.95-27.03-20.2-8.27-5.64-14.52-9.33-21.49-12.63h0c-2.04,3.88-4.17,7.81-6.39,11.79-24.49-13.96-24.17-13.78-47.83-27.27-45.95,140.55-91.06,278.55-138.44,423.46,125.28-124.5,245.48-243.95,366.73-364.45-30.54-25.17-59.4-48.96-88.71-73.12h-.01Z"
                            />
                            <motion.path 
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...pathTransition, delay: 0.7 }}
                                fill="#f8f8f8" d="M527.86,720.56c-16.44-50.29-104.04-318.52-133.69-409.36-23.53,13.12-41.29,26.27-66.76,40.46-10.99-24.06-35.18-81.21-37.41-136.28-2.1-51.94,8.68-93.33,17.06-117.93-43.08,39.59-70.72,71.02-110.53,107.6,18.21,26.54,35.2,51.31,53.52,78.02-29.78,24.5-58.83,48.39-88.82,73.06,31.32,31.13,273.66,272.05,366.61,364.43h.02Z"
                            />
                            <motion.path 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                                fill="#f8f8f8" d="M597.8,148.24c-10.2-20.53-30.77-34.56-54.49-34.56s-45.58,14.93-55.42,36.53c17.96,7.61,35.88,15.68,53.5,24.08,18.54-9.15,37.37-17.84,56.41-26.04h0Z"
                            />

                            {/* "PLANNER" (White Text) Paths */}
                            <g>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }} fill="#fff" d="M818.83,898.93c0-4.26-3.46-7.72-7.72-7.72h0c-4.26,0-7.72,3.46-7.72,7.72v37.47l-56.3-148.98c-1-3.1-3.91-5.33-7.34-5.33h0c-4.16,0-7.56,3.3-7.71,7.43v82.76c0,4.26,3.46,7.72,7.72,7.72h0c4.26,0,7.72-3.46,7.72-7.72v-40.18l56.43,149.33c1.51,3.99,5.96,6,9.95,4.49h0c3.25-1.23,5.18-4.41,4.98-7.71v-79.28h0Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} fill="#fff" d="M1003.2,971.24h-86.12c-6.42,0-9.41,3.46-9.41,7.72h0c0,4.26,2.99,7.72,9.41,7.72h86.12c6.42,0,11.63-3.46,11.63-7.72h0c0-4.26-5.21-7.72-11.63-7.72Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} fill="#fff" d="M977.88,811.16h-62.21c-4.76,0-8.62,3.29-8.62,7.34h0c0,4.05,3.86,7.34,8.62,7.34h62.21c4.76,0,8.62-3.29,8.62-7.34h0c0-4.05-3.86-7.34-8.62-7.34Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} fill="#fff" d="M890.19,790.28c0-4.26-3.46-7.72-7.72-7.72h0c-4.26,0-7.72,3.46-7.72,7.72v146.38l-56.3-148.98c-1-3.1-3.91-5.33-7.34-5.33h0c-4.16,0-7.56,3.3-7.71,7.43v79.4c0,4.26,3.46,7.72,7.72,7.72h0c4.26,0,7.72-3.46,7.72-7.72v-36.83l56.43,149.33c1.51,3.99,5.96,6,9.95,4.49h0c3.25-1.23,5.18-4.41,4.98-7.71v-188.19h0Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }} fill="#fff" d="M968.64,894.29h-38.47c-4.26,0-7.72-3.46-7.72-7.72v-38.69c0-4.27-3.45-7.74-7.7-7.74h0c-4.25,0-7.7,3.46-7.7,7.74l.5,131.14c.01,3.94,2.98,7.5,6.92,7.65,1,.04,2.02-.12,3.02-.5h0c3.24-1.23,5.17-4.42,4.96-7.73v-60.97c0-4.26,3.46-7.72,7.72-7.72h38.47c4.25,0,7.7-3.46,7.7-7.74h0c0-4.27-3.45-7.74-7.7-7.74v.02Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} fill="#fff" d="M707.98,970.79h-71.24v-180.94c0-4.27-3.46-7.73-7.73-7.73h0c-4.27,0-7.73,3.46-7.73,7.73v185.08c0,.75.05,1.48.15,2.19v.02c-.09.45-.14.91-.14,1.38,0,3.32,2.27,6.16,5.46,7.25.27.12.56.22.84.3.46.13.93.19,1.42.19.1,0,.21,0,.3-.01h78.67c2.3,0,4.4-.86,5.91-2.27,1.51-1.4,2.45-3.33,2.45-5.47,0-4.26-3.74-7.73-8.36-7.73h0Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} fill="#fff" d="M681.09,786.29c-1.14-2.54-3.66-4.18-6.45-4.18h0c-5.11,0-8.53,5.25-6.47,9.92l57.12,129.5h-46.44c-4.03,0-7.29,3.26-7.29,7.29h0c0,4.03,3.26,7.29,7.29,7.29h52.56l20.41,45.61c1.24,2.78,4,4.56,7.04,4.56h0c5.59,0,9.33-5.77,7.04-10.87l-84.83-189.13h.02Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }} fill="#fff" d="M533.37,782.18h-59.57c-4.27,0-7.73,3.46-7.73,7.73v188.69c0,4.27,3.46,7.73,7.73,7.73s7.73-3.46,7.73-7.73v-180.96h51.76c.34,0,.67-.02,1-.07,31.14.53,56.24,27.82,56.24,61.42s-25.56,61.4-57.11,61.43h-15.7c-3.36,0-6.19,2.2-7.14,5.25h0c-.22.71-.33,1.45-.33,2.22,0,2.06.83,3.93,2.19,5.28,1.35,1.35,3.22,2.19,5.29,2.19h15.7c39.27-.03,71.1-34.31,71.1-76.59s-31.86-76.6-71.15-76.6h0Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }} fill="#fff" d="M1020.45,915.19c-2.59-2.81-.81-7.31,2.99-7.7,38.12-3.91,56.82-31.18,56.55-61.93-.29-31.79-22.75-63.58-67.08-63.58h-96.01c-5.45,0-9.87,3.33-9.87,7.43s4.42,7.44,9.87,7.44l96.01-.29c33.83,0,50.16,24.79,49.87,48.7-.29,28.58-16.04,48.7-51.62,48.7h-8.48c-4.59,0-8.31,3.72-8.31,8.31v3.55c0,1.94.73,3.81,2.04,5.24l66.45,72.59c1.44,1.57,3.48,2.47,5.61,2.47,6.63,0,10.09-7.89,5.59-12.76l-53.62-58.17h.01Z"/>
                            </g>

                            {/* "ARCHI" (Red Text) Paths */}
                            <g>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0 }} fill="#e44c49" d="M423.17,782.11h0c-4.27,0-7.73,3.46-7.73,7.73v188.69c0,4.27,3.46,7.73,7.73,7.73h0c4.27,0,7.73-3.46,7.73-7.73v-188.69c0-4.27-3.46-7.73-7.73-7.73Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }} fill="#e44c49" d="M13.53,786.28c-1.14-2.54-3.66-4.18-6.45-4.18h0c-5.11,0-8.53,5.25-6.47,9.92l57.12,129.48H7.33c-4.03,0-7.29,3.26-7.29,7.29h0c0,4.03,3.26,7.29,7.29,7.29h56.52l20.41,45.6c1.24,2.78,4,4.56,7.04,4.56h0c5.59,0,9.33-5.77,7.04-10.87L13.53,786.28Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} fill="#e44c49" d="M132.6,907.63c38.18-3.88,56.91-31.16,56.64-61.94-.29-31.79-22.75-63.58-67.08-63.58H52.34c-3.87,0-7.01,3.14-7.01,7.01v.57c0,3.87,3.14,7.01,7.01,7.01h69.81c33.83,0,50.16,24.79,49.87,48.7-.29,28.58-16.04,48.7-51.62,48.7h-8.48c-4.59,0-8.31,3.72-8.31,8.31v3.55c0,1.94.73,3.81,2.04,5.24l66.45,72.59c1.44,1.57,3.48,2.47,5.61,2.47h0c6.63,0,10.09-7.89,5.59-12.76l-53.62-58.17c-2.57-2.78-.86-7.31,2.91-7.69h0Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.3 }} fill="#e44c49" d="M373.59,782.11h-1.73c-3.87,0-7.01,3.14-7.01,7.01v90.11h-109.45c-3.87,0-7.01,3.14-7.01,7.01v.27c0,3.87,3.14,7.01,7.01,7.01h109.45v85.73c0,3.87,3.14,7.01,7.01,7.01h1.73c3.87,0,7.01-3.14,7.01-7.01v-190.13c0-3.87-3.14-7.01-7.01-7.01Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} fill="#e44c49" d="M296.18,816.82c2.66,2.26,6.59,2.32,9.25.07l.1-.09c3.23-2.73,3.25-7.66,0-10.38-19.58-16.39-44.13-24.59-68.44-24.59-21.16,0-39.17,4.57-53.99,12.41,2.07,1.68,4.04,3.49,5.9,5.43,1.55,1.61,3,3.3,4.37,5.05,12.21-5.86,26.79-9.19,43.72-9.19,21.12,0,42.24,6.95,59.09,21.29h0Z"/>
                                <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }} fill="#e44c49" d="M306.01,951.1l-.32-.29c-2.59-2.39-6.61-2.53-9.32-.27-16.88,14.12-38.21,21.28-59.29,21.28-15.25,0-28.58-2.72-39.99-7.56l3.03,3.21c3.67,3.89,4.65,9.28,2.63,14.15,10.34,2.88,21.78,4.45,34.32,4.45,24.42,0,49.07-8.27,68.7-24.81,3.15-2.65,3.24-7.39.22-10.18l.02.02Z"/>
                            </g>
                        </g>
                    </svg>
                </div>

                <div className="loader-info">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={activeMessage}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="loader-message"
                        >
                            {activeMessage}
                        </motion.p>
                    </AnimatePresence>
                    <div className="loader-progress-bar">
                        <motion.div 
                            className="loader-progress-fill"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
                        />
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .premium-loader-v5 {
                    position: fixed;
                    inset: 0;
                    background: #0c0c0d;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    font-family: 'Inter', sans-serif;
                }
                .loader-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                }
                .loader-glass-orb {
                    position: absolute;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(228, 76, 73, 0.1) 0%, transparent 70%);
                    filter: blur(60px);
                    z-index: 0;
                }
                .loader-svg-wrapper {
                    width: 380px;
                    height: 380px;
                    z-index: 1;
                    filter: drop-shadow(0 0 40px rgba(228, 76, 73, 0.15));
                }
                .animated-logo-svg {
                    width: 100%;
                    height: 100%;
                }
                .loader-info {
                    margin-top: 20px;
                    text-align: center;
                    z-index: 1;
                }
                .loader-message {
                    font-size: 14px;
                    color: rgba(255,255,255,0.7);
                    letter-spacing: 2px;
                    margin-bottom: 20px;
                    font-weight: 200;
                    text-transform: uppercase;
                    height: 20px;
                }
                .loader-progress-bar {
                    width: 250px;
                    height: 1px;
                    background: rgba(255,255,255,0.1);
                    margin: 0 auto;
                }
                .loader-progress-fill {
                    height: 100%;
                    background: #e44c49;
                }
                @media (max-width: 768px) {
                    .loader-svg-wrapper { width: 280px; height: 280px; }
                    .loader-message { font-size: 10px; }
                }
            `}} />
        </div>
    );
};

export default PremiumLoader;
