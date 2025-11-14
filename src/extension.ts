/**
 * Comment Typer - VSCode extension for creating styled comments
 * 
 * Plugin provides tools for creating comments 
 * with typing effect, including progress bars, timestamps and ASCII arts.
 * 
 * @packageDocumentation
 */

import * as vscode from 'vscode';

/**
 * Plugin configuration parameters
 */
export const CONFIG = {
    /** Delay between characters when typing (ms) */
    charDelay: 45,
    /** Progress bar length in characters */
    progressBarLength: 10
};

/**
 * Collection of ASCII arts for different comment types
 */
export const ASCII_ART = {
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
 * User achievement
 */
export interface Achievement {
    /** Achievement name with emoji */
    name: string;
    /** Function to check achievement condition */
    check: () => boolean;
}

/**
 * Plugin achievements array
 */
export const ACHIEVEMENTS: Achievement[] = [
    { name: "🎯 First Comment!", check: () => stats.totalComments === 1 },
    { name: "🏆 Commentator", check: () => stats.totalComments >= 10 },
    { name: "📊 Progress Master", check: () => stats.progressBars >= 3 },
    { name: "🕒 Time Keeper", check: () => stats.timestampComments >= 5 },
    { name: "🎨 ASCII Artist", check: () => stats.asciiComments >= 5 }
];

/**
 * Plugin usage statistics
 */
export const stats = { 
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
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Creates text representation of progress bar
 * @param percent - Completion percentage (0-100)
 * @returns Progress bar string in format "[██████░░░░] 60%"
 * @example
 * generateProgressBar(75) // returns "[███████░░░] 75%"
 */
export const generateProgressBar = (percent: number) => {
    const filled = Math.round(percent / 100 * CONFIG.progressBarLength);
    return `[${'█'.repeat(filled)}${'░'.repeat(CONFIG.progressBarLength - filled)}] ${percent}%`;
};

/**
 * Inserts comment into editor with character-by-character typing effect
 * @param editor - Active text editor
 * @param text - Text to insert as comment
 */
export async function typeComment(editor: vscode.TextEditor, text: string) {
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
            await delay(CONFIG.charDelay);
        }
    }
}

/**
 * Checks and unlocks user achievements
 */
export function checkAchievements() {
    const unlocked = ACHIEVEMENTS.filter(a => a.check()).map(a => a.name);
    if (unlocked.length) vscode.window.showInformationMessage(`🎉 Achievement: ${unlocked.join(', ')}`);
}

/**
 * Creates comment and updates statistics
 * @param editor - Active text editor
 * @param content - Comment content
 * @param statKey - Statistics key to increment
 */
export async function createComment(editor: vscode.TextEditor, content: string, statKey?: keyof typeof stats) {
    await typeComment(editor, content);
    stats.totalComments++;
    if (statKey) stats[statKey]++;
    checkAchievements();
}

/**
 * Creates comment with progress bar
 * @param editor - Active text editor
 */
export async function createProgressBar(editor: vscode.TextEditor) {
    const progress = await vscode.window.showInputBox({
        placeHolder: 'Completion percentage (0-100)',
        validateInput: v => (v && +v >= 0 && +v <= 100) ? null : 'Enter number 0-100'
    });
    if (!progress) return;

    const task = await vscode.window.showInputBox({ placeHolder: 'Describe the task' });
    if (task !== undefined) {
        await createComment(editor, `📊 ${generateProgressBar(+progress)} ${task}`, 'progressBars');
    }
}

/**
 * Creates comment with timestamp
 * @param editor - Active text editor
 */
export async function createTimestampComment(editor: vscode.TextEditor) {
    const text = await vscode.window.showInputBox({ 
        placeHolder: 'Comment text',
        value: 'record'
    });
    if (text !== undefined) {
        await createComment(editor, `${new Date().toLocaleString('ru-RU')}: ${text}`, 'timestampComments');
    }
}

/**
 * Menu item for ASCII art selection
 */
export interface AsciiArtItem {
    /** Item identifier */
    label: string;
    /** Display description */
    description: string;
    /** ASCII art content */
    art: string;
}

/**
 * Displays ASCII art selection menu
 * @param editor - Active text editor
 */
export async function showAsciiArtMenu(editor: vscode.TextEditor) {
    const items: AsciiArtItem[] = [
        { label: 'refactor', description: '🔄 Requires refactoring', art: ASCII_ART.refactor },
        { label: 'dontTouch', description: '⚠️ Do not touch', art: ASCII_ART.dontTouch },
        { label: 'success', description: '✅ Successfully completed', art: ASCII_ART.success },
        { label: 'bug', description: '🐛 Bug detected', art: ASCII_ART.bug },
        { label: 'idea', description: '💡 Idea/suggestion', art: ASCII_ART.idea }
    ];

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select ASCII art type'
    });
    if (!selected) return;

    const userText = await vscode.window.showInputBox({
        placeHolder: 'Additional text (optional)'
    });
    
    await createComment(editor, userText ? `${selected.art}\n${userText}` : selected.art, 'asciiComments');
}

/**
 * Shows plugin usage statistics
 */
export function showStatistics() {
    const message = `📊 Comment Typer Statistics:

• Total comments: ${stats.totalComments}
• Progress bars: ${stats.progressBars}
• Timestamp comments: ${stats.timestampComments}
• ASCII arts: ${stats.asciiComments}

🎯 Achievements:
${ACHIEVEMENTS.map(a => `• ${a.name}`).join('\n')}`;

    vscode.window.showInformationMessage(message, { modal: true });
}

/**
 * Plugin main menu item
 */
export interface MenuItem {
    /** Menu item identifier */
    label: string;
    /** Display description */
    description: string;
    /** Selection handler function */
    handler: (editor: vscode.TextEditor) => Promise<void>;
}

/**
 * Plugin main menu
 */
export const MENU_ITEMS: MenuItem[] = [
    { label: 'progress', description: '📊 Create progress bar', handler: createProgressBar },
    { label: 'timestamp', description: '🕒 Comment with timestamp', handler: createTimestampComment },
    { label: 'ascii', description: '🎨 ASCII art comments', handler: showAsciiArtMenu },
    { label: 'stats', description: '📈 Show statistics', handler: async () => { showStatistics(); return Promise.resolve(); } }
];

/**
 * Displays plugin main menu
 * @param editor - Active text editor
 */
export async function showMainMenu() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return vscode.window.showErrorMessage('Open a code file!');

    const choice = await vscode.window.showQuickPick(MENU_ITEMS);
    if (choice) await choice.handler(editor);
}

/**
 * Activates extension when VSCode starts
 * @param context - VSCode extension context
 */
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('comment-typer.startTyping', showMainMenu),
        vscode.commands.registerCommand('comment-typer.showStats', showStatistics)
    );
}

/**
 * Deactivates extension when VSCode closes
 */
export function deactivate() {}