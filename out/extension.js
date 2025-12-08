"use strict";
/**
 * Comment Typer - VSCode extension for creating styled comments
 *
 * Plugin provides tools for creating comments
 * with typing effect, including progress bars, timestamps and ASCII arts.
 *
 * @packageDocumentation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.showMainMenu = exports.MENU_ITEMS = exports.showStatistics = exports.showAsciiArtMenu = exports.createTimestampComment = exports.createProgressBar = exports.createComment = exports.checkAchievements = exports.typeComment = exports.generateProgressBar = exports.delay = exports.stats = exports.ACHIEVEMENTS = exports.ASCII_ART = exports.CONFIG = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Plugin configuration parameters
 */
exports.CONFIG = {
    /** Delay between characters when typing (ms) */
    charDelay: 45,
    /** Progress bar length in characters */
    progressBarLength: 10
};
/**
 * Collection of ASCII arts for different comment types
 */
exports.ASCII_ART = {
    /** Art for code that requires refactoring */
    refactor: '┌────────────────────┐\n│ТРЕБУЕТСЯ ПЕРЕДЕЛАТь│\n└────────────────────┘',
    /** Art for working code that shouldn't be changed */
    dontTouch: '╔═════════════════════╗\n║     НЕ ТРОГАТЬ!     ║\n║ ─────────────────── ║\n║ РАБОТАЕТ, НЕ МЕНЯТЬ!║\n╚═════════════════════╝',
    /** Art for completed tasks */
    success: '  ┌─────────────────┐\n  │УСПЕШНО ВЫПОЛНЕНО│\n  └─────────────────┘',
    /** Art for error reports */
    bug: '▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\n      ОБНАРУЖЕН БАГ \n  ──────────────────────\n  Требуется исправление!\n▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
    /** Art for improvement suggestions */
    idea: '  ╭──────────────────────╮\n  │         ИДЕЯ         │\n  │   ────────────────   │\n  │     Предложение      │\n  │     по улучшению     │\n  ╰──────────────────────╯'
};
/**
 * Plugin achievements array
 */
exports.ACHIEVEMENTS = [
    { name: "🎯 First Comment!", check: () => exports.stats.totalComments === 1 },
    { name: "🏆 Commentator", check: () => exports.stats.totalComments >= 10 },
    { name: "📊 Progress Master", check: () => exports.stats.progressBars >= 3 },
    { name: "🕒 Time Keeper", check: () => exports.stats.timestampComments >= 5 },
    { name: "🎨 ASCII Artist", check: () => exports.stats.asciiComments >= 5 }
];
/**
 * Plugin usage statistics
 */
exports.stats = {
    /** Total number of comments */
    totalComments: 0,
    /** Number of created progress bars */
    progressBars: 0,
    /** Number of timestamp comments */
    timestampComments: 0,
    /** Number of ASCII art comments */
    asciiComments: 0
};
/**
 * Creates execution delay
 * @param ms - Delay time in milliseconds
 * @returns Promise that resolves after delay
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.delay = delay;
/**
 * Creates text representation of progress bar
 * @param percent - Completion percentage (0-100)
 * @returns Progress bar string in format "[██████░░░░] 60%"
 * @example
 * generateProgressBar(75) // returns "[███████░░░] 75%"
 */
const generateProgressBar = (percent) => {
    const filled = Math.round(percent / 100 * exports.CONFIG.progressBarLength);
    return `[${'█'.repeat(filled)}${'░'.repeat(exports.CONFIG.progressBarLength - filled)}] ${percent}%`;
};
exports.generateProgressBar = generateProgressBar;
/**
 * Inserts comment into editor with character-by-character typing effect
 * @param editor - Active text editor
 * @param text - Text to insert as comment
 */
async function typeComment(editor, text) {
    let pos = editor.selection.active;
    for (const line of text.split('\n').filter(l => l.trim())) {
        if (pos !== editor.selection.active) {
            await editor.edit(e => e.insert(pos, '\n'));
            pos = new vscode.Position(pos.line + 1, 0);
        }
        const lineToType = `// ${line}`;
        for (let i = 0; i < lineToType.length; i++) {
            const char = lineToType[i];
            await editor.edit(e => e.insert(pos, char));
            pos = pos.translate(0, 1);
            await (0, exports.delay)(exports.CONFIG.charDelay);
        }
    }
}
exports.typeComment = typeComment;
/**
 * Checks and unlocks user achievements
 */
function checkAchievements() {
    const unlocked = exports.ACHIEVEMENTS.filter(a => a.check()).map(a => a.name);
    if (unlocked.length)
        vscode.window.showInformationMessage(`🎉 Achievement: ${unlocked.join(', ')}`);
}
exports.checkAchievements = checkAchievements;
/**
 * Creates comment and updates statistics
 * @param editor - Active text editor
 * @param content - Comment content
 * @param statKey - Statistics key to increment
 */
async function createComment(editor, content, statKey) {
    await typeComment(editor, content);
    exports.stats.totalComments++;
    if (statKey)
        exports.stats[statKey]++;
    checkAchievements();
}
exports.createComment = createComment;
/**
 * Creates comment with progress bar
 * @param editor - Active text editor
 */
async function createProgressBar(editor) {
    const progress = await vscode.window.showInputBox({
        placeHolder: 'Completion percentage (0-100)',
        validateInput: v => (v && +v >= 0 && +v <= 100) ? null : 'Enter number 0-100'
    });
    if (!progress)
        return;
    const task = await vscode.window.showInputBox({ placeHolder: 'Describe the task' });
    if (task !== undefined) {
        await createComment(editor, `📊 ${(0, exports.generateProgressBar)(+progress)} ${task}`, 'progressBars');
    }
}
exports.createProgressBar = createProgressBar;
/**
 * Creates comment with timestamp
 * @param editor - Active text editor
 */
async function createTimestampComment(editor) {
    const text = await vscode.window.showInputBox({
        placeHolder: 'Comment text',
        value: 'record'
    });
    if (text !== undefined) {
        await createComment(editor, `${new Date().toLocaleString('ru-RU')}: ${text}`, 'timestampComments');
    }
}
exports.createTimestampComment = createTimestampComment;
/**
 * Displays ASCII art selection menu
 * @param editor - Active text editor
 */
async function showAsciiArtMenu(editor) {
    const items = [
        { label: 'refactor', description: '🔄 Requires refactoring', art: exports.ASCII_ART.refactor },
        { label: 'dontTouch', description: '⚠️ Do not touch', art: exports.ASCII_ART.dontTouch },
        { label: 'success', description: '✅ Successfully completed', art: exports.ASCII_ART.success },
        { label: 'bug', description: '🐛 Bug detected', art: exports.ASCII_ART.bug },
        { label: 'idea', description: '💡 Idea/suggestion', art: exports.ASCII_ART.idea }
    ];
    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select ASCII art type'
    });
    if (!selected)
        return;
    const userText = await vscode.window.showInputBox({
        placeHolder: 'Additional text (optional)'
    });
    await createComment(editor, userText ? `${selected.art}\n${userText}` : selected.art, 'asciiComments');
}
exports.showAsciiArtMenu = showAsciiArtMenu;
/**
 * Shows plugin usage statistics
 */
function showStatistics() {
    const message = `📊 Comment Typer Statistics:

• Total comments: ${exports.stats.totalComments}
• Progress bars: ${exports.stats.progressBars}
• Timestamp comments: ${exports.stats.timestampComments}
• ASCII arts: ${exports.stats.asciiComments}

🎯 Achievements:
${exports.ACHIEVEMENTS.map(a => `• ${a.name}`).join('\n')}`;
    vscode.window.showInformationMessage(message, { modal: true });
}
exports.showStatistics = showStatistics;
/**
 * Plugin main menu
 */
exports.MENU_ITEMS = [
    { label: 'progress', description: '📊 Create progress bar', handler: createProgressBar },
    { label: 'timestamp', description: '🕒 Comment with timestamp', handler: createTimestampComment },
    { label: 'ascii', description: '🎨 ASCII art comments', handler: showAsciiArtMenu },
    { label: 'stats', description: '📈 Show statistics', handler: async () => { showStatistics(); return Promise.resolve(); } }
];
/**
 * Displays plugin main menu
 * @param editor - Active text editor
 */
async function showMainMenu() {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return vscode.window.showErrorMessage('Open a code file!');
    const choice = await vscode.window.showQuickPick(exports.MENU_ITEMS);
    if (choice)
        await choice.handler(editor);
}
exports.showMainMenu = showMainMenu;
/**
 * Activates extension when VSCode starts
 * @param context - VSCode extension context
 */
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('comment-typer.startTyping', showMainMenu), vscode.commands.registerCommand('comment-typer.showStats', showStatistics));
}
exports.activate = activate;
/**
 * Deactivates extension when VSCode closes
 */
function deactivate() { }
exports.deactivate = deactivate;
