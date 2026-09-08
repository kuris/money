/**
 * 돈공부 도구 (money.chatgpts.kr) - 공통 유틸리티
 */

const MONEY_CONFIG = {
  TAX_RATES: {
    normal: 0.154,      // 일반 과세 15.4% (이자소득세 14% + 지방소득세 1.4%)
    preferential: 0.095, // 세금우대 / 농특세 등 9.5%
    taxFree: 0.0        // 비과세 0%
  }
};

/**
 * 천단위 콤마 포맷팅
 */
function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return Math.round(value).toLocaleString('ko-KR');
}

/**
 * 소수점 유지 포맷팅
 */
function formatFloat(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return Number(value).toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

/**
 * 콤마 제거 후 숫자로 변환
 */
function parseNumber(value) {
  if (!value) return 0;
  const cleaned = String(value).replace(/,/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * 한국어 금액 단위 표기 (억, 만원)
 */
function formatKoreanCurrency(amount) {
  if (!amount || amount === 0) return '0원';
  const isNegative = amount < 0;
  let val = Math.abs(Math.round(amount));

  const eok = Math.floor(val / 100000000);
  val %= 100000000;
  const man = Math.floor(val / 10000);
  const remainder = val % 10000;

  let parts = [];
  if (eok > 0) parts.push(`${formatNumber(eok)}억`);
  if (man > 0) parts.push(`${formatNumber(man)}만`);
  if (remainder > 0 && eok === 0 && man === 0) parts.push(`${formatNumber(remainder)}`);

  let res = parts.join(' ') + '원';
  return isNegative ? `-${res}` : res;
}

/**
 * 입력창 실시간 콤마 및 한글 표기 연동
 */
function attachNumberInputFormatter(inputElement, helperElement = null) {
  if (!inputElement) return;

  const updateHelper = () => {
    const rawVal = parseNumber(inputElement.value);
    if (helperElement) {
      if (rawVal > 0) {
        helperElement.textContent = formatKoreanCurrency(rawVal);
        helperElement.style.display = 'block';
      } else {
        helperElement.textContent = '';
        helperElement.style.display = 'none';
      }
    }
  };

  inputElement.addEventListener('input', (e) => {
    const cursor = inputElement.selectionStart;
    const oldLength = inputElement.value.length;
    const raw = inputElement.value.replace(/[^0-9]/g, '');

    if (!raw) {
      inputElement.value = '';
    } else {
      inputElement.value = parseInt(raw, 10).toLocaleString('ko-KR');
    }

    const newLength = inputElement.value.length;
    const newCursor = Math.max(0, (cursor || 0) + (newLength - oldLength));
    inputElement.setSelectionRange(newCursor, newCursor);

    updateHelper();
  });

  // 초기 로드 시 헬퍼 반영
  if (inputElement.value) {
    updateHelper();
  }
}

/**
 * 토스트 메시지
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    }, 300);
  }, 2200);
}

/**
 * 링크 복사
 */
function copyCurrentUrl() {
  const url = window.location.href;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('주소가 클립보드에 복사되었습니다!', 'success');
    }).catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  const temp = document.createElement('textarea');
  temp.value = text;
  temp.style.position = 'fixed';
  temp.style.opacity = '0';
  document.body.appendChild(temp);
  temp.select();
  try {
    document.execCommand('copy');
    showToast('주소가 클립보드에 복사되었습니다!', 'success');
  } catch (e) {
    showToast('복사에 실패했습니다. 주소창의 링크를 복사해주세요.', 'error');
  }
  document.body.removeChild(temp);
}

/**
 * 패밀리 사이트 드롭다운 초기화
 */
function initFamilyDropdown() {
  const btn = document.getElementById('family-toggle-btn');
  const menu = document.getElementById('family-dropdown-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = menu.classList.toggle('active');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initFamilyDropdown();

  // 공유 버튼이 있다면 이벤트 바인딩
  const shareBtn = document.getElementById('btn-share-page');
  if (shareBtn) {
    shareBtn.addEventListener('click', copyCurrentUrl);
  }
});
