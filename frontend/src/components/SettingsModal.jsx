import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsModal = ({ open, onOpenChange }) => {
    const [psid, setPsid] = useState('');
    const [psidts, setPsidts] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!psid || !psidts) {
            setStatus({ type: 'error', message: '⚠️ Please enter both cookies!' });
            return;
        }

        setIsSaving(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch('/api/update_cookies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ psid, psidts })
            });

            const data = await response.json();

            if (data.success) {
                setStatus({ type: 'success', message: '✅ Cookies saved! Reconnecting...' });
                setTimeout(() => {
                    onOpenChange(false);
                    setStatus({ type: '', message: '' });
                    setPsid('');
                    setPsidts('');
                }, 1500);
            } else {
                setStatus({ type: 'error', message: data.error || 'Failed to save' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Connection failed: ' + error.message });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(4px)',
                        position: 'fixed',
                        inset: 0,
                        zIndex: 2000,
                        animation: 'overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                />
                <Dialog.Content
                    style={{
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '16px',
                        boxShadow: '0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)',
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90vw',
                        maxWidth: '500px',
                        maxHeight: '85vh',
                        padding: '25px',
                        zIndex: 2001,
                        border: '1px solid var(--border-glass)',
                        outline: 'none'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <Dialog.Title style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#fff' }}>
                            ⚙️ Settings
                        </Dialog.Title>
                        <Dialog.Close asChild>
                            <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>
                                &times;
                            </button>
                        </Dialog.Close>
                    </div>

                    <Dialog.Description style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        Update your Gemini session cookies to enable image generation.
                    </Dialog.Description>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>
                                __Secure-1PSID
                            </label>
                            <input
                                className="prompt-input" // Reuse existing style class if compatible, otherwise inline
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-glass)',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: '#fff',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                                value={psid}
                                onChange={(e) => setPsid(e.target.value)}
                                placeholder="Paste cookie value..."
                                type="password"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: 500 }}>
                                __Secure-1PSIDTS
                            </label>
                            <input
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-glass)',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: '#fff',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                                value={psidts}
                                onChange={(e) => setPsidts(e.target.value)}
                                placeholder="Paste cookie value..."
                                type="password"
                            />
                        </div>

                        <AnimatePresence>
                            {status.message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '8px',
                                        backgroundColor: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(20, 184, 166, 0.1)',
                                        border: `1px solid ${status.type === 'error' ? '#ef4444' : '#14b8a6'}`,
                                        color: status.type === 'error' ? '#fca5a5' : '#5eead4',
                                        textAlign: 'center',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {status.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                    opacity: isSaving ? 0.7 : 1
                                }}
                            >
                                {isSaving ? 'Saving...' : 'Save & Restart Connection'}
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default SettingsModal;
