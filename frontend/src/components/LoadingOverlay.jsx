import React from 'react';
import { motion } from 'framer-motion';

const LoadingOverlay = () => {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 14, 26, 0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 3000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                marginBottom: '24px'
            }}>
                <motion.div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        border: '3px solid transparent',
                        borderTopColor: '#14b8a6',
                        borderRightColor: '#06b6d4',
                        borderRadius: '50%'
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                    style={{
                        position: 'absolute',
                        inset: '10px',
                        border: '3px solid transparent',
                        borderBottomColor: '#a855f7',
                        borderLeftColor: '#6366f1',
                        borderRadius: '50%'
                    }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                style={{
                    color: '#5eead4',
                    fontSize: '1.2rem',
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                }}
            >
                Manifesting Vision...
            </motion.div>
        </div>
    );
};

export default LoadingOverlay;
