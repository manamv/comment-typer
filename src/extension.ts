/**
 * Comment Typer - VSCode расширение для создания стилизованных комментариев
 * @module CommentTyper
 * @version 1.0
 * @description Плагин предоставляет инструменты для создания комментариев 
 * с эффектом печати, включая прогресс-бары, временные метки и ASCII арты.
 */
import * as vscode from 'vscode';

/**
 * Конфигурационные параметры плагина
 * @namespace CONFIG
 * @property {number} charDelay - Задержка между символами при печати (мс)
 * @property {number} progressBarLength - Длина прогресс-бара в символах
 */
const CONFIG = {
    charDelay: 45,
    progressBarLength: 10
};

/**
 * Коллекция ASCII артов для различных типов комментариев
 * @namespace ASCII_ART
 * @property {string} refactor - Арт для кода, требующего рефакторинга
 * @property {string} dontTouch - Арт для рабочего кода, который нельзя менять
 * @property {string} success - Арт для завершенных задач
 * @property {string} bug - Арт для сообщений об ошибках
 * @property {string} idea - Арт для предложений по улучшению
 */
const ASCII_ART = {
    refactor: '┌────────────────────┐\n│ТРЕБУЕТСЯ ПЕРЕДЕЛАТь│\n└────────────────────┘',
    dontTouch: '╔═════════════════════╗\n║     НЕ ТРОГАТЬ!     ║\n║ ─────────────────── ║\n║ РАБОТАЕТ, НЕ МЕНЯТЬ!║\n╚═════════════════════╝',
    success: '  ┌─────────────────┐\n  │УСПЕШНО ВЫПОЛНЕНО│\n  └─────────────────┘',
    bug: '▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄\n      ОБНАРУЖЕН БАГ \n  ──────────────────────\n  Требуется исправление!\n▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀',
    idea: '  ╭──────────────────────╮\n  │         ИДЕЯ         │\n  │   ────────────────   │\n  │     Предложение      │\n  │     по улучшению     │\n  ╰──────────────────────╯'
};

/**
 * Достижение пользователя
 * @typedef {Object} Achievement
 * @property {string} name - Название достижения с эмодзи
 * @property {Function} check - Функция проверки условия достижения
 */

/**
 * Массив достижений плагина
 * @type {Achievement[]}
 */
const ACHIEVEMENTS = [
    { name: "🎯 Первый комментарий!", check: () => stats.totalComments === 1 },
    { name: "🏆 Комментатор", check: () => stats.totalComments >= 10 },
    { name: "📊 Мастер прогресса", check: () => stats.progressBars >= 3 },
    { name: "🕒 Хранитель времени", check: () => stats.timestampComments >= 5 },
    { name: "🎨 ASCII художник", check: () => stats.asciiComments >= 5 }
];

/**
 * Статистика использования плагина
 * @namespace stats
 * @property {number} totalComments - Общее количество комментариев
 * @property {number} progressBars - Количество созданных прогресс-баров
 * @property {number} timestampComments - Количество комментариев с временными метками
 * @property {number} asciiComments - Количество ASCII арт комментариев
 */
const stats = { totalComments: 0, progressBars: 0, timestampComments: 0, asciiComments: 0 };

/**
 * Создает задержку выполнения
 * @param {number} ms - Время задержки в миллисекундах
 * @returns {Promise<void>} Promise, который разрешается после задержки
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Создает текстовое представление прогресс-бара
 * @param {number} percent - Процент выполнения (0-100)
 * @returns {string} Строка прогресс-бара в формате "[██████░░░░] 60%"
 * @example
 * generateProgressBar(75); // returns "[███████░░░] 75%"
 */
const generateProgressBar = (percent: number) => {
    const filled = Math.round(percent / 100 * CONFIG.progressBarLength);
    return `[${'█'.repeat(filled)}${'░'.repeat(CONFIG.progressBarLength - filled)}] ${percent}%`;
};

/**
 * Вставляет комментарий в редактор с эффектом посимвольной печати
 * @async
 * @param {vscode.TextEditor} editor - Активный текстовый редактор
 * @param {string} text - Текст для вставки в виде комментария
 * @returns {Promise<void>}
 */
async function typeComment(editor: vscode.TextEditor, text: string) {
    let pos = editor.selection.active;

    for (const line of text.split('\n').filter(l => l.trim())) {
        if (pos !== editor.selection.active) {
            await editor.edit(e => e.insert(pos, '\n'));
            pos = new vscode.Position(pos.line + 1, 0);
        }

        const lineToType = `// ${line}`;
        for (const char of lineToType) {
            await editor.edit(e => e.insert(pos, char));
            pos = pos.translate(0, 1);
            await delay(CONFIG.charDelay);
        }
    }
}

/**
 * Проверяет и разблокирует достижения пользователя
 * @function checkAchievements
 */
function checkAchievements() {
    const unlocked = ACHIEVEMENTS.filter(a => a.check()).map(a => a.name);
    if (unlocked.length) vscode.window.showInformationMessage(`🎉 Достижение: ${unlocked.join(', ')}`);
}

/**
 * Создает комментарий и обновляет статистику
 * @async
 * @param {vscode.TextEditor} editor - Активный текстовый редактор
 * @param {string} content - Содержимое комментария
 * @param {string} [statKey] - Ключ статистики для инкремента
 * @returns {Promise<void>}
 */
async function createComment(editor: vscode.TextEditor, content: string, statKey?: keyof typeof stats) {
    await typeComment(editor, content);
    stats.totalComments++;
    if (statKey) stats[statKey]++;
    checkAchievements();
}

/**
 * Создает комментарий с прогресс-баром
 * @async
 * @param {vscode.TextEditor} editor - Активный текстовый редактор
 * @returns {Promise<void>}
 */
async function createProgressBar(editor: vscode.TextEditor) {
    const progress = await vscode.window.showInputBox({
        placeHolder: 'Процент выполнения (0-100)',
        validateInput: v => (v && +v >= 0 && +v <= 100) ? null : 'Введите число 0-100'
    });
    if (!progress) return;

    const task = await vscode.window.showInputBox({ placeHolder: 'Опишите задачу' });
    if (task !== undefined) {
        await createComment(editor, `📊 ${generateProgressBar(+progress)} ${task}`, 'progressBars');
    }
}

/**
 * Создает комментарий с временной меткой
 * @async
 * @param {vscode.TextEditor} editor - Активный текстовый редактор
 * @returns {Promise<void>}
 */
async function createTimestampComment(editor: vscode.TextEditor) {
    const text = await vscode.window.showInputBox({ 
        placeHolder: 'Текст комментария',
        value: 'запись'
    });
    if (text !== undefined) {
        await createComment(editor, `${new Date().toLocaleString('ru-RU')}: ${text}`, 'timestampComments');
    }
}

/**
 * Отображает меню выбора ASCII артов
 * @async
 * @param {vscode.TextEditor} editor - Активный текстовый редактор
 * @returns {Promise<void>}
 */
async function showAsciiArtMenu(editor: vscode.TextEditor) {
    const items = [
        { label: 'refactor', description: '🔄 Требуется переделать', art: ASCII_ART.refactor },
        { label: 'dontTouch', description: '⚠️ Не трогать', art: ASCII_ART.dontTouch },
        { label: 'success', description: '✅ Успешно выполнено', art: ASCII_ART.success },
        { label: 'bug', description: '🐛 Обнаружен баг', art: ASCII_ART.bug },
        { label: 'idea', description: '💡 Идея/предложение', art: ASCII_ART.idea }
    ];

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Выберите тип ASCII арта'
    });
    if (!selected) return;

    const userText = await vscode.window.showInputBox({
        placeHolder: 'Дополнительный текст (необязательно)'
    });
    
    await createComment(editor, userText ? `${selected.art}\n${userText}` : selected.art, 'asciiComments');
}

/**
 * Показывает статистику использования плагина
 * @function showStatistics
 */
function showStatistics() {
    const message = `📊 Статистика Comment Typer:

• Всего комментариев: ${stats.totalComments}
• Прогресс-баров: ${stats.progressBars}
• С временными метками: ${stats.timestampComments}
• ASCII артов: ${stats.asciiComments}

🎯 Достижения:
${ACHIEVEMENTS.map(a => `• ${a.name}`).join('\n')}`;

    vscode.window.showInformationMessage(message, { modal: true });
}

/**
 * Элемент главного меню плагина
 * @typedef {Object} MenuItem
 * @property {string} label - Идентификатор пункта меню
 * @property {string} description - Описание для отображения
 * @property {Function} handler - Функция-обработчик выбора
 */

/**
 * Главное меню плагина
 * @type {MenuItem[]}
 */
const MENU_ITEMS = [
    { label: 'progress', description: '📊 Создать прогресс-бар', handler: createProgressBar },
    { label: 'timestamp', description: '🕒 Комментарий с временной меткой', handler: createTimestampComment },
    { label: 'ascii', description: '🎨 ASCII арт комментарии', handler: showAsciiArtMenu },
    { label: 'stats', description: '📈 Показать статистику', handler: showStatistics }
];

/**
 * Отображает главное меню плагина
 * @async
 * @function showMainMenu
 * @returns {Promise<void>}
 */
async function showMainMenu() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return vscode.window.showErrorMessage('Откройте файл с кодом!');

    const choice = await vscode.window.showQuickPick(MENU_ITEMS);
    if (choice) await choice.handler(editor);
}

/**
 * Активирует расширение при запуске VSCode
 * @param {vscode.ExtensionContext} context - Контекст расширения VSCode
 */
export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('comment-typer.startTyping', showMainMenu),
        vscode.commands.registerCommand('comment-typer.showStats', showStatistics)
    );
}

/**
 * Деактивирует расширение при закрытии VSCode
 */
export function deactivate() {}