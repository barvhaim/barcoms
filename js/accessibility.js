// Accessibility Tools JavaScript
class AccessibilityTools {
    constructor() {
        this.isToolbarOpen = false;
        this.preferences = this.loadPreferences();
        this.init();
    }

    init() {
        this.createAccessibilityButton();
        this.createToolbar();
        this.createKeyboardShortcuts();
        this.setupEventListeners();
        this.applyStoredPreferences();
        this.setupKeyboardNavigation();
    }

    createAccessibilityButton() {
        const button = document.createElement('button');
        button.className = 'accessibility-toggle';
        button.innerHTML = `
            <svg class="accessibility-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false">
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 8.5v4m0 0l-4 2m4-2l5 2"></path>
                <path d="M10 14.5a4.5 4.5 0 1 0 6 4.2"></path>
            </svg>
        `;
        button.type = 'button';
        button.setAttribute('aria-label', 'כלי נגישות');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', 'accessibility-toolbar');
        button.setAttribute('title', 'כלי נגישות');
        document.body.appendChild(button);
        this.toggleButton = button;

        button.addEventListener('click', () => this.toggleToolbar());
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'accessibility-toolbar';
        toolbar.id = 'accessibility-toolbar';
        toolbar.setAttribute('role', 'dialog');
        toolbar.setAttribute('aria-labelledby', 'accessibility-toolbar-title');
        toolbar.innerHTML = `
            <div class="toolbar-header">
                <h2 class="toolbar-title" id="accessibility-toolbar-title">כלי נגישות</h2>
                <button type="button" class="toolbar-close" aria-label="סגור כלי נגישות">×</button>
            </div>
            
            <div class="toolbar-section">
                <h3>גודל טקסט</h3>
                <div class="font-size-controls">
                    <button type="button" class="toolbar-button" data-action="font-small">קטן</button>
                    <button type="button" class="toolbar-button" data-action="font-normal">רגיל</button>
                    <button type="button" class="toolbar-button" data-action="font-large">גדול</button>
                    <button type="button" class="toolbar-button" data-action="font-xlarge">ענק</button>
                </div>
            </div>
            
            <div class="toolbar-section">
                <h3>תצוגה</h3>
                <div class="toolbar-controls">
                    <button type="button" class="toolbar-button" data-action="high-contrast">ניגודיות גבוהה</button>
                    <button type="button" class="toolbar-button" data-action="enhanced-focus">מיקוד מוגבר</button>
                </div>
            </div>
            
            <div class="toolbar-section">
                <h3>קריאה</h3>
                <div class="toolbar-controls">
                    <button type="button" class="toolbar-button" data-action="text-to-speech">הקראת טקסט</button>
                    <button type="button" class="toolbar-button" data-action="stop-speech">עצור הקראה</button>
                </div>
            </div>
            
            <div class="toolbar-section">
                <h3>עזרה</h3>
                <div class="toolbar-controls">
                    <button type="button" class="toolbar-button" data-action="keyboard-shortcuts">קיצורי מקלדת</button>
                    <button type="button" class="toolbar-button" data-action="reset-all">איפוס הגדרות</button>
                    <a class="toolbar-button" href="accessibility.html">הצהרת נגישות</a>
                </div>
            </div>
            <p class="visually-hidden" role="status" aria-live="polite" data-a11y-status></p>
        `;
        
        document.body.appendChild(toolbar);
        this.toolbar = toolbar;
    }

    createKeyboardShortcuts() {
        const shortcuts = document.createElement('div');
        shortcuts.className = 'keyboard-shortcuts';
        shortcuts.setAttribute('role', 'dialog');
        shortcuts.setAttribute('aria-modal', 'true');
        shortcuts.setAttribute('aria-labelledby', 'keyboard-shortcuts-title');
        shortcuts.innerHTML = `
            <div class="shortcuts-header">
                <h2 class="toolbar-title" id="keyboard-shortcuts-title">קיצורי מקלדת</h2>
                <button type="button" class="toolbar-close" aria-label="סגור קיצורי מקלדת">×</button>
            </div>
            <ul class="shortcuts-list">
                <li><span>פתיחת כלי נגישות</span> <span class="shortcut-key">Alt + A</span></li>
                <li><span>דלג לתוכן הראשי</span> <span class="shortcut-key">Alt + M</span></li>
                <li><span>הגדלת טקסט</span> <span class="shortcut-key">Alt + +</span></li>
                <li><span>הקטנת טקסט</span> <span class="shortcut-key">Alt + -</span></li>
                <li><span>ניגודיות גבוהה</span> <span class="shortcut-key">Alt + C</span></li>
                <li><span>הקראת טקסט</span> <span class="shortcut-key">Alt + S</span></li>
                <li><span>עצור הקראה</span> <span class="shortcut-key">Alt + X</span></li>
            </ul>
        `;
        
        document.body.appendChild(shortcuts);
        this.shortcuts = shortcuts;
    }

    setupEventListeners() {
        // Toolbar close button
        this.toolbar.querySelector('.toolbar-close').addEventListener('click', () => {
            this.toggleToolbar();
        });

        // Shortcuts close button
        this.shortcuts.querySelector('.toolbar-close').addEventListener('click', () => {
            this.hideKeyboardShortcuts();
        });

        // Toolbar buttons
        this.toolbar.addEventListener('click', (e) => {
            const button = e.target.closest('[data-action]');
            if (button) {
                this.handleAction(button.getAttribute('data-action'), button);
            }
        });

        // Keyboard shortcuts. e.code keeps them working with macOS Option, which changes e.key.
        document.addEventListener('keydown', (e) => {
            if (!e.altKey || e.ctrlKey || e.metaKey) return;
            switch (e.code) {
                case 'KeyA':
                    e.preventDefault();
                    this.toggleToolbar();
                    break;
                case 'KeyM':
                    e.preventDefault();
                    document.getElementById('main-content')?.focus();
                    break;
                case 'Equal':
                case 'NumpadAdd':
                    e.preventDefault();
                    this.increaseFontSize();
                    break;
                case 'Minus':
                case 'NumpadSubtract':
                    e.preventDefault();
                    this.decreaseFontSize();
                    break;
                case 'KeyC':
                    e.preventDefault();
                    this.toggleHighContrast();
                    this.updateButtonStates();
                    this.savePreferences();
                    break;
                case 'KeyS':
                    e.preventDefault();
                    this.startTextToSpeech();
                    break;
                case 'KeyX':
                    e.preventDefault();
                    this.stopTextToSpeech();
                    break;
            }
        });

        // Close toolbar when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isToolbarOpen &&
                !this.toolbar.contains(e.target) &&
                !this.shortcuts.contains(e.target) &&
                !e.target.closest('.accessibility-toggle')) {
                this.toggleToolbar(false);
            }
        });
    }

    setupKeyboardNavigation() {
        // Keep focus cycling inside the open toolbar; Escape or the close button leaves it
        this.toolbar.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.toggleToolbar(false);
            }
            
            if (e.key === 'Tab') {
                const focusableElements = this.toolbar.querySelectorAll(
                    'button, a[href], [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });

        // The shortcuts dialog is modal: trap Tab, Escape closes it
        this.shortcuts.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                this.hideKeyboardShortcuts();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.shortcuts.querySelector('.toolbar-close').focus();
            }
        });
    }

    toggleToolbar(open = !this.isToolbarOpen) {
        const wasOpen = this.isToolbarOpen;
        this.isToolbarOpen = open;
        this.toolbar.classList.toggle('open', open);
        this.toggleButton.setAttribute('aria-expanded', String(open));
        
        if (open) {
            // Focus first button in toolbar
            const firstButton = this.toolbar.querySelector('.toolbar-button');
            if (firstButton) firstButton.focus();
        } else if (wasOpen && this.toolbar.contains(document.activeElement)) {
            this.toggleButton.focus();
        }
    }

    announce(message) {
        const status = this.toolbar.querySelector('[data-a11y-status]');
        if (!status) return;
        status.textContent = '';
        setTimeout(() => { status.textContent = message; }, 50);
    }

    handleAction(action, button) {
        switch(action) {
            case 'font-small':
                this.setFontSize('small');
                break;
            case 'font-normal':
                this.setFontSize('normal');
                break;
            case 'font-large':
                this.setFontSize('large');
                break;
            case 'font-xlarge':
                this.setFontSize('xlarge');
                break;
            case 'high-contrast':
                this.toggleHighContrast();
                this.announce(this.preferences.highContrast ? 'ניגודיות גבוהה הופעלה' : 'ניגודיות גבוהה בוטלה');
                break;
            case 'enhanced-focus':
                this.toggleEnhancedFocus();
                this.announce(this.preferences.enhancedFocus ? 'מיקוד מוגבר הופעל' : 'מיקוד מוגבר בוטל');
                break;
            case 'text-to-speech':
                this.startTextToSpeech();
                break;
            case 'stop-speech':
                this.stopTextToSpeech();
                break;
            case 'keyboard-shortcuts':
                this.showKeyboardShortcuts();
                break;
            case 'reset-all':
                this.resetAllSettings();
                this.announce('ההגדרות אופסו');
                break;
        }
        
        this.updateButtonStates();
        this.savePreferences();
    }

    // Applied to <html> so rem-based (Bootstrap) text scales too
    setFontSize(size) {
        document.documentElement.classList.remove('font-small', 'font-large', 'font-xlarge');
        if (size !== 'normal') {
            document.documentElement.classList.add(`font-${size}`);
        }
        this.preferences.fontSize = size;
    }

    increaseFontSize() {
        const sizes = ['small', 'normal', 'large', 'xlarge'];
        const currentIndex = sizes.indexOf(this.preferences.fontSize || 'normal');
        const nextIndex = Math.min(currentIndex + 1, sizes.length - 1);
        this.setFontSize(sizes[nextIndex]);
        this.updateButtonStates();
        this.savePreferences();
    }

    decreaseFontSize() {
        const sizes = ['small', 'normal', 'large', 'xlarge'];
        const currentIndex = sizes.indexOf(this.preferences.fontSize || 'normal');
        const prevIndex = Math.max(currentIndex - 1, 0);
        this.setFontSize(sizes[prevIndex]);
        this.updateButtonStates();
        this.savePreferences();
    }

    toggleHighContrast() {
        document.body.classList.toggle('high-contrast');
        this.preferences.highContrast = document.body.classList.contains('high-contrast');
    }

    toggleEnhancedFocus() {
        document.body.classList.toggle('enhanced-focus');
        this.preferences.enhancedFocus = document.body.classList.contains('enhanced-focus');
    }

    startTextToSpeech() {
        if ('speechSynthesis' in window) {
            // Stop any existing speech
            speechSynthesis.cancel();
            
            // Get selected text or main content
            let textToRead = window.getSelection().toString();
            if (!textToRead) {
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    textToRead = mainContent.innerText;
                }
            }
            
            if (textToRead) {
                const utterance = new SpeechSynthesisUtterance(textToRead);
                utterance.lang = 'he-IL'; // Hebrew
                utterance.rate = 0.8;
                utterance.pitch = 1;
                
                // Try to find Hebrew voice
                const voices = speechSynthesis.getVoices();
                const hebrewVoice = voices.find(voice => voice.lang.includes('he'));
                if (hebrewVoice) {
                    utterance.voice = hebrewVoice;
                }
                
                speechSynthesis.speak(utterance);
                
                // Update button state
                const speechButton = this.toolbar.querySelector('[data-action="text-to-speech"]');
                if (speechButton) {
                    speechButton.classList.add('active');
                    speechButton.textContent = 'מקריא...';
                }
                this.announce('ההקראה התחילה');
                
                utterance.onend = () => {
                    if (speechButton) {
                        speechButton.classList.remove('active');
                        speechButton.textContent = 'הקראת טקסט';
                    }
                };
            }
        } else {
            this.announce('הקראת טקסט אינה נתמכת בדפדפן זה');
        }
    }

    stopTextToSpeech() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            const speechButton = this.toolbar.querySelector('[data-action="text-to-speech"]');
            if (speechButton) {
                speechButton.classList.remove('active');
                speechButton.textContent = 'הקראת טקסט';
            }
        }
    }

    showKeyboardShortcuts() {
        this.shortcuts.classList.add('show');
        const closeButton = this.shortcuts.querySelector('.toolbar-close');
        if (closeButton) closeButton.focus();
    }

    hideKeyboardShortcuts() {
        this.shortcuts.classList.remove('show');
        const opener = this.toolbar.querySelector('[data-action="keyboard-shortcuts"]');
        if (opener && this.isToolbarOpen) opener.focus();
        else this.toggleButton.focus();
    }

    resetAllSettings() {
        document.documentElement.classList.remove('font-small', 'font-large', 'font-xlarge');
        document.body.classList.remove('high-contrast', 'enhanced-focus');
        this.preferences = {};
        this.savePreferences();
        this.updateButtonStates();
        this.stopTextToSpeech();
    }

    updateButtonStates() {
        // Update font size buttons
        const fontSize = this.preferences.fontSize || 'normal';
        this.toolbar.querySelectorAll('[data-action^="font-"]').forEach(btn => {
            const active = btn.getAttribute('data-action') === `font-${fontSize}`;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', String(active));
        });
        
        // Update other toggles
        const highContrastBtn = this.toolbar.querySelector('[data-action="high-contrast"]');
        if (highContrastBtn) {
            highContrastBtn.classList.toggle('active', !!this.preferences.highContrast);
            highContrastBtn.setAttribute('aria-pressed', String(!!this.preferences.highContrast));
        }
        
        const enhancedFocusBtn = this.toolbar.querySelector('[data-action="enhanced-focus"]');
        if (enhancedFocusBtn) {
            enhancedFocusBtn.classList.toggle('active', !!this.preferences.enhancedFocus);
            enhancedFocusBtn.setAttribute('aria-pressed', String(!!this.preferences.enhancedFocus));
        }
    }

    loadPreferences() {
        try {
            return JSON.parse(localStorage.getItem('accessibilityPreferences') || '{}');
        } catch {
            return {};
        }
    }

    savePreferences() {
        try {
            localStorage.setItem('accessibilityPreferences', JSON.stringify(this.preferences));
        } catch {
            // Handle storage errors silently
        }
    }

    applyStoredPreferences() {
        if (this.preferences.fontSize && this.preferences.fontSize !== 'normal') {
            this.setFontSize(this.preferences.fontSize);
        }
        
        if (this.preferences.highContrast) {
            document.body.classList.add('high-contrast');
        }
        
        if (this.preferences.enhancedFocus) {
            document.body.classList.add('enhanced-focus');
        }
        
        this.updateButtonStates();
    }
}

// Initialize accessibility tools when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityTools();
});

// Ensure voices are loaded for text-to-speech
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {
        // Voices are now loaded
    };
}
