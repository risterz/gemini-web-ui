import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';

const Gallery = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <>
            <div className="gallery" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px',
                marginTop: '40px'
            }}>
                {images.map((imgUrl, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="gallery-item"
                        style={{
                            borderRadius: '16px',
                            overflow: 'hidden',
                            position: 'relative',
                            aspectRatio: '1',
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            border: '1px solid var(--border-glass)'
                        }}
                        onClick={() => setSelectedImage(imgUrl)}
                        whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(20, 184, 166, 0.2)' }}
                    >
                        <img
                            src={imgUrl}
                            alt={`Generated result ${index + 1}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <Dialog.Root open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay
                        style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            position: 'fixed',
                            inset: 0,
                            zIndex: 2000,
                            backdropFilter: 'blur(5px)'
                        }}
                    />
                    <Dialog.Content
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90vw',
                            height: '90vh',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            zIndex: 2001,
                            outline: 'none'
                        }}
                    >
                        {selectedImage && (
                            <motion.img
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={selectedImage}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    borderRadius: '8px',
                                    boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                                }}
                            />
                        )}
                        <Dialog.Close asChild>
                            <button
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </Dialog.Close>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    );
};

export default Gallery;
