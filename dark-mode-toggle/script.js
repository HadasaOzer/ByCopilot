/**
 * Dark Mode Toggle - JavaScript Implementation
 * Features:
 * - Toggle between light and dark themes
 * - Persist preference to localStorage
 * - Keyboard navigation support
 * - Screen reader accessibility
 * - Detect system preference
 */

class DarkModeToggle {
    constructor() {
        this.toggleButton = document.getElementById('darkModeToggle');
        this.htmlElement = document.documentElement;
        this.storageKey = 'theme-preference';
        this.THEME_DARK = 'dark';
        this.THEME_LIGHT = 'light';

        // Initialize theme on page load
        this.init();

        // Bind event listeners
        this.toggleButton.addEventListener('click', () => this.toggle());
        this.toggleButton.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.getStoredPreference()) {
                    this.setTheme(e.matches ? this.THEME_DARK : this.THEME_LIGHT);
                }
            });
        }
    }

    /**
     * Initialize theme on page load
     * Priority: 1. Stored preference 2. System preference 3. Default (light)
     */
    init() {
        const storedTheme = this.getStoredPreference();
        if (storedTheme) {
            this.setTheme(storedTheme);
        } else if (this.getSystemPreference()) {
            this.setTheme(this.THEME_DARK);
        } else {
            this.setTheme(this.THEME_LIGHT);
        }
    }

    /**
     * Get user's stored theme preference from localStorage
     * @returns {string|null} 'dark' or 'light' or null
     */
    getStoredPreference() {
        try {
            return localStorage.getItem(this.storageKey);
        } catch (e) {
            console.warn('localStorage not available:', e);
            return null;
        }
    }

    /**
     * Get system theme preference (OS dark mode setting)
     * @returns {boolean} true if dark mode is preferred
     */
    getSystemPreference() {
        if (window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    }

    /**
     * Get current active theme
     * @returns {string} 'dark' or 'light'
     */
    getCurrentTheme() {
        return this.htmlElement.getAttribute('data-theme') || this.THEME_LIGHT;
    }

    /**
     * Set theme and update UI
     * @param {string} theme - 'dark' or 'light'
     */
    setTheme(theme) {
        const validTheme = theme === this.THEME_DARK ? this.THEME_DARK : this.THEME_LIGHT;

        // Set data-theme attribute on <html> for CSS to respond
        this.htmlElement.setAttribute('data-theme', validTheme);

        // Update button aria-checked state for screen readers
        const isDark = validTheme === this.THEME_DARK;
        this.toggleButton.setAttribute('aria-checked', isDark);

        // Store preference in localStorage
        try {
            localStorage.setItem(this.storageKey, validTheme);
        } catch (e) {
            console.warn('Failed to save theme preference:', e);
        }

        // Dispatch custom event for external listeners
        this.dispatchThemeChangeEvent(validTheme);
    }

    /**
     * Toggle between light and dark themes
     */
    toggle() {
        const currentTheme = this.getCurrentTheme();
        const newTheme = currentTheme === this.THEME_DARK ? this.THEME_LIGHT : this.THEME_DARK;
        this.setTheme(newTheme);

        // Log for metrics (adoption rate)
        this.logToggleUsage(newTheme);
    }

    /**
     * Handle keyboard navigation (Space/Enter to toggle)
     * @param {KeyboardEvent} event
     */
    handleKeydown(event) {
        // Space (32) or Enter (13) should toggle
        if (event.key === ' ' || event.key === 'Enter' || event.code === 'Space') {
            event.preventDefault();
            this.toggle();
        }
    }

    /**
     * Dispatch custom event when theme changes
     * @param {string} theme - 'dark' or 'light'
     */
    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themechange', {
            detail: { theme }
        });
        document.dispatchEvent(event);
    }

    /**
     * Log toggle usage for metrics/analytics
     * @param {string} newTheme - The newly selected theme
     */
    logToggleUsage(newTheme) {
        // Log to console (in production, send to analytics)
        console.log(`[Dark Mode] User toggled to ${newTheme} theme at ${new Date().toISOString()}`);

        // In a real app, you could send this to an analytics service:
        // if (window.gtag) {
        //     gtag('event', 'dark_mode_toggle', {
        //         theme: newTheme,
        //         timestamp: new Date().toISOString()
        //     });
        // }
    }

    /**
     * Get current theme for external use
     * @returns {string} 'dark' or 'light'
     */
    getTheme() {
        return this.getCurrentTheme();
    }

    /**
     * Set theme programmatically from external code
     * @param {string} theme - 'dark' or 'light'
     */
    setThemeExternal(theme) {
        this.setTheme(theme);
    }
}

/**
 * Initialize Dark Mode Toggle when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.darkModeToggle = new DarkModeToggle();
    });
} else {
    // DOM already loaded
    window.darkModeToggle = new DarkModeToggle();
}

/**
 * PUBLIC API EXAMPLE:
 * 
 * Get current theme:
 *   window.darkModeToggle.getTheme()
 * 
 * Set theme programmatically:
 *   window.darkModeToggle.setThemeExternal('dark')
 *   window.darkModeToggle.setThemeExternal('light')
 * 
 * Listen for theme changes:
 *   document.addEventListener('themechange', (e) => {
 *       console.log('Theme changed to:', e.detail.theme);
 *   });
 */