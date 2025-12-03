import fetch from 'node-fetch';

/**
 * Đăng bài viết mới lên Facebook Fanpage
 */
export async function postToFacebook(postInfo) {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!pageId || !accessToken) {
        throw new Error('Facebook configuration missing');
    }

    // Tạo nội dung post
    const message = `
📝 ${postInfo.title}

${postInfo.excerpt}

👤 Tác giả: ${postInfo.authors}

Đọc bài viết đầy đủ tại: ${postInfo.url}
`.trim();

    const facebookApiUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;

    const payload = {
        message: message,
        access_token: accessToken
    };

    // Nếu có ảnh featured, đăng kèm ảnh
    if (postInfo.featureImage) {
        return postFacebookPhoto(pageId, accessToken, postInfo, message);
    }

    const response = await fetch(facebookApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(`Facebook API error: ${data.error.message}`);
    }

    return data;
}

/**
 * Đăng ảnh kèm caption lên Facebook Page
 */
async function postFacebookPhoto(pageId, accessToken, postInfo, caption) {
    const facebookApiUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`;

    const payload = {
        url: postInfo.featureImage,
        caption: caption,
        access_token: accessToken
    };

    const response = await fetch(facebookApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(`Facebook API error: ${data.error.message}`);
    }

    return data;
}

/**
 * Lấy thông tin Page (để test connection)
 */
export async function testFacebookConnection() {
    const pageId = process.env.FACEBOOK_PAGE_ID;
    const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!pageId || !accessToken) {
        throw new Error('Facebook configuration missing');
    }

    const url = `https://graph.facebook.com/v18.0/${pageId}?fields=name,fan_count&access_token=${accessToken}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
        throw new Error(`Facebook API error: ${data.error.message}`);
    }

    return data;
}
