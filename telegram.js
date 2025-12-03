import fetch from 'node-fetch';

/**
 * Gửi thông báo bài viết mới qua Telegram
 */
export async function sendTelegramNotification(postInfo) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        throw new Error('Telegram configuration missing');
    }

    // Tạo nội dung tin nhắn với Markdown formatting
    const message = `
📝 *Bài viết mới được đăng!*

*${escapeMarkdown(postInfo.title)}*

${postInfo.excerpt ? escapeMarkdown(postInfo.excerpt) : ''}

👤 Tác giả: ${escapeMarkdown(postInfo.authors)}
🔗 [Đọc bài viết](${postInfo.url})
`.trim();

    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false
    };

    // Nếu có ảnh featured, gửi ảnh kèm caption
    if (postInfo.featureImage) {
        return sendTelegramPhoto(botToken, chatId, postInfo);
    }

    const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description}`);
    }

    return data;
}

/**
 * Gửi ảnh với caption qua Telegram
 */
async function sendTelegramPhoto(botToken, chatId, postInfo) {
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;

    const caption = `
📝 *${escapeMarkdown(postInfo.title)}*

${postInfo.excerpt ? escapeMarkdown(postInfo.excerpt) : ''}

👤 ${escapeMarkdown(postInfo.authors)}
🔗 [Đọc bài viết](${postInfo.url})
`.trim();

    const payload = {
        chat_id: chatId,
        photo: postInfo.featureImage,
        caption: caption,
        parse_mode: 'Markdown'
    };

    const response = await fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.ok) {
        throw new Error(`Telegram API error: ${data.description}`);
    }

    return data;
}

/**
 * Escape các ký tự đặc biệt cho Telegram Markdown
 */
function escapeMarkdown(text) {
    if (!text) return '';
    return text
        .replace(/_/g, '\\_')
        .replace(/\*/g, '\\*')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/~/g, '\\~')
        .replace(/`/g, '\\`')
        .replace(/>/g, '\\>')
        .replace(/#/g, '\\#')
        .replace(/\+/g, '\\+')
        .replace(/-/g, '\\-')
        .replace(/=/g, '\\=')
        .replace(/\|/g, '\\|')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\./g, '\\.')
        .replace(/!/g, '\\!');
}
