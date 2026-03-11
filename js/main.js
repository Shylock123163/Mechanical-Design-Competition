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

// ===== 数字动画 =====
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');

    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateNumber = () => {
            current += step;
            if (current < target) {
                stat.textContent = Math.floor(current);
                requestAnimationFrame(updateNumber);
            } else {
                stat.textContent = target;
            }
        };

        updateNumber();
    });
}

// 页面加载时启动数字动画
window.addEventListener('load', animateNumbers);

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
    const elements = document.querySelectorAll('.team-card, .project-card, .doc-item, .timeline-item, .gallery-item');

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
document.querySelectorAll('.team-card, .project-card, .doc-item, .timeline-item, .gallery-item').forEach(el => {
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
