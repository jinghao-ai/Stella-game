document.addEventListener('DOMContentLoaded', function () {
  // 如果页面有 .game-card，设置悬停样式（保持你原来的交互）
  document.querySelectorAll('.game-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      card.style.transform = 'translateY(-10px)';
      card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.4)';
      card.style.border = '1px solid rgba(102, 192, 244, 0.4)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
      card.style.border = '1px solid rgba(102, 192, 244, 0.1)';
    });
  });

  // 如果页面使用 .feature-card（团队卡），也加上悬停微动效（不直接改样式表，保持轻微内联更改）
  document.querySelectorAll('.feature-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      card.style.transform = 'translateY(-6px)';
      card.style.boxShadow = '0 12px 28px rgba(0,0,0,0.35)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });

  // 导航链接 active 效果 & 平滑滚动（如果是锚点）
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function (e) {
      // 如果是内部锚点，就平滑滚动
      var href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        var target = document.querySelector(href);
        if (target) {
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.pageYOffset - 70,
            behavior: 'smooth'
          });
        }
      } else {
        // 对站内链接，设置 active 样式并允许默认导航
        document.querySelectorAll('.nav-links a').forEach(function (l) {
          l.classList.remove('active');
        });
        link.classList.add('active');
      }
    });
  });

  // 按钮 / .btn 的 hover 效果（补充：适用于不支持 :hover 或想要更强 JS 控制时）
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('mouseenter', function () {
      btn.style.transform = 'translateY(-3px)';
      btn.style.boxShadow = '0 6px 20px rgba(102, 192, 244, 0.5)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
      btn.style.boxShadow = '';
    });
  });

  // 为所有 view-all 链接添加 focus 样式（便于键盘导航）
  document.querySelectorAll('.view-all').forEach(function (a) {
    a.addEventListener('focus', function () {
      a.style.outline = '2px solid rgba(102,192,244,0.25)';
      a.style.outlineOffset = '4px';
    });
    a.addEventListener('blur', function () {
      a.style.outline = '';
      a.style.outlineOffset = '';
    });
  });
});