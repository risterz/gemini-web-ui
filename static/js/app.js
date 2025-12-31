/**
 * Gemini Studio - Frontend Application
 * Handles all UI interactions and API communication
 */

// ============================================
// State Management
// ============================================

const state = {
    selectedAspectRatio: 'square',
    selectedQuantity: 4,
    selectedStyle: null, // New State
    referenceImage: null,
    isGenerating: false,
    generatedImages: []
};

// ============================================
// DOM Elements
// ============================================

const elements = {
    // Status
    statusIndicator: document.getElementById('statusIndicator'),

    // Chat
    chatInput: document.getElementById('chatInput'),
    sendChatBtn: document.getElementById('sendChatBtn'),
    chatHistory: document.getElementById('chatHistory'),
    chatFileInput: document.getElementById('chatFileInput'),
    chatUploadBtn: document.getElementById('chatUploadBtn'),
    chatImagePreview: document.getElementById('chatImagePreview'),
    chatPreviewImg: document.getElementById('chatPreviewImg'),
    removeChatImage: document.getElementById('removeChatImage'),

    // Inputs
    promptInput: document.getElementById('promptInput'),
    enhanceBtn: document.getElementById('enhanceBtn'),
    charCount: document.getElementById('charCount'),
    quantityValue: document.getElementById('quantityValue'),
    timeEstimate: document.getElementById('timeEstimate'),

    // Upload
    uploadZone: document.getElementById('uploadZone'),
    fileInput: document.getElementById('fileInput'),
    uploadContent: document.getElementById('uploadContent'),
    uploadPreview: document.getElementById('uploadPreview'),
    previewImage: document.getElementById('previewImage'),
    removeImage: document.getElementById('removeImage'),

    // Buttons
    generateBtn: document.getElementById('generateBtn'),
    downloadAllBtn: document.getElementById('downloadAllBtn'),

    // Progress
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),

    // Results
    resultsSection: document.getElementById('resultsSection'),
    gallery: document.getElementById('gallery'),

    // Lightbox
    lightbox: document.getElementById('lightbox'),
    lightboxBackdrop: document.getElementById('lightboxBackdrop'),
    lightboxImage: document.getElementById('lightboxImage'),
    lightboxClose: document.getElementById('lightboxClose'),

    // New Loading Overlay
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingText: document.getElementById('loadingText'),

    // Settings
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    inputPsid: document.getElementById('inputPsid'),
    inputPsidts: document.getElementById('inputPsidts'),
    settingsBackdrop: document.getElementById('settingsBackdrop')
};

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    checkSystemHealth();
    updateCharCount();
    updateCharCount();
    updateCharCount();
    selectQuantity(state.selectedQuantity);
    loadSavedSettings(); // Load cookies
    initializeChatSystem();
});

// ============================================
// Event Listeners
// ============================================

function initializeEventListeners() {
    // Prompt input
    elements.promptInput.addEventListener('input', updateCharCount);
    if (elements.enhanceBtn) {
        elements.enhanceBtn.addEventListener('click', enhancePrompt);
    }

    // Aspect ratio buttons
    document.querySelectorAll('.aspect-btn').forEach(btn => {
        btn.addEventListener('click', () => selectAspectRatio(btn.dataset.ratio));
    });

    // Quantity slider
    // Quantity buttons
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => selectQuantity(parseInt(btn.dataset.qty)));
    });

    // Suggestion chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => selectStyle(chip.dataset.style));
    });

    // Upload zone
    elements.uploadZone.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.removeImage.addEventListener('click', (e) => {
        e.stopPropagation();
        removeReferenceImage();
    });

    // Drag and drop
    elements.uploadZone.addEventListener('dragover', handleDragOver);
    elements.uploadZone.addEventListener('dragleave', handleDragLeave);
    elements.uploadZone.addEventListener('drop', handleDrop);

    // Generate button
    elements.generateBtn.addEventListener('click', generateImages);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateImages();
        }
    });

    // Lightbox
    elements.lightboxClose.addEventListener('click', closeLightbox);
    // Lightbox
    elements.lightboxClose.addEventListener('click', closeLightbox);
    elements.lightboxBackdrop.addEventListener('click', closeLightbox);

    // Tab Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and content
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

            // Activate clicked tab
            tab.classList.add('active');

            // Show content
            const contentId = tab.dataset.tab === 'imageGen' ? 'imageGenSection' : 'chatSection';

            const content = document.getElementById(contentId);
            if (content) {
                content.style.display = 'block';
            }
        });
    });

    // Settings Modal
    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            elements.settingsModal.style.display = 'flex';
        });

        elements.closeSettingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.settingsModal.style.display = 'none';
        });

        // Close only when clicking directly on backdrop
        elements.settingsBackdrop.addEventListener('click', () => {
            elements.settingsModal.style.display = 'none';
        });

        // Prevent modal content clicks from closing
        const settingsContent = document.getElementById('settingsContent');
        if (settingsContent) {
            settingsContent.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        elements.saveSettingsBtn.addEventListener('click', saveSettings);
    }

    // Download all
    elements.downloadAllBtn.addEventListener('click', downloadAllImages);
}

// ============================================
// System Health Check
// ============================================

async function checkSystemHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();

        updateStatusIndicator(data.cookie_valid, data.message);
    } catch (error) {
        console.error('Health check failed:', error);
        updateStatusIndicator(false, 'Connection failed');
    }
}

// Poll health every 30 seconds
setInterval(checkSystemHealth, 30000);

function updateStatusIndicator(isHealthy, message) {
    elements.statusIndicator.classList.remove('healthy', 'unhealthy');
    elements.statusIndicator.classList.add(isHealthy ? 'healthy' : 'unhealthy');
    elements.statusIndicator.querySelector('.status-text').textContent =
        isHealthy ? 'Connected' : 'Not Connected';

    if (!isHealthy) {
        console.warn('System unhealthy:', message);
    }
}

// ============================================
// Prompt Management
// ============================================

function updateCharCount() {
    const count = elements.promptInput.value.length;
    elements.charCount.textContent = `${count} / 500`;
}

async function enhancePrompt() {
    const prompt = elements.promptInput.value.trim();
    if (!prompt) {
        showError('Please enter a prompt first');
        elements.promptInput.focus();
        return;
    }

    const btn = elements.enhanceBtn;
    const originalText = btn.innerHTML;

    // Loading state
    btn.disabled = true;
    btn.innerHTML = `
        <svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="animation: spin 1s linear infinite;">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        Enhancing...
    `;

    try {
        const response = await fetch('/api/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });

        const data = await response.json();

        if (data.success) {
            // Typewriter effect or direct replace? Direct for now.
            elements.promptInput.value = data.enhanced_prompt;
            updateCharCount();

            // Success animation/feedback could go here
            btn.innerHTML = '✨ Enhanced!';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 1000);

        } else {
            throw new Error(data.error);
        }

    } catch (error) {
        console.error('Enhance failed:', error);
        showError(error.message || 'Failed to enhance prompt');
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function selectStyle(style) {
    // Toggle style
    if (state.selectedStyle === style) {
        state.selectedStyle = null; // Deselect
    } else {
        state.selectedStyle = style; // Select
    }

    // Update UI
    document.querySelectorAll('.chip').forEach(chip => {
        if (chip.dataset.style === state.selectedStyle) {
            chip.classList.add('active');
        } else {
            chip.classList.remove('active');
        }
    });
}

// ============================================
// Aspect Ratio Selection
// ============================================

function selectAspectRatio(ratio) {
    state.selectedAspectRatio = ratio;

    // Update UI
    document.querySelectorAll('.aspect-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-ratio="${ratio}"]`).classList.add('active');
}

// ============================================
// Quantity Management
// ============================================

function selectQuantity(quantity) {
    state.selectedQuantity = quantity;

    // Update UI
    document.querySelectorAll('.qty-btn').forEach(btn => {
        if (parseInt(btn.dataset.qty) === quantity) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    elements.quantityValue.textContent = quantity;

    // Update time estimate (approx 2s per image)
    const estimatedTime = quantity * 2;
    elements.timeEstimate.textContent = `~${estimatedTime}s`;
}

// ============================================
// Image Upload
// ============================================

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processImageFile(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    elements.uploadZone.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.uploadZone.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadZone.classList.remove('dragover');

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processImageFile(file);
    }
}

async function processImageFile(file) {
    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
        showError('File too large. Maximum size is 5MB');
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.previewImage.src = e.target.result;
        elements.uploadContent.style.display = 'none';
        elements.uploadPreview.style.display = 'block';
        state.referenceImage = e.target.result;
    };
    reader.readAsDataURL(file);
}

function removeReferenceImage() {
    elements.uploadContent.style.display = 'flex';
    elements.uploadPreview.style.display = 'none';
    elements.previewImage.src = '';
    elements.fileInput.value = '';
    state.referenceImage = null;
}

// ============================================
// Image Generation
// ============================================

async function generateImages() {
    // Validate input
    const prompt = elements.promptInput.value.trim();

    if (!prompt) {
        showError('Please enter a prompt');
        elements.promptInput.focus();
        return;
    }

    if (prompt.length < 3) {
        showError('Prompt is too short. Please be more descriptive.');
        return;
    }

    if (state.isGenerating) {
        return;
    }

    // Update state
    state.isGenerating = true;

    // Update UI
    elements.generateBtn.disabled = true;

    // Use Inline Progress
    elements.loadingOverlay.style.display = 'none'; // Ensure overlay is hidden
    elements.progressContainer.style.display = 'block';
    elements.resultsSection.style.display = 'none';

    // Animate progress text & percent
    animateProgress();

    try {
        // Prepare request
        const requestData = {
            prompt: prompt,
            aspect_ratio: state.selectedAspectRatio,
            quantity: state.selectedQuantity,
            style: state.selectedStyle, // Send selected style
            hd_mode: document.getElementById('hdModeToggle').checked, // Send HD mode state
            // Send user cookies
            cookies: {
                psid: localStorage.getItem('gemini_psid'),
                psidts: localStorage.getItem('gemini_psidts')
            }
        };

        if (state.referenceImage) {
            requestData.reference_image = state.referenceImage;
        }

        // Send request
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            // If response is not JSON (e.g. 500/504 HTML error page)
            const text = await response.text();
            console.error("Non-JSON response received:", text.substring(0, 200));
            throw new Error(`Server Error (${response.status}): The server timed out or crashed. Please try reducing quantity.`);
        }

        if (data.success) {
            // Force progress to 100%
            updateProgress(100, "Finalizing...");
            await new Promise(r => setTimeout(r, 500)); // Small delay to see 100%

            state.generatedImages = data.images;
            displayResults(data.images);
        } else {
            throw new Error(data.error || 'Generation failed');
        }

    } catch (error) {
        console.error('Generation error:', error);
        const errorMsg = error.message || 'Failed to generate images. Please try again.';
        showError(errorMsg);

        // If it's an auth error, update status immediately
        if (errorMsg.includes('expired') || errorMsg.includes('initialize') || errorMsg.includes('cookie')) {
            updateStatusIndicator(false, errorMsg);
        }

        // Hide progress on error
        elements.progressContainer.style.display = 'none';
    } finally {
        state.isGenerating = false;
        elements.generateBtn.disabled = false;
        elements.generateBtn.querySelector('.btn-text').textContent = 'Generate Masterpiece';

        // Hide progress (Results display handles this too, but for safety)
        if (!state.generatedImages.length) {
            elements.progressContainer.style.display = 'none';
        }
    }
}

// ============================================
// Progress Animation (Inline)
// ============================================

function animateProgress() {
    const messages = [
        'Connecting to Gemini...',
        'Analyzing Prompt...',
        'Dreaming up concepts...',
        'Rendering pixels...',
        'Polishing details...',
        'Adding magic...',
        'Nearly there...'
    ];

    let step = 0;
    let percent = 0;

    // Reset
    updateProgress(0, messages[0]);

    const interval = setInterval(() => {
        if (!state.isGenerating || percent >= 95) {
            clearInterval(interval);
            return;
        }

        // Increment percent logarithmically-ish
        // Move fast at start, slow at end
        const remaining = 95 - percent;
        const jump = Math.max(1, Math.floor(Math.random() * remaining * 0.1));
        percent += jump;

        // Update message occasionally
        if (percent % 15 === 0) {
            step = (step + 1) % messages.length;
        }

        updateProgress(percent, messages[step]);

    }, 500); // Update every 500ms
}

function updateProgress(percent, text) {
    if (elements.progressFill) elements.progressFill.style.width = `${percent}%`;
    if (document.getElementById('progressPercent')) document.getElementById('progressPercent').textContent = `${percent}%`;
    if (document.getElementById('progressText')) document.getElementById('progressText').textContent = text;
}

// ============================================
// Results Display
// ============================================

function displayResults(images) {
    // Clear gallery
    elements.gallery.innerHTML = '';

    // Add images
    images.forEach((image, index) => {
        const item = createGalleryItem(image, index);
        elements.gallery.appendChild(item);
    });

    // Show results
    setTimeout(() => {
        elements.progressContainer.style.display = 'none';
        elements.resultsSection.style.display = 'block';

        // Smooth scroll to results
        elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 500);
}

function createGalleryItem(image, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.style.animationDelay = `${index * 0.1}s`;

    item.innerHTML = `
        <img src="${image.url}" alt="Generated image ${index + 1}" loading="lazy">
        <div class="gallery-overlay">
            <button class="overlay-btn" onclick="viewImage('${image.url}')" title="View full size">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
            </button>
            <button class="overlay-btn" onclick="upscaleImage('${image.url}', this)" title="Upscale to 4K">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M7 17v-7"></path>
                    <path d="M10 20l4-4 4 4"></path>
                    <path d="M14 16v-9"></path>
                    <path d="M17 17v-5"></path>
                </svg>
            </button>
            <button class="overlay-btn" onclick="downloadImage('${image.url}', ${index})" title="Download">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
            </button>
        </div>
    `;

    return item;
}

// ============================================
// Upscale Function
// ============================================

async function upscaleImage(imageUrl, btnElement) {
    if (btnElement.classList.contains('loading')) return;

    // Add loading state
    btnElement.classList.add('loading');
    const originalIcon = btnElement.innerHTML;
    btnElement.innerHTML = `
        <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
    `;

    try {
        showError("Upscaling image... please wait (high quality process)", "info"); // Use error toast style for info for now

        const response = await fetch('/api/upscale', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageUrl })
        });

        const data = await response.json();

        if (data.success) {
            // Open upscaled image in Lightbox directly
            viewImage(data.image_url);
            showError("✅ Image Upscaled Successfully! Opening in 4K...", "success"); // Reuse toast
        } else {
            throw new Error(data.error || "Upscale failed");
        }

    } catch (error) {
        console.error('Upscale failed:', error);
        showError("Upscale failed: " + error.message);
    } finally {
        // Remove loading state
        btnElement.classList.remove('loading');
        btnElement.innerHTML = originalIcon;
    }
}

// Add CSS for spinner
const style2 = document.createElement('style');
style2.textContent = `
    @keyframes spin { 100% { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
    .overlay-btn.loading { opacity: 0.8; cursor: wait; }
`;
document.head.appendChild(style2);

// ============================================
// Lightbox
// ============================================

function viewImage(url) {
    elements.lightboxImage.src = url;
    // Fix: Ensure image fits within viewport without zooming or clipping
    elements.lightboxImage.style.maxWidth = '85vw';
    elements.lightboxImage.style.maxHeight = '85vh';
    elements.lightboxImage.style.width = 'auto'; // Force natural aspect ratio
    elements.lightboxImage.style.height = 'auto';
    elements.lightboxImage.style.objectFit = 'contain';
    elements.lightboxImage.style.boxShadow = 'var(--shadow-lg)';
    // Reset any potentially conflicting inline styles from HTML
    elements.lightboxImage.style.minWidth = 'auto';
    elements.lightboxImage.style.minHeight = 'auto';

    elements.lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    elements.lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// ============================================
// Download Functions
// ============================================

async function downloadImage(url, index) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `gemini-image-${Date.now()}-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Download failed:', error);
        showError('Failed to download image');
    }
}

async function downloadAllImages() {
    if (state.generatedImages.length === 0) {
        return;
    }

    // Download each image
    for (let i = 0; i < state.generatedImages.length; i++) {
        await downloadImage(state.generatedImages[i].url, i);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 300));
    }
}

// ============================================
// Error Handling
// ============================================

function showError(message) {
    // Create toast notification - Neobrutalist Style
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #FF5252;
        color: #fff;
        padding: 1rem 1.5rem;
        border: 4px solid #1a1a2e;
        border-radius: 0;
        box-shadow: 6px 6px 0 0 #1a1a2e;
        z-index: 10000;
        animation: toastSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        max-width: 400px;
        font-weight: 700;
        font-family: 'Space Grotesk', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    `;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Remove after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease forwards';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 5000);
}

// ============================================
// Utility Functions
// ============================================

// Add CSS animations for toast - Neobrutalist style
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideIn {
        from {
            transform: translateX(120%) rotate(5deg);
            opacity: 0;
        }
        to {
            transform: translateX(0) rotate(0deg);
            opacity: 1;
        }
    }
    
    @keyframes toastSlideOut {
        from {
            transform: translateX(0) rotate(0deg);
            opacity: 1;
        }
        to {
            transform: translateX(120%) rotate(-5deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

async function updateStatusIndicator(isConnected) {
    const dot = document.getElementById('statusDot');
    if (isConnected) {
        dot.classList.add('connected');
        dot.title = "Connected to Gemini";
    } else {
        dot.classList.remove('connected');
        dot.title = "Disconnected";
    }
}

// ============================================
// Settings & Configuration
// ============================================

async function saveSettings() {
    const psid = elements.inputPsid.value.trim();
    const psidts = elements.inputPsidts.value.trim();

    if (!psid || !psidts) {
        showError("Please enter both cookies!");
        return;
    }

    // Update UI state
    const originalText = elements.saveSettingsBtn.innerHTML;
    elements.saveSettingsBtn.innerHTML = '<span class="btn-text">⏳ Saving...</span>';
    elements.saveSettingsBtn.disabled = true;

    try {
        // Call Backend API to update cookies
        const response = await fetch('/api/update_cookies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ psid, psidts })
        });

        const data = await response.json();

        if (data.success) {
            // Save to LocalStorage for persistence
            localStorage.setItem('gemini_psid', psid);
            localStorage.setItem('gemini_psidts', psidts);

            elements.saveSettingsBtn.innerHTML = '<span class="btn-text">✅ Saved! Restaring...</span>';

            // Reload page to apply changes cleanly
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            throw new Error(data.error || "Failed to save settings");
        }
    } catch (e) {
        console.error(e);
        elements.saveSettingsBtn.innerHTML = originalText;
        elements.saveSettingsBtn.disabled = false;
        showError("Failed to save: " + e.message);
    }
}

// Load saved cookies on startup
function loadSavedSettings() {
    const psid = localStorage.getItem('gemini_psid');
    const psidts = localStorage.getItem('gemini_psidts');

    if (psid) elements.inputPsid.value = psid;
    if (psidts) elements.inputPsidts.value = psidts;
}

// ============================================
// Export functions for inline event handlers
// ============================================

window.viewImage = viewImage;
window.downloadImage = downloadImage;

// ============================================
// CHAT SYSTEM
// ============================================

function initializeChatSystem() {
    console.log("🚀 Initializing Chat System...");

    // 1. Tab Switching
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab === 'imageGen' ? 'imageGenSection' : 'chatSection';

            // Update Active Tab
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update Active Content
            document.querySelectorAll('.tab-content').forEach(c => {
                c.style.display = 'none';
                c.classList.remove('active');
            });
            const target = document.getElementById(targetId);
            if (target) {
                target.style.display = 'block';
            }
        });
    });

    // 2. Chat Messaging
    // Fetch elements FRESH to avoid any initialization race conditions
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');

    if (chatInput && sendBtn) {
        console.log("✅ Chat input and send button found");

        // Remove old listeners to prevent duplicates (not strictly necessary with fresh page load, but good practice)
        const newSendBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);

        newSendBtn.addEventListener('click', (e) => {
            console.log("📩 Send button clicked");
            e.preventDefault();
            sendChatMessage();
        });

        // Re-assign for subsequent use
        elements.sendChatBtn = newSendBtn;

        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                console.log("⌨️ Enter key pressed in chat");
                e.preventDefault();
                sendChatMessage();
            }
        });
    } else {
        console.error("❌ Chat input or send button NOT found!", { chatInput, sendBtn });
    }

    // 3. Chat Image Upload
    const chatUploadBtn = document.getElementById('chatUploadBtn');
    const chatFileInput = document.getElementById('chatFileInput');
    const chatImagePreview = document.getElementById('chatImagePreview');
    const chatPreviewImg = document.getElementById('chatPreviewImg');
    const removeChatImage = document.getElementById('removeChatImage');

    if (chatUploadBtn && chatFileInput) {
        console.log("✅ Chat upload controls found");

        // Clone to clear listeners
        const newUploadBtn = chatUploadBtn.cloneNode(true);
        chatUploadBtn.parentNode.replaceChild(newUploadBtn, chatUploadBtn);

        newUploadBtn.addEventListener('click', (e) => {
            console.log("📎 Upload button clicked");
            e.preventDefault();
            chatFileInput.click();
        });

        // Re-assign
        elements.chatUploadBtn = newUploadBtn;

        chatFileInput.addEventListener('change', (e) => {
            console.log("📂 File selected");
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (chatPreviewImg && chatImagePreview) {
                        chatPreviewImg.src = e.target.result;
                        chatImagePreview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            }
        });

        if (removeChatImage) {
            removeChatImage.addEventListener('click', () => {
                chatFileInput.value = '';
                if (chatImagePreview) chatImagePreview.style.display = 'none';
            });
        }
    } else {
        console.error("❌ Chat upload buttons NOT found!", { chatUploadBtn, chatFileInput });
    }
}

async function sendChatMessage() {
    const input = elements.chatInput;
    const message = input.value.trim();
    const history = elements.chatHistory;

    // Check for image
    let imageBase64 = null;
    if (elements.chatImagePreview.style.display !== 'none') {
        imageBase64 = elements.chatPreviewImg.src;
    }

    if (!message && !imageBase64) return;

    // 1. Append User Message
    appendMessage(message, 'user', imageBase64);
    input.value = '';

    // Clear image preview
    elements.chatFileInput.value = '';
    elements.chatImagePreview.style.display = 'none';

    // 2. Show Loading Bubble
    const loadingId = 'loading-' + Date.now();
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'chat-message ai';
    loadingBubble.id = loadingId;
    loadingBubble.innerHTML = `
        <div class="message-bubble" style="background: var(--neo-cream); border: var(--border-thick) solid var(--border-color); padding: 16px; box-shadow: 4px 4px 0 0 var(--border-color); font-weight: 500;">
            <div style="display: flex; gap: 4px; align-items: center;">
                <span class="dot" style="width: 8px; height: 8px; background: var(--neo-black); border-radius: 50%; animation: bounce 0.6s infinite alternate;"></span>
                <span class="dot" style="width: 8px; height: 8px; background: var(--neo-black); border-radius: 50%; animation: bounce 0.6s infinite alternate 0.2s;"></span>
                <span class="dot" style="width: 8px; height: 8px; background: var(--neo-black); border-radius: 50%; animation: bounce 0.6s infinite alternate 0.4s;"></span>
            </div>
        </div>
    `;
    history.appendChild(loadingBubble);
    history.scrollTop = history.scrollHeight;

    // Add bounce animation style if not exists
    if (!document.getElementById('bounceStyle')) {
        const s = document.createElement('style');
        s.id = 'bounceStyle';
        s.textContent = '@keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-5px); } }';
        document.head.appendChild(s);
    }

    try {
        const payload = {
            message: message,
            image: imageBase64,
            // Send user cookies if they exist
            cookies: {
                psid: localStorage.getItem('gemini_psid'),
                psidts: localStorage.getItem('gemini_psidts')
            }
        };

        const response = await fetch('/api/chat/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Remove loading
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.remove();

        if (data.success) {
            appendMessage(data.text, 'ai');
        } else {
            appendMessage("⚠️ Error: " + data.error, 'ai');
        }
    } catch (e) {
        document.getElementById(loadingId)?.remove();
        appendMessage("⚠️ Connection Error", 'ai');
    }
}

function appendMessage(text, type, image = null) {
    const history = document.getElementById('chatHistory');
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${type}`;

    // Styling based on type
    const bubbleStyle = type === 'user'
        ? 'background: var(--neo-blue); border: var(--border-thick) solid var(--border-color); padding: 16px; box-shadow: 4px 4px 0 0 var(--border-color); font-weight: 500;'
        : 'background: var(--neo-cream); border: var(--border-thick) solid var(--border-color); padding: 16px; box-shadow: 4px 4px 0 0 var(--border-color); font-weight: 500;';

    msgDiv.style.cssText = type === 'user' ? 'align-self: flex-end; max-width: 80%;' : 'align-self: flex-start; max-width: 80%;';

    // Simple markdown-ish formatting
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');

    let imageHtml = '';
    if (image) {
        imageHtml = `<img src="${image}" style="max-width: 100%; border-radius: 8px; border: 2px solid #000; margin-bottom: 8px;">`;
    }

    msgDiv.innerHTML = `
        <div class="message-bubble" style="${bubbleStyle}">
            ${imageHtml}
            ${formattedText}
        </div>
    `;

    history.appendChild(msgDiv);
    history.scrollTop = history.scrollHeight;
}
