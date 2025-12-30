import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <section className="hero">
            <motion.h1
                className="hero-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                Imagine. Create. Inspire.
            </motion.h1>
            <motion.p
                className="hero-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                Transform your ideas into breathtaking visuals with Gemini's vision engine.
            </motion.p>
        </section>
    );
};

export default Hero;
