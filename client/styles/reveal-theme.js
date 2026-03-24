// Reveal SDK Custom Theme — applied globally
(function() {
    function applyRevealTheme() {
        if (typeof $ === 'undefined' || !$.ig || !$.ig.RevealTheme) return;

        var theme = new $.ig.RevealTheme();

        // Chart palette — vibrant, harmonious, accessible
        theme.chartColors = [
            "#4F46E5",  // indigo
            "#06B6D4",  // cyan
            "#10B981",  // emerald
            "#F59E0B",  // amber
            "#EF4444",  // red
            "#8B5CF6",  // violet
            "#EC4899",  // pink
            "#14B8A6",  // teal
            "#F97316",  // orange
            "#6366F1",  // indigo-light
            "#0EA5E9",  // sky
            "#84CC16",  // lime
        ];

        // Dashboard chrome
        theme.accentColor           = "#4F46E5";
        theme.dashboardBackgroundColor     = "#F1F5F9";
        theme.visualizationBackgroundColor = "#FFFFFF";

        // Typography
        theme.regularFont = "Inter";
        theme.mediumFont  = "Inter";
        theme.boldFont    = "Inter";
        theme.fontColor   = "#1E293B";

        // Layout
        theme.highlightColor     = "#4F46E5";
        theme.useRoundedCorners  = true;
        theme.visualizationMargin = 3;

        $.ig.RevealSdkSettings.theme = theme;
    }

    // Try immediately, or wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyRevealTheme);
    } else {
        applyRevealTheme();
    }

    // Also expose for manual call
    window.applyRevealTheme = applyRevealTheme;
})();
