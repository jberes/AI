const client = rv.RevealSdkClient.getInstance();
let revealView;
let streamedExplanation = '';

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const suggestedQuestionsContainer = document.getElementById('suggestedQuestions');
const suggestionsPanel = document.getElementById('suggestionsPanel');
const suggestionsContent = document.getElementById('suggestionsContent');
const suggestionsHeader = document.getElementById('suggestionsHeader');
const suggestionsToggle = document.getElementById('suggestionsToggle');

// Initial dashboard creation questions (always visible)
const initialQuestions = [
    "Create an executive dashboard showing total revenue, gross margin, and average GM% over time",
    "Show a KPI dashboard comparing actual revenue vs revenue budget by month",
    "Give me a year-over-year comparison dashboard for revenue and gross margin",
    "Create a map showing total revenue by state",
    "Build a dashboard with total revenue, total gross margin, and average revenue per company"
];

// Categorized questions (shown when user clicks "Show more examples")
const categorizedQuestions = {
    "Time-Series & Trends": [
        "Show a line chart of revenue over time, grouped by year",
        "Create a trend chart comparing actual revenue vs revenue budget over time",
        "Show monthly gross margin trends with GM% as a secondary axis",
        "Plot revenue and gross margin trends for the last 12 months"
    ],
    "Budget vs Actual": [
        "Create a bar chart showing revenue vs budget by month",
        "Which months exceeded revenue budget and by how much?",
        "Show a variance dashboard comparing revenue vs revenue budget LY",
        "Which companies consistently beat their revenue budget?"
    ],
    "Company Analysis": [
        "Rank companies by total revenue",
        "Show the top 10 companies by gross margin",
        "Create a dashboard showing revenue per company by division",
        "Which companies have the highest and lowest GM%?"
    ],
    "Geographic Analysis": [
        "Which states generate the highest gross margin?",
        "Show revenue per company by state",
        "Compare GM% across states",
        "Which states underperform against revenue budget?"
    ],
    "Division Performance": [
        "Compare total revenue and gross margin by division",
        "Which division has the highest average GM%?",
        "Show revenue trends over time split by division",
        "Create a stacked bar chart of revenue by division and state"
    ],
    "Profitability & Margins": [
        "Create a scatter plot of revenue vs gross margin by company",
        "Which companies generate high revenue but low GM%?",
        "Show gross margin trends compared to last year",
        "Which states have the best gross margin efficiency?"
    ],
    "Anomalies & Insights": [
        "Identify revenue anomalies or unusual spikes over time",
        "Which companies are outliers in gross margin performance?",
        "Find states with declining revenue but increasing GM%",
        "Detect months where revenue significantly deviated from budget"
    ]
};

// Initialize suggested questions
function initializeSuggestedQuestions() {
    initialQuestions.forEach(question => {
        const button = document.createElement('button');
        button.className = 'suggested-question';
        button.textContent = question;
        button.addEventListener('click', () => {
            chatInput.value = question;
            handleSendChat();
        });
        suggestedQuestionsContainer.appendChild(button);
    });

    const showMoreBtn = document.createElement('button');
    showMoreBtn.className = 'show-more-btn';
    showMoreBtn.textContent = 'Show more examples...';
    showMoreBtn.addEventListener('click', toggleCategorizedQuestions);
    suggestedQuestionsContainer.appendChild(showMoreBtn);

    const categoriesContainer = document.createElement('div');
    categoriesContainer.className = 'question-categories';
    categoriesContainer.id = 'questionCategories';

    Object.keys(categorizedQuestions).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'question-category';

        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        categoryHeader.textContent = category;
        categoryDiv.appendChild(categoryHeader);

        categorizedQuestions[category].forEach(question => {
            const button = document.createElement('button');
            button.className = 'suggested-question';
            button.textContent = question;
            button.addEventListener('click', () => {
                chatInput.value = question;
                handleSendChat();
            });
            categoryDiv.appendChild(button);
        });

        categoriesContainer.appendChild(categoryDiv);
    });

    suggestedQuestionsContainer.appendChild(categoriesContainer);
}

function toggleCategorizedQuestions() {
    const categoriesContainer = document.getElementById('questionCategories');
    const showMoreBtn = document.querySelector('.show-more-btn');

    if (categoriesContainer.classList.contains('visible')) {
        categoriesContainer.classList.remove('visible');
        showMoreBtn.textContent = 'Show more examples...';
    } else {
        categoriesContainer.classList.add('visible');
        showMoreBtn.textContent = 'Show less';
        setTimeout(() => { chatMessages.scrollTop = 0; }, 100);
    }
}

// initializeDashboard, loadDashboardFromResponse, and sendRevealChat live in AI.html

function initializePersistentSuggestions() {
    const quickSuggestions = [
        ...initialQuestions.slice(0, 3),
        ...categorizedQuestions['Time-Series & Trends'].slice(0, 2),
        ...categorizedQuestions['Company Analysis'].slice(0, 2),
        ...categorizedQuestions['Geographic Analysis'].slice(0, 1)
    ];

    quickSuggestions.forEach(question => {
        const chip = document.createElement('button');
        chip.className = 'suggestion-chip';
        chip.textContent = question;
        chip.title = question;
        chip.addEventListener('click', () => {
            chatInput.value = question;
            chatInput.focus();
        });
        suggestionsContent.appendChild(chip);
    });

    suggestionsHeader.addEventListener('click', () => {
        suggestionsContent.classList.toggle('collapsed');
        suggestionsToggle.classList.toggle('collapsed');
    });
}

function showPersistentSuggestions() {
    suggestionsPanel.classList.add('visible');
}

function addChatMessage(role, content) {
    const emptyState = chatMessages.querySelector('.empty-state');
    if (emptyState) {
        emptyState.remove();
        showPersistentSuggestions();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = `message-avatar ${role}-avatar`;
    const avatarIcons = { user: '👤', assistant: '🤖', system: '⚙️', log: '📝', error: '⚠️' };
    avatarDiv.textContent = avatarIcons[role] || '💬';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const roleDiv = document.createElement('div');
    roleDiv.className = 'message-role';
    roleDiv.textContent = role === 'assistant' ? 'AI Assistant' : role;

    const textDiv = document.createElement('div');
    textDiv.className = `message-text ${role}`;
    textDiv.innerHTML = content;

    contentDiv.appendChild(roleDiv);
    contentDiv.appendChild(textDiv);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return textDiv;
}

function createStreamingMessage() {
    const textDiv = addChatMessage('assistant', '');
    textDiv.classList.add('streaming');
    return textDiv;
}

// ── Generating skeleton card ─────────────────────────────────
let generatingCard = null;

function showGeneratingCard(message) {
    if (generatingCard) {
        const label = generatingCard.querySelector('.generating-label');
        if (label) label.textContent = message;
        return;
    }

    const emptyState = chatMessages.querySelector('.empty-state');
    if (emptyState) { emptyState.remove(); showPersistentSuggestions(); }

    generatingCard = document.createElement('div');
    generatingCard.className = 'chat-message';
    generatingCard.innerHTML = `
        <div class="message-avatar log-avatar">✦</div>
        <div class="message-content">
            <div class="generating-card">
                <div class="generating-header">
                    <div class="generating-orb"></div>
                    <span class="generating-label">${message}</span>
                </div>
                <div class="skeleton-lines">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line"></div>
                </div>
            </div>
        </div>`;
    chatMessages.appendChild(generatingCard);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeGeneratingCard() {
    if (!generatingCard) return;
    const card = generatingCard.querySelector('.generating-card');
    const el = generatingCard;
    generatingCard = null;
    if (card) {
        card.classList.add('fade-out');
        setTimeout(() => el.remove(), 380);
    } else {
        el.remove();
    }
}

async function handleSendChat() {
    if (!chatInput || !chatInput.value.trim()) return;

    const question = chatInput.value.trim();
    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendButton.disabled = true;
    addChatMessage('user', question);

    streamedExplanation = '';
    let streamingMessageDiv = null;

    try {
        const result = await sendRevealChat(question, {
            onProgress: (message) => showGeneratingCard(message),
            onText: (chunk) => {
                streamedExplanation += chunk;
                if (!streamingMessageDiv) streamingMessageDiv = createStreamingMessage();
                streamingMessageDiv.innerHTML = marked.parse(streamedExplanation);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            },
            onError: (error) => {
                console.error('Chat error:', error);
                addChatMessage('error', error);
            }
        });
        removeGeneratingCard();

        if (streamingMessageDiv) {
            streamingMessageDiv.classList.remove('streaming');
            streamingMessageDiv.classList.add('completed');
        }

        if (!streamingMessageDiv && result.explanation) {
            addChatMessage('assistant', marked.parse(result.explanation));
        }

        if (result.error) addChatMessage('error', result.error);
        if (result.dashboard) await loadDashboardFromResponse(result.dashboard);

    } catch (error) {
        removeGeneratingCard();
        addChatMessage('error', `Error: ${error.message}`);
    } finally {
        sendButton.disabled = false;
        chatInput.focus();
    }
}

// Event listeners
sendButton.addEventListener('click', handleSendChat);

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendChat();
    }
});

chatInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 200) + 'px';
});

// Boot
initializeDashboard();
initializeSuggestedQuestions();
initializePersistentSuggestions();
chatInput.focus();
