/**
 * Portfolio — main.js
 *
 * 이 파일의 모든 기능은 같은 패턴을 따른다.
 *
 *   사용자 이벤트 ──▶ setState(상태 변경) ──▶ render(DOM 업데이트)
 *
 * - 이벤트 핸들러는 DOM 을 직접 만지지 않고 "상태만" 바꾼다.
 * - render 함수는 "현재 상태"만 보고 화면을 그린다.
 * React 의 useState + 컴포넌트 렌더링을 순수 JS 로 흉내 낸 구조다.
 */

/* =========================================================================
 * 0. 공통 유틸
 * ========================================================================= */

// 문서 전체에 "JS 가 동작 중"임을 표시 → CSS 의 .js .reveal 이 이때만 적용
document.documentElement.classList.add('js');

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => scope.querySelectorAll(selector);

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollBehavior = () => (prefersReducedMotion() ? 'auto' : 'smooth');

/**
 * 아주 작은 상태 저장소.
 * set 으로 상태를 바꾸면 자동으로 render(state) 가 호출된다. (≈ React useState)
 */
const createStore = (initialState, render) => {
  let state = initialState;
  const get = () => state;
  const set = (patch) => {
    // 함수형 업데이트도 지원: set(prev => ({ ...prev, a: 1 }))
    const next = typeof patch === 'function' ? patch(state) : patch;
    state = { ...state, ...next };
    render(state);
  };
  render(state); // 초기 렌더
  return { get, set };
};

// innerHTML 에 외부 데이터(GitHub 응답)를 넣기 전 반드시 이스케이프 → XSS 방지
const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

// localStorage 는 사생활 보호 모드 등에서 예외를 던질 수 있으므로 감싼다
const storage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* 저장 실패해도 기능 자체는 동작 */
    }
  },
};

/* =========================================================================
 * 1. 다크 모드  (클릭 → theme 상태 → <html data-theme> 변경 → CSS 변수 교체)
 * ========================================================================= */
const THEME_KEY = 'theme';
const themeToggle = $('.theme-toggle');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

// 우선순위: 사용자가 저장한 값 > 시스템 설정(prefers-color-scheme) > light
const getInitialTheme = () => {
  const saved = storage.get(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return systemDark.matches ? 'dark' : 'light';
};

const renderTheme = ({ theme }) => {
  const isDark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? '라이트 모드로 전환' : '다크 모드로 전환');
};

const themeStore = createStore({ theme: getInitialTheme() }, renderTheme);

themeToggle.addEventListener('click', () => {
  const next = themeStore.get().theme === 'dark' ? 'light' : 'dark';
  themeStore.set({ theme: next });
  storage.set(THEME_KEY, next); // 새로고침 후에도 유지
});

// 사용자가 직접 고른 적이 없을 때만 OS 테마 변경을 따라간다
systemDark.addEventListener('change', ({ matches }) => {
  if (storage.get(THEME_KEY)) return;
  themeStore.set({ theme: matches ? 'dark' : 'light' });
});

/* =========================================================================
 * 2. 햄버거 메뉴  (클릭 → isOpen 상태 → .active 토글)
 * ========================================================================= */
const hamburger = $('.hamburger');
const navMenu = $('.nav__menu');
const desktopQuery = window.matchMedia('(min-width: 768px)');

const renderMenu = ({ isOpen }) => {
  navMenu.classList.toggle('active', isOpen);
  hamburger.classList.toggle('active', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
  hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
};

const menuStore = createStore({ isOpen: false }, renderMenu);
const closeMenu = () => {
  if (menuStore.get().isOpen) menuStore.set({ isOpen: false });
};

hamburger.addEventListener('click', () => {
  menuStore.set((prev) => ({ isOpen: !prev.isOpen }));
});

// ESC 로 닫기
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuStore.get().isOpen) {
    closeMenu();
    hamburger.focus();
  }
});

// 메뉴 바깥 클릭 시 닫기
document.addEventListener('click', (event) => {
  const { target } = event;
  if (!menuStore.get().isOpen) return;
  if (navMenu.contains(target) || hamburger.contains(target)) return;
  closeMenu();
});

// 태블릿 이상으로 화면이 커지면 모바일 메뉴 상태 초기화
desktopQuery.addEventListener('change', ({ matches }) => {
  if (matches) closeMenu();
});

/* =========================================================================
 * 3. 부드러운 스크롤  (앵커 클릭 → 기본 이동 막고 → scrollIntoView)
 * ========================================================================= */
$$('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const id = link.getAttribute('href');
    const target = id === '#' ? null : $(id);
    if (!target) return;

    event.preventDefault(); // 브라우저의 "즉시 점프" 기본 동작 방지
    closeMenu();
    target.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    history.pushState(null, '', id);

    // 키보드/스크린리더 사용자를 위해 포커스도 이동 (화면은 다시 튀지 않게)
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
});

/* =========================================================================
 * 4. 스크롤 상태  (scroll → scrollY 상태 → 헤더 배경 / 맨 위로 버튼)
 * ========================================================================= */
const header = $('.site-header');
const scrollTopBtn = $('.scroll-top');
const { navScrollThreshold, scrollTopThreshold } = CONFIG;

const renderScroll = ({ y }) => {
  header.classList.toggle('scrolled', y >= navScrollThreshold);
  scrollTopBtn.classList.toggle('visible', y >= scrollTopThreshold);
};

const scrollStore = createStore({ y: window.scrollY }, renderScroll);

// scroll 이벤트는 초당 수십 번 발생 → requestAnimationFrame 으로 프레임당 1회만 처리
let scrollTicking = false;
window.addEventListener(
  'scroll',
  () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      scrollStore.set({ y: window.scrollY });
      scrollTicking = false;
    });
  },
  { passive: true },
);

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
  $('.nav__logo').focus({ preventScroll: true });
});

/* =========================================================================
 * 5. 현재 보고 있는 섹션을 메뉴에 표시 (Intersection Observer)
 * ========================================================================= */
const navLinks = [...$$('.nav__link')];

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries
      .filter(({ isIntersecting }) => isIntersecting)
      .forEach(({ target }) => {
        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute('href') === `#${target.id}`;
          link.classList.toggle('is-current', isCurrent);
          if (isCurrent) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
  },
  // 화면 세로 중앙선에 걸린 섹션을 "현재 섹션"으로 판단
  { rootMargin: '-50% 0px -50% 0px' },
);

$$('main > section[id]').forEach((section) => sectionObserver.observe(section));

/* =========================================================================
 * 6. 스크롤 등장 애니메이션 (Intersection Observer, threshold 0.2)
 * ========================================================================= */
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      target.classList.add('is-visible');
      observer.unobserve(target); // 한 번 나타나면 관찰 종료
    });
  },
  { threshold: CONFIG.revealThreshold },
);

$$('.reveal').forEach((el) => revealObserver.observe(el));

/* =========================================================================
 * 7. Hero 타이핑 효과 (보너스)
 * ========================================================================= */
const typingEl = $('.typing');

const startTyping = (phrases) => {
  if (!typingEl || phrases.length === 0) return;

  // 모션 최소화 설정이면 애니메이션 없이 첫 문구만 표시
  if (prefersReducedMotion()) {
    typingEl.textContent = phrases[0];
    return;
  }

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const tick = () => {
    const current = phrases[phraseIndex];
    charIndex += isDeleting ? -1 : 1;
    typingEl.textContent = current.slice(0, charIndex);

    let delay = isDeleting ? 35 : 90;
    if (!isDeleting && charIndex === current.length) {
      delay = 1800; // 다 쓰면 잠시 멈춤
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 400;
    }
    window.setTimeout(tick, delay);
  };

  tick();
};

startTyping(CONFIG.typingPhrases);

/* =========================================================================
 * 8. Projects — GitHub API 연동
 *    (fetch → status: loading | success | error 상태 → Projects 영역 렌더링)
 *    (필터 버튼 클릭 → filter 상태 → 목록 재렌더링)
 * ========================================================================= */
const projectsEl = $('.projects');
const filtersEl = $('.filters');
const { githubUser, cacheTtlMs, requestTimeoutMs } = CONFIG;
const REPOS_URL = `https://api.github.com/users/${encodeURIComponent(githubUser)}/repos?sort=updated&per_page=100`;
const CACHE_KEY = `gh-repos:${githubUser}`;
const ALL = 'All';

$$('.js-gh-user').forEach((el) => {
  el.textContent = githubUser;
});

// 상태 확인용 데모 모드: ?demo=loading | error | empty  (README 참고)
const demoMode = new URLSearchParams(window.location.search).get('demo');

class GitHubError extends Error {
  constructor(message, detail = '') {
    super(message);
    this.name = 'GitHubError';
    this.detail = detail;
  }
}

// href 에는 http(s) 주소만 허용 (javascript: 같은 스킴 차단)
const safeUrl = (url) => (/^https?:\/\//i.test(url ?? '') ? url : '');

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });

// GitHub 원본 응답 → 화면에 필요한 값만 (구조분해 할당)
const toProject = ({
  name,
  description,
  html_url: url,
  homepage,
  language,
  stargazers_count: stars,
  forks_count: forks,
  topics = [],
  pushed_at: pushedAt,
}) => ({ name, description, url, homepage: safeUrl(homepage), language: language ?? 'Etc', stars, forks, topics, pushedAt });

const readCache = () => {
  if (!cacheTtlMs) return null;
  try {
    const cached = JSON.parse(window.sessionStorage.getItem(CACHE_KEY));
    if (cached && Date.now() - cached.savedAt < cacheTtlMs) return cached.repos;
  } catch {
    /* 캐시가 깨졌으면 무시 */
  }
  return null;
};

const writeCache = (repos) => {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), repos }));
  } catch {
    /* 무시 */
  }
};

const fetchRepos = async ({ useCache = true } = {}) => {
  if (demoMode === 'error') throw new GitHubError('데모: 에러 상태', '?demo=error 로 강제한 에러입니다.');
  if (demoMode === 'empty') return [];
  if (demoMode === 'loading') return new Promise(() => {}); // 영원히 로딩

  if (useCache) {
    const cached = readCache();
    if (cached) return cached;
  }

  // 응답이 없을 때 무한 대기하지 않도록 타임아웃
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(REPOS_URL, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      const { status, headers } = response;
      const remaining = headers.get('x-ratelimit-remaining');

      // 레이트 리밋: 비인증 호출은 시간당 60회. 초과 시 403(또는 429)
      if ((status === 403 || status === 429) && remaining === '0') {
        const reset = Number(headers.get('x-ratelimit-reset')) * 1000;
        const resetAt = reset ? new Date(reset).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : '';
        throw new GitHubError(
          'GitHub API 요청 한도를 초과했습니다.',
          resetAt ? `${resetAt} 이후에 다시 시도해 주세요.` : '잠시 후 다시 시도해 주세요.',
        );
      }
      if (status === 404) throw new GitHubError('GitHub 사용자를 찾을 수 없습니다.', `사용자 이름: ${githubUser}`);
      throw new GitHubError(`GitHub 응답 오류 (HTTP ${status})`);
    }

    const data = await response.json();
    const repos = data
      .filter(({ fork, archived }) => !fork && !archived) // 직접 만든 활성 저장소만
      .map(toProject)
      .sort((a, b) => b.stars - a.stars || new Date(b.pushedAt) - new Date(a.pushedAt));

    writeCache(repos);
    return repos;
  } catch (error) {
    if (error.name === 'AbortError') throw new GitHubError('응답 시간이 초과되었습니다.', '네트워크 상태를 확인해 주세요.');
    if (error instanceof GitHubError) throw error;
    throw new GitHubError('네트워크 오류가 발생했습니다.', error.message);
  } finally {
    window.clearTimeout(timer);
  }
};

/* ---------- 8-1. 렌더링 (상태 → HTML) ---------- */
const ICON_STAR =
  '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z"/></svg>';
const ICON_FORK =
  '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6 7v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7M12 12v5"/></svg>';

const projectCardTemplate = ({ name, description, url, homepage, language, stars, forks, topics, pushedAt }) => `
  <article class="project-card">
    <h3 class="project-card__title">
      <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a>
    </h3>
    ${
      description
        ? `<p class="project-card__desc">${escapeHtml(description)}</p>`
        : '<p class="project-card__desc project-card__desc--empty">설명이 없는 저장소입니다.</p>'
    }
    ${
      topics.length
        ? `<ul class="project-card__topics">${topics
            .slice(0, 4)
            .map((topic) => `<li class="tag">${escapeHtml(topic)}</li>`)
            .join('')}</ul>`
        : ''
    }
    <ul class="project-card__meta">
      <li><span class="lang-dot" data-lang="${escapeHtml(language)}"></span>${escapeHtml(language)}</li>
      <li aria-label="스타 ${stars}개">${ICON_STAR}${stars}</li>
      <li aria-label="포크 ${forks}개">${ICON_FORK}${forks}</li>
      <li><time datetime="${escapeHtml(pushedAt)}">${formatDate(pushedAt)} 업데이트</time></li>
      ${
        homepage
          ? `<li><a href="${escapeHtml(homepage)}" target="_blank" rel="noopener noreferrer">Live ↗</a></li>`
          : ''
      }
    </ul>
  </article>`;

const renderLoading = () => `
  <div class="state" role="status">
    <div class="spinner" aria-hidden="true"></div>
    <p class="state__title">로딩 중...</p>
    <p class="state__detail">GitHub에서 저장소 목록을 가져오고 있습니다.</p>
  </div>`;

const renderError = ({ message, detail }) => `
  <div class="state state--error" role="alert">
    <p class="state__title">프로젝트를 불러올 수 없습니다.</p>
    <p class="state__detail">${escapeHtml(message)}${detail ? `<br>${escapeHtml(detail)}` : ''}</p>
    <button class="btn btn--primary btn--small js-retry" type="button">다시 시도</button>
  </div>`;

const renderEmpty = (text) => `
  <div class="state">
    <p class="state__title">${escapeHtml(text)}</p>
  </div>`;

// 언어별 개수 → 필터 버튼
const renderFilters = ({ status, repos, filter }) => {
  if (status !== 'success' || repos.length === 0) {
    filtersEl.hidden = true;
    return;
  }

  const counts = repos.reduce((acc, { language }) => ({ ...acc, [language]: (acc[language] ?? 0) + 1 }), {});
  const languages = [ALL, ...Object.keys(counts).sort()];

  filtersEl.innerHTML = languages
    .map((lang) => {
      const count = lang === ALL ? repos.length : counts[lang];
      const isActive = lang === filter;
      return `<button class="filter-btn${isActive ? ' active' : ''}" type="button"
                data-filter="${escapeHtml(lang)}" aria-pressed="${isActive}">
                ${escapeHtml(lang)}<span class="filter-btn__count">${count}</span>
              </button>`;
    })
    .join('');
  filtersEl.hidden = false;
};

const renderProjects = (state) => {
  const { status, repos, filter, error } = state;
  projectsEl.setAttribute('aria-busy', String(status === 'loading'));
  renderFilters(state);

  if (status === 'loading') {
    projectsEl.innerHTML = renderLoading();
    return;
  }
  if (status === 'error') {
    projectsEl.innerHTML = renderError(error);
    return;
  }
  if (status === 'success') {
    if (repos.length === 0) {
      projectsEl.innerHTML = renderEmpty('표시할 프로젝트가 없습니다.');
      return;
    }
    const visible = filter === ALL ? repos : repos.filter(({ language }) => language === filter);
    projectsEl.innerHTML =
      visible.length === 0
        ? renderEmpty(`${filter} 언어의 프로젝트가 없습니다.`)
        : `<div class="projects__grid">${visible.map(projectCardTemplate).join('')}</div>`;
  }
};

const projectsStore = createStore({ status: 'idle', repos: [], filter: ALL, error: null }, renderProjects);

const loadProjects = async (options) => {
  projectsStore.set({ status: 'loading', error: null });
  try {
    const repos = await fetchRepos(options);
    projectsStore.set({ status: 'success', repos, filter: ALL });
  } catch (error) {
    projectsStore.set({ status: 'error', error: { message: error.message, detail: error.detail } });
  }
};

// 재시도 버튼은 렌더링 때마다 새로 생기므로 부모에 이벤트 위임
projectsEl.addEventListener('click', (event) => {
  if (event.target.closest('.js-retry')) loadProjects({ useCache: false });
});

filtersEl.addEventListener('click', (event) => {
  const button = event.target.closest('.filter-btn');
  if (!button) return;
  projectsStore.set({ filter: button.dataset.filter });
});

loadProjects();

/* =========================================================================
 * 9. Contact 폼 유효성 검사
 *    (input → values/errors 상태 → 에러 메시지·테두리 색 표시/숨김)
 *    (submit → preventDefault → 전체 검증 → 성공/실패 메시지)
 * ========================================================================= */
const form = $('#contact-form');
const submitBtn = $('button[type="submit"]', form);
const statusEl = $('.form-status', form);
const messageCount = $('#message-count');
const FIELDS = ['name', 'email', 'message'];
const MESSAGE_MAX = Number($('#message').getAttribute('maxlength'));
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// 필드별 검증 규칙: 통과하면 '' , 실패하면 에러 메시지
const validators = {
  name: (value) => {
    if (!value) return '이름을 입력해 주세요.';
    if (value.length < 2) return '이름은 2자 이상 입력해 주세요.';
    return '';
  },
  email: (value) => {
    if (!value) return '이메일을 입력해 주세요.';
    if (!EMAIL_PATTERN.test(value)) return '올바른 이메일 형식이 아닙니다. (예: you@example.com)';
    return '';
  },
  message: (value) => {
    if (!value) return '메시지를 입력해 주세요.';
    if (value.length < 10) return `메시지는 10자 이상 입력해 주세요. (현재 ${value.length}자)`;
    return '';
  },
};

const validate = (values) =>
  Object.fromEntries(FIELDS.map((field) => [field, validators[field](values[field].trim())]));

const initialFormState = () => ({
  values: { name: '', email: '', message: '' },
  errors: { name: '', email: '', message: '' },
  touched: { name: false, email: false, message: false }, // 사용자가 건드린 필드만 에러 표시
  status: 'idle', // idle | submitting | success | error
});

const renderForm = ({ values, errors, touched, status }) => {
  FIELDS.forEach((field) => {
    const input = form.elements[field];
    const wrapper = input.closest('.field');
    const errorEl = $(`#${field}-error`);
    const showError = touched[field] && Boolean(errors[field]);

    if (input.value !== values[field]) input.value = values[field];
    errorEl.textContent = showError ? errors[field] : '';
    wrapper.classList.toggle('is-invalid', showError);
    wrapper.classList.toggle('is-valid', touched[field] && !errors[field]);
    input.setAttribute('aria-invalid', String(showError));
  });

  messageCount.textContent = `${values.message.length} / ${MESSAGE_MAX}`;

  const isSubmitting = status === 'submitting';
  submitBtn.disabled = isSubmitting;
  $('.btn__label', submitBtn).textContent = isSubmitting ? '전송 중...' : 'Send';

  statusEl.classList.remove('is-success', 'is-error');
  if (status === 'success') {
    statusEl.textContent = '메시지가 성공적으로 전송되었습니다. 감사합니다! 🎉';
    statusEl.classList.add('is-success');
    statusEl.hidden = false;
  } else if (status === 'error') {
    statusEl.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    statusEl.classList.add('is-error');
    statusEl.hidden = false;
  } else {
    statusEl.hidden = true;
  }
};

const formStore = createStore(initialFormState(), renderForm);

// input: 한 글자 입력할 때마다 값·에러 상태 갱신
form.addEventListener('input', ({ target }) => {
  const { name, value } = target;
  if (!FIELDS.includes(name)) return;
  formStore.set((prev) => {
    const values = { ...prev.values, [name]: value };
    return { values, errors: validate(values), status: prev.status === 'success' ? 'idle' : prev.status };
  });
});

// focusout: 필드를 한 번 벗어나면 그때부터 에러 표시 (입력 도중 빨간 글씨로 방해하지 않기)
form.addEventListener('focusout', ({ target }) => {
  const { name } = target;
  if (!FIELDS.includes(name) || !formStore.get().values[name]) return;
  formStore.set((prev) => ({ touched: { ...prev.touched, [name]: true } }));
});

// 실제 전송: CONFIG.formEndpoint(Formspree) 가 있으면 전송, 없으면 시뮬레이션
const sendMessage = async (values) => {
  const { formEndpoint } = CONFIG;
  if (!formEndpoint) {
    await new Promise((resolve) => window.setTimeout(resolve, 800));
    return;
  }
  const response = await fetch(formEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(values),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
};

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // 페이지 새로고침(기본 제출) 방지

  const { values, status } = formStore.get();
  if (status === 'submitting') return;

  const errors = validate(values);
  const allTouched = Object.fromEntries(FIELDS.map((field) => [field, true]));
  formStore.set({ errors, touched: allTouched });

  const firstInvalid = FIELDS.find((field) => errors[field]);
  if (firstInvalid) {
    form.elements[firstInvalid].focus();
    return;
  }

  formStore.set({ status: 'submitting' });
  try {
    const trimmed = Object.fromEntries(FIELDS.map((field) => [field, values[field].trim()]));
    await sendMessage(trimmed);
    formStore.set({ ...initialFormState(), status: 'success' });
  } catch {
    formStore.set({ status: 'error' });
  }
});

/* =========================================================================
 * 10. Footer 연도
 * ========================================================================= */
$('.js-year').textContent = new Date().getFullYear();
