/* Static scene illustrations; no model calls or project data are used. */
(() => {
  'use strict';

  const root = document.documentElement;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const colorPreference = matchMedia('(prefers-color-scheme: dark)');
  const themeKey = 'electric-bid-site-theme';
  const themeToggle = document.querySelector('.theme-toggle');
  function applyTheme(theme, source = 'system') {
    root.dataset.theme = theme;
    root.dataset.themeSource = source;
    const light = theme === 'light';
    const label = light ? '切换到暗色模式' : '切换到亮色模式';
    themeToggle.setAttribute('aria-label', label);
    themeToggle.setAttribute('title', label);
    themeToggle.querySelector('.theme-label').textContent = light ? '暗色' : '亮色';
    document.querySelector('meta[name="theme-color"]').content = light ? '#f6f8f5' : '#090c10';
  }
  applyTheme(root.dataset.theme, root.dataset.themeSource);
  themeToggle.addEventListener('click', () => {
    const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme, 'user');
    try { localStorage.setItem(themeKey, theme); } catch { /* Keep the choice for this page session. */ }
  });
  colorPreference.addEventListener('change', (event) => {
    if (root.dataset.themeSource !== 'user') applyTheme(event.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', (event) => {
    if (event.key !== themeKey && event.key !== null) return;
    let theme;
    try { theme = localStorage.getItem(themeKey); } catch { return; }
    const explicit = theme === 'dark' || theme === 'light';
    applyTheme(explicit ? theme : (colorPreference.matches ? 'dark' : 'light'), explicit ? 'user' : 'system');
  });

  const progress = document.querySelector('.reading-progress');
  let scrollFrame = 0;
  function scheduleProgress() {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      const distance = root.scrollHeight - root.clientHeight;
      const fraction = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
      progress.style.transform = `scaleX(${fraction})`;
      scrollFrame = 0;
    });
  }
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleProgress).observe(document.body);
  scheduleProgress();

  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const title = (text, badge, tabs) => `
    <div class="demo-breadcrumb">我的项目 <span>/</span> 光伏 EPC 采购项目</div>
    <div class="demo-title-row"><h3>${text}</h3><span class="badge badge-green">${badge}</span></div>
    <div class="demo-subnav">${tabs.map((tab, index) => `<span class="${index === 0 ? 'active' : ''}">${tab}</span>`).join('')}</div>`;
  const assistant = (question, answer, activities, result, note) => `
    <div class="chat-user">${question}</div>
    <div class="chat-ai"><span class="chat-ai-label">小招</span><p>${answer}</p>${activities.map(([name, text]) => `<div class="activity-line">${icon(name)} ${text}</div>`).join('')}</div>
    <div class="assistant-result">${icon('lock')}<span>${result}<br><small>${note}</small></span></div>`;

  const scenes = {
    requirement: {
      index: '01 — REQUIREMENT',
      description: '读懂需求，研究市场，再确定采购策略。AI 给出有依据的建议，分析草稿由项目经理逐节确认。',
      content: title('采购前分析', '信息已关联', ['需求确认', '市场调研', '采购策略']) + `
        <div class="demo-report"><div class="report-heading">${icon('file')}<strong>业主需求分析</strong><span class="badge">待人工确认</span></div>
          <div class="report-row"><span>采购标的</span><strong>光伏电站 EPC 总承包</strong></div>
          <div class="report-row"><span>工程范围</span><strong>设计 · 设备采购 · 施工</strong></div>
          <div class="report-row"><span>关键资料</span><strong>业主任务书、技术要求</strong></div>
          <div class="demo-callout"><span class="status-dot"></span> 确认后的要点，沉淀为后续文件的共同依据</div>
        </div><div class="demo-footer-line">${icon('check')} 逐节确认分析结果 <span>→</span> 同步项目信息池</div>`,
      chat: assistant('请根据业主任务书，梳理采购需求。', '已整理采购标的、工程范围与技术要求。请先核对需求，再共同完善采购策略。', [['check', '提取需求要点'], ['book', '结合采购制度提供建议']], '分析结果由你确认', '确认后才成为项目事实')
    },
    document: {
      index: '02 — DOCUMENT',
      description: '推荐范本、历史复用或 AI 逐章生成，选择合适的起点。边聊边填字段，按项目特征启用章节，让文件编制顺畅向前。',
      content: title('招标文件编制', '字段已关联', ['正文编辑', '全文预览', '导出核对']) + `
        <div class="demo-chapters"><span>第一章 · 公告</span><span>第二章 · 须知</span><span class="active">第三章 · 技术规范</span></div>
        <div class="demo-paper"><h4>第三章　技术规范</h4><p>本项目采购标的为 <span class="field-chip">光伏 EPC 总承包</span>，工程范围包括设计、设备采购与施工。</p><p>项目名称：<span class="field-chip locked">${icon('lock')} 光伏 EPC 采购项目</span></p><p>其余技术条件依据业主任务书，按本项目逐项编制与核对。</p></div>
        <div class="demo-footer-line">${icon('check')} 范本结构 + 项目事实 <span>→</span> 按章定制正文</div>`,
      chat: assistant('参照任务书，帮我完善技术规范。', '将结合已确认的项目信息改写本章。项目名称已锁定，我会保留原值；缺失的参数会请你补充。', [['file', '读取本章正文与项目事实'], ['lock', '跳过已锁定字段']], '关键字段由你保护', 'AI 建议与修改均留痕')
    },
    health: {
      index: '03 — DOCUMENT HEALTH',
      description: '合规、矛盾与缺漏一起看。检查结论关联原文与批注，清楚说明改哪里、怎么改，支持查看历史并在修改后重新检查。',
      content: title('文档体检', '原文联动审阅', ['问题清单', '对照原文', '历史记录']) + `
        <div class="health-summary"><span>检查维度<strong>合规 · 一致性 · 完整性</strong></span><span>结论口径<strong>踩雷 · 存疑 · 合规</strong></span></div>
        <div class="finding"><strong>01　资格条件需补充依据</strong>核对该项资质要求与采购标的的关联性，确认是否限制竞争。<small>定位：第二章 · 投标人资格要求</small></div>
        <div class="finding finding-cyan"><strong>02　不同章节的工期表述需核对</strong>对照公告与技术规范，统一工期和起算口径。<small>定位：第一章 ↔ 第三章</small></div>
        <div class="demo-footer-line">${icon('search')} 点击问题定位原文 <span>→</span> 查看修改建议</div>`,
      chat: assistant('帮我体检这份招标文件。', '体检将检查制度要求、关键参数与正文一致性。发现的问题会关联到原文，证据不足的事项标为存疑。', [['book', '按需查阅制度依据'], ['shield', '核验条款与前后口径']], '问题与原文对应', '修改后可重新检查')
    },
    review: {
      index: '04 — REVIEW & VERIFICATION',
      description: '让评审标准与文件要求连起来。资格、符合性和评分专项在线确认，再逐项核验各供应商的投标响应。',
      content: title('评审与投标检查', '标准先确认', ['评审标准', '投标文件', '检查报告']) + `
        <table class="review-table"><thead><tr><th>专项</th><th>核验内容</th><th>处理方式</th></tr></thead><tbody><tr><td>资格审查</td><td>资质与业绩要求</td><td>逐项对照</td></tr><tr><td>符合性审查</td><td>投标文件响应情况</td><td>识别偏差</td></tr><tr><td>综合评分</td><td>因素、标准与权重</td><td>在线核对</td></tr></tbody></table>
        <div class="demo-callout"><span class="status-dot"></span> 已确认的评审标准，是投标检查的对照基准</div>
        <div class="demo-footer-line">${icon('check')} 生成 <span>→</span> 编辑确认 <span>→</span> 检查投标文件</div>`,
      chat: assistant('根据招标文件，整理评审标准。', '将分别整理资格审查、符合性审查和综合评分细则。你确认保存后，再用这些标准核验投标文件。', [['layers', '整理三个评审专项'], ['check', '校验评分权重合计']], '确认后作为检查依据', '评审标准可在线调整')
    },
    supplier: {
      index: '05 — SUPPLIER INTELLIGENCE',
      description: '从潜在供应商推荐，到已知供应商尽调。供应商档案、不良记录、联网核验与体检历史，为风险判断提供参考。',
      content: title('供应商风险档案', '多源交叉核验', ['企业档案', '风险体检', '不良记录']) + `
        <div class="supplier-profile">${icon('building')}<div><strong>示例能源工程企业</strong><small>供应商档案 · 演示内容</small></div><span class="badge">待核验</span></div>
        <div class="supplier-checks"><span>${icon('search')} 工商与经营范围</span><span>${icon('search')} 司法与失信风险</span><span>${icon('search')} 行政处罚与异常</span><span>${icon('file')} 不良记录与历史</span></div>
        <div class="demo-callout"><span class="status-dot"></span> 区分「已核验」与「未获取到信息」</div>
        <div class="demo-footer-line">${icon('clock')} 每次体检留档 <span>→</span> 形成持续风险记录</div>`,
      chat: assistant('核验这家供应商的经营和司法风险。', '将结合联网信息和企业数据源交叉核验，并保留来源与体检记录。没有查到的信息，会如实标明。', [['search', '检查工商与风险数据'], ['clock', '保留本次体检记录']], '有来源，才有判断', '数据核验需配置相应服务')
    }
  };

  const tabs = [...document.querySelectorAll('[data-scene]')];
  const panel = document.getElementById('scene-panel');
  let currentScene = 'requirement';
  let sceneAnimations = [];
  function selectScene(name, focus = false) {
    const scene = scenes[name];
    if (!scene) return;
    for (const tab of tabs) {
      const active = tab.dataset.scene === name;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    }
    if (name === currentScene) return;
    currentScene = name;
    sceneAnimations.forEach((animation) => animation.cancel());
    sceneAnimations = [];
    document.getElementById('demo-main').innerHTML = scene.content;
    document.getElementById('assistant-content').innerHTML = scene.chat;
    document.getElementById('scene-index').textContent = scene.index;
    document.getElementById('scene-description').textContent = scene.description;
    panel.setAttribute('aria-labelledby', `tab-${name}`);
    if (!motionPreference.matches && typeof panel.animate === 'function') {
      const elements = document.querySelectorAll('#demo-main > *, #assistant-content > *');
      elements.forEach((element, index) => {
        sceneAnimations.push(element.animate([
          { opacity: 0, transform: 'translateY(10px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 380, delay: Math.min(index, 5) * 35, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }));
      });
    }
    scheduleProgress();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectScene(tab.dataset.scene));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      selectScene(tabs[next].dataset.scene, true);
    });
  });

  document.querySelectorAll('[data-select-scene]').forEach((link) => {
    link.addEventListener('click', () => selectScene(link.dataset.selectScene));
  });

  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开导航菜单');
    nav.classList.remove('is-open');
  }
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
    nav.classList.toggle('is-open', open);
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  const mobileMedia = matchMedia('(max-width: 960px)');
  mobileMedia.addEventListener('change', closeMenu);

  // Pages serves the product presentation; the live workbench has its own host.
  const appUrl = window.ELECTRIC_BID_SITE?.appUrl;
  document.querySelectorAll('[data-app-link]').forEach((link) => {
    if (appUrl === null) {
      link.href = '#workflow';
      const label = link.querySelector('.app-link-label');
      if (label) label.textContent = '体验产品';
      else link.firstChild.textContent = '体验产品 ';
    } else if (appUrl) {
      link.href = location.protocol === 'file:' && appUrl === '/login'
        ? 'http://localhost:5173/login' : appUrl;
    }
  });
  document.getElementById('copyright-year').textContent = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Shanghai', year: 'numeric'
  }).format(new Date());

  // Decorative hover light follows the pointer only on devices with a precise pointer.
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  document.querySelectorAll('.feature-card, .trust-card, .enterprise-card').forEach((card) => {
    let frame = 0;
    let point;
    card.addEventListener('pointermove', (event) => {
      if (motionPreference.matches || !finePointer.matches) return;
      point = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--pointer-x', `${point.x - bounds.left}px`);
        card.style.setProperty('--pointer-y', `${point.y - bounds.top}px`);
        frame = 0;
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame);
      frame = 0;
      card.style.removeProperty('--pointer-x');
      card.style.removeProperty('--pointer-y');
    });
  });
  const revealElements = [...document.querySelectorAll('.reveal')];
  let revealObserver;
  if ('IntersectionObserver' in window) {
    if (!motionPreference.matches) {
      document.querySelectorAll('.feature-grid, .trust-stack, .enterprise-grid').forEach((group) => {
        [...group.children].forEach((element, index) => element.style.setProperty('--reveal-delay', `${index % 3 * 0.08}s`));
      });
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
            setTimeout(() => entry.target.style.removeProperty('--reveal-delay'), 950);
          }
        });
      }, { threshold: 0.08 });
      revealElements.forEach((element) => revealObserver.observe(element));
      document.body.classList.add('motion-ready');
    }
    const ambientObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('ambient-paused', !entry.isIntersecting));
    }, { rootMargin: '100px', threshold: 0 });
    document.querySelectorAll('.hero, .engine, .pool-diagram, .feature-large, .feature-wide, .closing-inner').forEach((element) => ambientObserver.observe(element));
    const navLinks = [...nav.querySelectorAll('a')];
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    navLinks.forEach((link) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) navObserver.observe(target);
    });
  }
  motionPreference.addEventListener('change', (event) => {
    if (!event.matches) return;
    sceneAnimations.forEach((animation) => animation.cancel());
    sceneAnimations = [];
    revealObserver?.disconnect();
    document.body.classList.remove('motion-ready');
    revealElements.forEach((element) => element.classList.add('is-visible'));
  });
  const syncVisibility = () => document.body.classList.toggle('page-hidden', document.hidden);
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();
})();
