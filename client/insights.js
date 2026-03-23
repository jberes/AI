// ── UI helpers for the AI Insights panel ────────────────────────────────────
let streamingBuffer = '';

function appendToConsole(markdownText, isStreaming = false) {
    const consoleOutput = document.getElementById('consoleOutput');
    if (isStreaming) {
        streamingBuffer += markdownText;
        consoleOutput.innerHTML = marked.parse(streamingBuffer);
    } else {
        consoleOutput.innerHTML = marked.parse(markdownText);
    }
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function clearConsole() {
    document.getElementById('consoleOutput').innerHTML = '';
    streamingBuffer = '';
}
