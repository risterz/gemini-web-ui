import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const ControlPanel = ({ onGenerate, isGenerating }) => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('landscape');
    const [quantity, setQuantity] = useState(1);
    const [referenceImage, setReferenceImage] = useState(null);
    const fileInputRef = useRef(null);

    const aspectRatios = [
        { id: 'square', label: 'Square', value: '1:1' },
        { id: 'portrait', label: 'Portrait', value: '9:16' },
        { id: 'landscape', label: 'Landscape', value: '16:9' }
    ];

    const handleSubmit = () => {
        if (!prompt.trim()) return;
        onGenerate({
            prompt: prompt,
            aspect_ratio: aspectRatio,
            quantity: quantity,
            reference_image: referenceImage
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setReferenceImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="control-panel" style={{
            background: 'var(--bg-card)',
            padding: '32px', // Increased padding
            borderRadius: '20px', // Softer corners
            border: '1px solid var(--border-glass)',
            backdropFilter: 'blur(10px)',
            marginBottom: '40px',
            maxWidth: '800px', // Explicit max width
            margin: '0 auto 40px', // Center horizontally
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' // Subtle depth
        }}>
            {/* Prompt Input */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>Describe your vision</label>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{prompt.length}/1000</span>
                </div>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A futuristic city with flying cars at sunset, cyberpunk style..."
                    rows="3"
                    style={{
                        width: '100%',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '12px',
                        padding: '16px',
                        color: 'white',
                        fontSize: '1rem',
                        resize: 'none',
                        outline: 'none',
                        transition: 'var(--transition)'
                    }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {/* Aspect Ratio */}
                <div>
                    <label style={{ display: 'block', color: 'var(--text-main)', marginBottom: '12px', fontSize: '0.9rem' }}>Aspect Ratio</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {aspectRatios.map(ratio => (
                            <button
                                key={ratio.id}
                                onClick={() => setAspectRatio(ratio.id)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: aspectRatio === ratio.id ? 'rgba(20, 184, 166, 0.15)' : 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${aspectRatio === ratio.id ? 'var(--accent-primary)' : 'transparent'}`,
                                    borderRadius: '8px',
                                    color: aspectRatio === ratio.id ? 'white' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'var(--transition)'
                                }}
                            >
                                {ratio.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quantity */}
                <div>
                    <label style={{ display: 'block', color: 'var(--text-main)', marginBottom: '12px', fontSize: '0.9rem' }}>
                        Variations: {quantity}
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="4"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                    />
                </div>
            </div>

            {/* Reference Image */}
            <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', color: 'var(--text-main)', marginBottom: '12px', fontSize: '0.9rem' }}>Reference Image (Optional)</label>
                {!referenceImage ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            border: '2px dashed var(--border-glass)',
                            borderRadius: '12px',
                            padding: '32px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'rgba(0,0,0,0.1)',
                            transition: 'var(--transition)'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Click to upload a reference image</span>
                    </div>
                ) : (
                    <div style={{ position: 'relative', width: 'fit-content' }}>
                        <img src={referenceImage} alt="Reference" style={{ maxHeight: '150px', borderRadius: '8px', border: '1px solid var(--border-glass)' }} />
                        <button
                            onClick={() => setReferenceImage(null)}
                            style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '-10px',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            &times;
                        </button>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
            </div>

            {/* Generate Button */}
            <button
                onClick={handleSubmit}
                disabled={!prompt.trim() || isGenerating}
                className="btn-primary"
                style={{ width: '100%' }}
            >
                {isGenerating ? 'Manifesting Vision...' : 'Generate Masterpiece'}
            </button>
        </div>
    );
};

export default ControlPanel;
