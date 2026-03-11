const https = require('https');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;

function githubRequest(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}${path}`,
            method: method,
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Netlify-Function',
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = data ? JSON.parse(data) : {};
                    resolve({ statusCode: res.statusCode, data: json });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: '服务器未配置 GitHub 凭据' })
        };
    }

    try {
        const { action, path, content, message, sha } = JSON.parse(event.body || '{}');

        switch (action) {
            case 'list': {
                const result = await githubRequest('GET', `/contents/${path || ''}`);
                if (result.statusCode === 404) {
                    return { statusCode: 200, headers, body: JSON.stringify([]) };
                }
                const files = Array.isArray(result.data) ? result.data : [result.data];
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(files.map(f => ({
                        name: f.name,
                        path: f.path,
                        size: f.size,
                        type: f.type,
                        sha: f.sha,
                        download_url: f.download_url,
                        html_url: f.html_url
                    })))
                };
            }

            case 'upload': {
                // 先检查文件是否存在
                let existingSha = null;
                const checkResult = await githubRequest('GET', `/contents/${path}`);
                if (checkResult.statusCode === 200 && checkResult.data.sha) {
                    existingSha = checkResult.data.sha;
                }

                const uploadBody = {
                    message: message || `上传文件: ${path}`,
                    content: content
                };
                if (existingSha) uploadBody.sha = existingSha;

                const result = await githubRequest('PUT', `/contents/${path}`, uploadBody);
                return {
                    statusCode: result.statusCode === 200 || result.statusCode === 201 ? 200 : result.statusCode,
                    headers,
                    body: JSON.stringify(result.data)
                };
            }

            case 'delete': {
                const result = await githubRequest('DELETE', `/contents/${path}`, {
                    message: message || `删除文件: ${path}`,
                    sha: sha
                });
                return {
                    statusCode: result.statusCode === 200 ? 200 : result.statusCode,
                    headers,
                    body: JSON.stringify(result.data)
                };
            }

            case 'commits': {
                const result = await githubRequest('GET', `/commits?path=${path}&per_page=1`);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify(result.data)
                };
            }

            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: '未知操作' })
                };
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
