// ===== 导航栏滚动效果 =====
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');

// 滚动时改变导航栏样式
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 移动端菜单切换
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// 点击导航链接后关闭菜单
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// ===== 导航高亮 =====
const sections = document.querySelectorAll('section[id]');

function highlightNav() {
    const scrollY = window.scrollY;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navItems.forEach(item => item.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightNav);

// ===== 项目分类筛选 =====
const categoryBtns = document.querySelectorAll('.category-btn');
const projectCards = document.querySelectorAll('.project-card');

categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 更新按钮状态
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // 筛选项目卡片
        const category = btn.getAttribute('data-category');

        projectCards.forEach(card => {
            if (category === 'all' || card.getAttribute('data-category') === category) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// 添加淡入动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// ===== 返回顶部按钮 =====
const backToTop = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===== 滚动动画 =====
function revealOnScroll() {
    const elements = document.querySelectorAll('.team-card, .project-card, .gallery-item');

    elements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (elementTop < windowHeight - 100) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    });
}

// 初始化元素状态
document.querySelectorAll('.team-card, .project-card, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
});

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ===== 平滑滚动 =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===== 图片画廊点击效果 =====
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        // 这里可以添加图片预览功能
        // 目前只是一个占位提示
        const placeholder = item.querySelector('.gallery-placeholder span');
        if (placeholder) {
            alert('请将图片文件放入 images 文件夹，然后在 HTML 中替换占位符');
        }
    });
});

// ===== 控制台欢迎信息 =====
console.log('%c机械设计大赛团队资料库', 'color: #2563eb; font-size: 24px; font-weight: bold;');
console.log('%c创新设计 · 智造未来', 'color: #64748b; font-size: 14px;');

// ===== GitHub 文件管理功能 =====
(function() {
    // DOM 元素
    const configBtn = document.getElementById('configBtn');
    const configModal = document.getElementById('configModal');
    const closeConfigModal = document.getElementById('closeConfigModal');
    const fileListModal = document.getElementById('fileListModal');
    const closeFileListModal = document.getElementById('closeFileListModal');
    const uploadModal = document.getElementById('uploadModal');
    const toast = document.getElementById('toast');

    // 表单元素
    const githubOwner = document.getElementById('githubOwner');
    const githubRepo = document.getElementById('githubRepo');
    const githubToken = document.getElementById('githubToken');
    const saveConfigBtn = document.getElementById('saveConfig');
    const clearConfigBtn = document.getElementById('clearConfig');
    const configStatus = document.getElementById('configStatus');

    // 文件列表元素
    const fileListTitle = document.getElementById('fileListTitle');
    const fileList = document.getElementById('fileList');
    const fileLoading = document.getElementById('fileLoading');
    const fileEmpty = document.getElementById('fileEmpty');
    const uploadBtn = document.getElementById('uploadBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const fileInput = document.getElementById('fileInput');

    // 上传进度元素
    const uploadFileName = document.getElementById('uploadFileName');
    const progressFill = document.getElementById('progressFill');
    const uploadStatus = document.getElementById('uploadStatus');

    // 当前操作的路径
    let currentPath = '';

    // 初始化
    function init() {
        updateConfigButton();
        loadConfigToForm();
        bindEvents();
        loadAllDirectoryStats(); // 加载所有目录统计
    }

    // 更新配置按钮状态
    function updateConfigButton() {
        if (githubAPI.isConfigured()) {
            configBtn.classList.add('configured');
            configBtn.title = 'GitHub 已配置';
            loadAllDirectoryStats(); // 配置成功后刷新统计
        } else {
            configBtn.classList.remove('configured');
            configBtn.title = 'GitHub 配置';
        }
    }

    // 加载所有目录的统计信息
    async function loadAllDirectoryStats() {
        if (!githubAPI.isConfigured()) {
            // 未配置时显示提示
            document.querySelectorAll('.file-count').forEach(el => {
                el.textContent = '请先配置';
            });
            document.querySelectorAll('.update-time').forEach(el => {
                el.textContent = '';
            });
            // 首页统计显示默认值
            const statFiles = document.getElementById('statFiles');
            if (statFiles) statFiles.textContent = '0';
            return;
        }

        const paths = ['files/design', 'files/bom', 'files/code', 'files/docs', 'files/media', 'files/ppt'];
        let totalFiles = 0;

        for (const path of paths) {
            const count = await loadDirectoryStats(path);
            totalFiles += count;
        }

        // 更新首页统计
        const statFiles = document.getElementById('statFiles');
        if (statFiles) statFiles.textContent = totalFiles;
    }

    // 加载单个目录的统计信息
    async function loadDirectoryStats(path) {
        const countEl = document.querySelector(`.file-count[data-path="${path}"]`);
        const timeEl = document.querySelector(`.update-time[data-path="${path}"]`);

        let fileCount = 0;

        try {
            const stats = await githubAPI.getDirectoryStats(path);
            fileCount = stats.count;
            if (countEl) countEl.textContent = `${stats.count} 个文件`;
            if (timeEl) timeEl.textContent = stats.lastUpdate ? `更新于 ${githubAPI.formatDate(stats.lastUpdate)}` : '暂无文件';
        } catch (error) {
            if (countEl) countEl.textContent = '0 个文件';
            if (timeEl) timeEl.textContent = '暂无文件';
        }

        return fileCount;
    }

    // 加载配置到表单
    function loadConfigToForm() {
        githubOwner.value = githubAPI.owner || '';
        githubRepo.value = githubAPI.repo || '';
        githubToken.value = githubAPI.token || '';
    }

    // 绑定事件
    function bindEvents() {
        // 配置按钮
        configBtn.addEventListener('click', () => openModal(configModal));
        closeConfigModal.addEventListener('click', () => closeModal(configModal));

        // 保存配置
        saveConfigBtn.addEventListener('click', saveConfig);
        clearConfigBtn.addEventListener('click', clearConfig);

        // 文件列表模态框
        closeFileListModal.addEventListener('click', () => closeModal(fileListModal));

        // 上传按钮
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
        refreshBtn.addEventListener('click', () => loadFileList(currentPath));

        // 项目卡片按钮
        document.querySelectorAll('.btn-files').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const path = e.target.dataset.path;
                const title = e.target.dataset.title;
                openFileList(path, title);
            });
        });

        document.querySelectorAll('.btn-upload').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const path = e.target.dataset.path;
                if (!githubAPI.isConfigured()) {
                    showToast('请先配置 GitHub Token', 'error');
                    openModal(configModal);
                    return;
                }
                currentPath = path;
                fileInput.click();
            });
        });

        // 点击模态框外部关闭
        [configModal, fileListModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });

        // ESC 键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal(configModal);
                closeModal(fileListModal);
            }
        });
    }

    // 打开模态框
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // 关闭模态框
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // 保存配置
    async function saveConfig() {
        const owner = githubOwner.value.trim();
        const repo = githubRepo.value.trim();
        const token = githubToken.value.trim();

        if (!owner || !repo || !token) {
            showConfigStatus('请填写所有字段', 'error');
            return;
        }

        // 临时保存以验证
        githubAPI.saveConfig(token, owner, repo);

        // 验证 Token
        showConfigStatus('正在验证...', 'success');
        const isValid = await githubAPI.validateToken();

        if (isValid) {
            showConfigStatus('配置成功！', 'success');
            updateConfigButton();
            setTimeout(() => closeModal(configModal), 1000);
        } else {
            showConfigStatus('Token 无效，请检查后重试', 'error');
            githubAPI.clearConfig();
            updateConfigButton();
        }
    }

    // 清除配置
    function clearConfig() {
        githubAPI.clearConfig();
        githubOwner.value = '';
        githubRepo.value = '';
        githubToken.value = '';
        updateConfigButton();
        showConfigStatus('配置已清除', 'success');
    }

    // 显示配置状态
    function showConfigStatus(message, type) {
        configStatus.textContent = message;
        configStatus.className = 'config-status ' + type;
    }

    // 打开文件列表
    function openFileList(path, title) {
        if (!githubAPI.isConfigured()) {
            showToast('请先配置 GitHub Token', 'error');
            openModal(configModal);
            return;
        }

        currentPath = path;
        fileListTitle.textContent = title || '文件列表';
        openModal(fileListModal);
        loadFileList(path);
    }

    // 加载文件列表
    async function loadFileList(path) {
        fileList.innerHTML = '';
        fileLoading.classList.add('active');
        fileEmpty.classList.remove('active');

        try {
            const files = await githubAPI.getFileList(path);
            fileLoading.classList.remove('active');

            if (files.length === 0) {
                fileEmpty.classList.add('active');
                return;
            }

            files.forEach(file => {
                const item = createFileItem(file);
                fileList.appendChild(item);
            });
        } catch (error) {
            fileLoading.classList.remove('active');
            fileEmpty.classList.add('active');
            fileEmpty.querySelector('p').textContent = error.message;
            showToast('加载失败: ' + error.message, 'error');
        }
    }

    // 创建文件项
    function createFileItem(file) {
        const item = document.createElement('div');
        item.className = 'file-item';

        const icon = getFileIcon(file.name, file.type);
        const size = file.type === 'file' ? githubAPI.formatFileSize(file.size) : '文件夹';

        item.innerHTML = `
            <div class="file-icon">${icon}</div>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-meta">${size}</div>
            </div>
            <div class="file-actions">
                ${file.type === 'file' ? `
                    <a href="${file.download_url}" download="${file.name}" title="下载">⬇️</a>
                    <a href="${file.html_url}" target="_blank" title="在 GitHub 查看">🔗</a>
                ` : `
                    <button class="btn-folder" data-path="${file.path}" title="打开文件夹">📂</button>
                `}
                <button class="btn-delete" data-path="${file.path}" data-sha="${file.sha}" data-name="${file.name}" title="删除">🗑️</button>
            </div>
        `;

        // 绑定文件夹点击事件
        const folderBtn = item.querySelector('.btn-folder');
        if (folderBtn) {
            folderBtn.addEventListener('click', () => {
                currentPath = file.path;
                fileListTitle.textContent = file.name;
                loadFileList(file.path);
            });
        }

        // 绑定删除事件
        const deleteBtn = item.querySelector('.btn-delete');
        deleteBtn.addEventListener('click', () => {
            if (confirm(`确定要删除 "${file.name}" 吗？`)) {
                deleteFile(file.path, file.sha, file.name);
            }
        });

        return item;
    }

    // 获取文件图标
    function getFileIcon(name, type) {
        if (type === 'dir') return '📁';

        const ext = name.split('.').pop().toLowerCase();
        const icons = {
            'pdf': '📕',
            'doc': '📘', 'docx': '📘',
            'xls': '📗', 'xlsx': '📗',
            'ppt': '📙', 'pptx': '📙',
            'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'svg': '🖼️',
            'mp4': '🎬', 'avi': '🎬', 'mov': '🎬', 'mkv': '🎬',
            'mp3': '🎵', 'wav': '🎵',
            'zip': '📦', 'rar': '📦', '7z': '📦',
            'py': '🐍', 'js': '📜', 'html': '🌐', 'css': '🎨',
            'c': '💻', 'cpp': '💻', 'h': '💻',
            'ino': '🔌', // Arduino
            'sldprt': '⚙️', 'sldasm': '⚙️', 'slddrw': '📐', // SolidWorks
            'step': '⚙️', 'stp': '⚙️', 'iges': '⚙️', 'igs': '⚙️',
            'stl': '🔷', 'obj': '🔷',
            'dwg': '📐', 'dxf': '📐'
        };

        return icons[ext] || '📄';
    }

    // 处理文件选择
    async function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (!githubAPI.isConfigured()) {
            showToast('请先配置 GitHub Token', 'error');
            openModal(configModal);
            return;
        }

        // 上传文件
        for (let i = 0; i < files.length; i++) {
            await uploadFile(files[i], i + 1, files.length);
        }

        // 清空文件输入
        fileInput.value = '';

        // 刷新文件列表和统计
        if (fileListModal.classList.contains('active')) {
            loadFileList(currentPath);
        }
        loadDirectoryStats(currentPath);
    }

    // 上传单个文件
    async function uploadFile(file, current, total) {
        openModal(uploadModal);
        uploadFileName.textContent = `${file.name} (${current}/${total})`;
        progressFill.style.width = '0%';
        uploadStatus.textContent = '准备上传...';
        uploadStatus.className = 'upload-status';

        try {
            // 模拟进度
            progressFill.style.width = '30%';
            uploadStatus.textContent = '正在上传...';

            const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
            await githubAPI.uploadFile(filePath, file);

            progressFill.style.width = '100%';
            uploadStatus.textContent = '上传成功！';
            uploadStatus.className = 'upload-status success';

            showToast(`${file.name} 上传成功`, 'success');

            // 延迟关闭
            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
            progressFill.style.width = '100%';
            uploadStatus.textContent = '上传失败: ' + error.message;
            uploadStatus.className = 'upload-status error';

            showToast(`${file.name} 上传失败`, 'error');

            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        closeModal(uploadModal);
    }

    // 删除文件
    async function deleteFile(path, sha, name) {
        try {
            await githubAPI.deleteFile(path, sha);
            showToast(`${name} 已删除`, 'success');
            loadFileList(currentPath);
            loadDirectoryStats(currentPath); // 刷新统计
        } catch (error) {
            showToast('删除失败: ' + error.message, 'error');
        }
    }

    // 显示 Toast 提示
    function showToast(message, type = '') {
        toast.textContent = message;
        toast.className = 'toast ' + type;
        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }

    // 初始化
    init();
})();
