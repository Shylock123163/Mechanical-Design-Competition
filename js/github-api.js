/**
 * GitHub API 封装类
 * 通过 Netlify Functions 后端访问 GitHub API
 * 无需用户配置 Token
 */
class GitHubAPI {
    constructor() {
        // Netlify Functions 端点
        this.apiEndpoint = '/.netlify/functions/github-api';
    }

    // 始终返回已配置（后端已配置 Token）
    isConfigured() {
        return true;
    }

    // 调用后端 API
    async callAPI(action, params = {}) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, ...params })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }

            return data;
        } catch (error) {
            console.error('API 调用错误:', error);
            throw error;
        }
    }

    // 获取文件列表
    async getFileList(path = '') {
        return await this.callAPI('list', { path });
    }

    // 上传文件
    async uploadFile(path, file, message = '') {
        const content = await this.fileToBase64(file);
        const commitMessage = message || `上传文件: ${file.name}`;

        return await this.callAPI('upload', {
            path,
            content,
            message: commitMessage
        });
    }

    // 删除文件
    async deleteFile(path, sha, message = '') {
        const commitMessage = message || `删除文件: ${path}`;

        return await this.callAPI('delete', {
            path,
            sha,
            message: commitMessage
        });
    }

    // 获取目录统计信息
    async getDirectoryStats(path) {
        try {
            const files = await this.getFileList(path);
            const fileCount = files.filter(f => f.type === 'file').length;

            // 获取最后提交时间
            const commits = await this.callAPI('commits', { path });
            let lastUpdate = null;
            if (commits && commits.length > 0) {
                lastUpdate = new Date(commits[0].commit.committer.date);
            }

            return { count: fileCount, lastUpdate };
        } catch (error) {
            console.error('获取目录统计错误:', error);
            return { count: 0, lastUpdate: null };
        }
    }

    // 文件转 Base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 格式化日期
    formatDate(date) {
        if (!date) return '--';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// 创建全局实例
const githubAPI = new GitHubAPI();
