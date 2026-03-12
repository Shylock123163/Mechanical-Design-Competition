/**
 * 文件存储 API 封装类
 * 通过 Cloudflare Worker + R2 实现大文件存储
 */
class FileStorageAPI {
    constructor() {
        this.apiEndpoint = 'https://robot-api.17280786513.workers.dev';
    }

    // 始终可用
    isConfigured() {
        return true;
    }

    // 获取文件列表
    async getFileList(path = '') {
        const prefix = path ? (path.endsWith('/') ? path : path + '/') : '';
        const response = await fetch(`${this.apiEndpoint}/api/list?prefix=${encodeURIComponent(prefix)}`);

        if (!response.ok) {
            throw new Error('获取文件列表失败');
        }

        return await response.json();
    }

    // 上传文件
    async uploadFile(path, file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', path);

        const response = await fetch(`${this.apiEndpoint}/api/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '上传失败');
        }

        return await response.json();
    }

    // 删除文件
    async deleteFile(path) {
        const response = await fetch(`${this.apiEndpoint}/api/delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
        });

        if (!response.ok) {
            throw new Error('删除失败');
        }

        return await response.json();
    }

    // 获取下载链接
    getDownloadUrl(path) {
        return `${this.apiEndpoint}/api/download?path=${encodeURIComponent(path)}`;
    }

    // 获取目录统计
    async getDirectoryStats(path) {
        const prefix = path ? (path.endsWith('/') ? path : path + '/') : '';

        try {
            const response = await fetch(`${this.apiEndpoint}/api/stats?prefix=${encodeURIComponent(prefix)}`);

            if (!response.ok) {
                return { count: 0, lastUpdate: null };
            }

            const data = await response.json();
            return {
                count: data.count || 0,
                lastUpdate: data.lastUpdate ? new Date(data.lastUpdate) : null
            };
        } catch (error) {
            console.error('获取统计失败:', error);
            return { count: 0, lastUpdate: null };
        }
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

// 创建全局实例（保持兼容性）
const githubAPI = new FileStorageAPI();
