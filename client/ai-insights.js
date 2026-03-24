// ── UI helpers for the AI Insights panel ────────────────────────────────────
let contentBuffer = '';    // Only actual insight text (for copy)
let isGenerating = false;

function showGenerating(statusMessage) {
    const consoleOutput = document.getElementById('consoleOutput');
    const label = statusMessage || 'Generating insight...';
    consoleOutput.innerHTML = `
        <div class="generating-card">
            <div class="generating-header">
                <div class="generating-orb"></div>
                <span class="generating-label">${label}</span>
            </div>
            <div class="skeleton-lines">
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line"></div>
            </div>
        </div>`;
}

function updateProgress(message) {
    // Update the generating label text without replacing the animation
    const label = document.querySelector('.generating-label');
    if (label) {
        label.textContent = message;
    } else {
        // If animation was somehow removed, re-show it
        showGenerating(message);
    }
}

function appendContent(text) {
    // First real content — replace the generating animation
    isGenerating = false;
    contentBuffer += text;
    const consoleOutput = document.getElementById('consoleOutput');
    consoleOutput.innerHTML = marked.parse(contentBuffer);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function showResult(markdownText) {
    isGenerating = false;
    contentBuffer = markdownText;
    const consoleOutput = document.getElementById('consoleOutput');
    consoleOutput.innerHTML = marked.parse(markdownText);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
    contentBuffer = '';
    isGenerating = true;
    showGenerating();
}

// ── Legacy API (called from Insights.html) ──────────────────────────────────
function appendToConsole(markdownText, isStreaming = false) {
    if (isStreaming) {
        appendContent(markdownText);
    } else {
        showResult(markdownText);
    }
}

// ── Copy to clipboard ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const copyBtn = document.getElementById('copyBtn');
    if (!copyBtn) return;

    copyBtn.addEventListener('click', async () => {
        if (!contentBuffer) return;

        try {
            // Render content to HTML for rich paste (Outlook, Word, etc.)
            const html = marked.parse(contentBuffer);
            const blob = new Blob([html], { type: 'text/html' });
            const textBlob = new Blob([contentBuffer], { type: 'text/plain' });

            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': blob,
                    'text/plain': textBlob
                })
            ]);

            // Visual feedback
            const originalSvg = copyBtn.innerHTML;
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.innerHTML = originalSvg;
                copyBtn.classList.remove('copied');
            }, 1500);
        } catch (err) {
            try {
                await navigator.clipboard.writeText(contentBuffer);
            } catch (e) {
                console.error('Copy failed:', e);
            }
        }
    });
});
