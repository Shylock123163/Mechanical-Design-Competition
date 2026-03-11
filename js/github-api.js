/**
 * GitHub API 封装类
 * 用于文件上传、下载和列表获取
 */
class GitHubAPI {
    constructor() {
        this.baseUrl = 'https://api.github.com';
        this.owner = '';
        this.repo = '';
        this.token = '';
        this.loadConfig();
    }

    // 从 localStorage 加载配置
    loadConfig() {
        this.token = localStorage.getItem('github_token') || '';
        this.owner = localStorage.getItem('github_owner') || '';
        this.repo = localStorage.getItem('github_repo') || '';
    }

    // 保存配置到 localStorage
    saveConfig(token, owner, repo) {
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_owner', owner);
        localStorage.setItem('github_repo', repo);
        this.token = token;
        this.owner = owner;
        this.repo = repo;
    }

    // 清除配置
    clearConfig() {
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_owner');
        localStorage.removeItem('github_repo');
        this.token = '';
        this.owner = '';
        this.repo = '';
    }

    // 检查是否已配置
    isConfigured() {
        return this.token && this.owner && this.repo;
    }

    // 获取请求头
    getHeaders() {
        return {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
    }

    // 获取文件列表
    async getFileList(path = '') {
        if (!this.isConfigured()) {
            throw new Error('请先配置 GitHub Token');
        }

        const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return []; // 目录不存在返回空数组
                }
                const error = await response.json();
                throw new Error(error.message || '获取文件列表失败');
            }

            const data = await response.json();

            // 如果是单个文件，包装成数组
            if (!Array.isArray(data)) {
                return [data];
            }

            return data.map(item => ({
                name: item.name,
                path: item.path,
                size: item.size,
                type: item.type,
                sha: item.sha,
                download_url: item.download_url,
                html_url: item.html_url
            }));
        } catch (error) {
            console.error('获取文件列表错误:', error);
            throw error;
        }
    }

    // 上传文件
    async uploadFile(path, file, message = '') {
        if (!this.isConfigured()) {
            throw new Error('请先配置 GitHub Token');
        }

        const content = await this.fileToBase64(file);
        const commitMessage = message || `上传文件: ${file.name}`;

        // 检查文件是否已存在（获取 sha）
        let sha = null;
        try {
            const existingFile = await this.getFileInfo(path);
            if (existingFile) {
                sha = existingFile.sha;
            }
        } catch (e) {
            // 文件不存在，正常上传
        }

        const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;

        const body = {
            message: commitMessage,
            content: content
        };

        if (sha) {
            body.sha = sha; // 更新已存在的文件
        }

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '上传文件失败');
            }

            return await response.json();
        } catch (error) {
            console.error('上传文件错误:', error);
            throw error;
        }
    }

    // 获取单个文件信息
    async getFileInfo(path) {
        const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            return null;
        }

        return await response.json();
    }

    // 删除文件
    async deleteFile(path, sha, message = '') {
        if (!this.isConfigured()) {
            throw new Error('请先配置 GitHub Token');
        }

        const url = `${this.baseUrl}/repos/${this.owner}/${this.repo}/contents/${path}`;
        const commitMessage = message || `删除文件: ${path}`;

        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    message: commitMessage,
                    sha: sha
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '删除文件失败');
            }

            return await response.json();
        } catch (error) {
            console.error('删除文件错误:', error);
            throw error;
        }
    }

    // 文件转 Base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // 移除 data:xxx;base64, 前缀
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

    // 验证 Token 是否有效
    async validateToken() {
        if (!this.token) {
            return false;
        }

        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                headers: this.getHeaders()
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    // 获取用户信息
    async getUserInfo() {
        if (!this.token) {
            return null;
        }

        try {
            const response = await fetch(`${this.baseUrl}/user`, {
                headers: this.getHeaders()
            });

            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch {
            return null;
        }
    }

    // 获取目录统计信息（文件数量和最后更新时间）
    async getDirectoryStats(path) {
        if (!this.isConfigured()) {
            return { count: 0, lastUpdate: null };
        }

        try {
            // 获取文件列表
            const files = await this.getFileList(path);
            const fileCount = files.filter(f => f.type === 'file').length;

            // 获取最后一次提交时间
            const commitsUrl = `${this.baseUrl}/repos/${this.owner}/${this.repo}/commits?path=${path}&per_page=1`;
            const response = await fetch(commitsUrl, {
                headers: this.getHeaders()
            });

            let lastUpdate = null;
            if (response.ok) {
                const commits = await response.json();
                if (commits.length > 0) {
                    lastUpdate = new Date(commits[0].commit.committer.date);
                }
            }

            return { count: fileCount, lastUpdate };
        } catch (error) {
            console.error('获取目录统计错误:', error);
            return { count: 0, lastUpdate: null };
        }
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
