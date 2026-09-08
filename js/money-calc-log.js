/* ============================================================
   돈공부 도구 - 계산 기록 남기기 (money-calc-log.js)

   [이 파일이 하는 일]
     로그인한 사용자가 예금·적금·복리·대출·투자수익률을 계산하면
     "무엇을 얼마로 계산했는지" 를 기록해 둡니다.
     예) 예금 1,000만원 · 연 3.5% · 12개월
     → 여러 상품을 계산해 두고 나중에 홈에서 비교해 볼 수 있습니다.

   [기존 코드를 건드리지 않는 이유]
     계산 호출부가 각 HTML 안에 인라인으로 있습니다.
     그래서 페이지를 고치는 대신 전역 계산 함수를 감싸서
     계산이 끝난 직후에만 기록을 남기고, 결과는 그대로 반환합니다.
     → 비로그인 사용자는 서버 호출이 없고 동작도 완전히 같습니다.

   의존성: calculators.js, cg-auth.js, cg-tools-recent.js
   ============================================================ */

(function () {
  'use strict';

  function ready() {
    return !!(window.CGToolsRecent && window.CGAuth && window.CGAuth.isLoggedIn());
  }

  function won(n) {
    n = Number(n);
    if (!isFinite(n) || n === 0) return '0원';
    if (n >= 100000000) return (Math.round(n / 10000000) / 10) + '억원';
    if (n >= 10000) return Math.round(n / 10000).toLocaleString('ko-KR') + '만원';
    return Math.round(n).toLocaleString('ko-KR') + '원';
  }

  function pct(n) {
    n = Number(n);
    return isFinite(n) ? ('연 ' + n + '%') : '';
  }

  // 이 계산기들은 인자를 객체 하나로 받습니다
  var SPECS = {
    calculateDeposit: {
      id: 'deposit',
      title: function (o) {
        return '예금 · ' + won(o.principal) + ' · ' + pct(o.annualRatePercent) + ' · ' + (o.months || 0) + '개월';
      }
    },
    calculateSavings: {
      id: 'savings',
      title: function (o) {
        return '적금 · 월 ' + won(o.monthlyAmount) + ' · ' + pct(o.annualRatePercent) + ' · ' + (o.months || 0) + '개월';
      }
    },
    calculateCompound: {
      id: 'compound',
      title: function (o) {
        return '복리 · ' + won(o.initialPrincipal) +
               (o.monthlyAddition ? ' + 월 ' + won(o.monthlyAddition) : '') +
               ' · ' + pct(o.annualRatePercent) + ' · ' + (o.years || 0) + '년';
      }
    },
    calculateLoan: {
      id: 'loan',
      title: function (o) {
        return '대출이자 · ' + won(o.principal) + ' · ' + pct(o.annualRatePercent) + ' · ' + (o.months || 0) + '개월';
      }
    },
    calculateInvestmentReturn: {
      id: 'return',
      title: function (o) {
        var buy = o.buyPrice != null ? o.buyPrice : o.principal;
        return '투자수익률 · 매수 ' + won(buy);
      }
    }
  };

  function wrapAll() {
    if (window.__cgMoneyCalcLogged) return;
    window.__cgMoneyCalcLogged = true;

    Object.keys(SPECS).forEach(function (name) {
      var orig = window[name];
      if (typeof orig !== 'function') return;
      var spec = SPECS[name];

      window[name] = function (opts) {
        var out = orig.apply(this, arguments);     // 계산은 원래 함수가 그대로 합니다
        try {
          if (ready()) {
            var input = (opts && typeof opts === 'object') ? opts : { arg: opts };
            window.CGToolsRecent.saveCalc({
              id: spec.id,
              title: spec.title(input || {}),
              url: spec.id + '.html',
              meta: { input: input, result: out }
            });
          }
        } catch (e) {
          try { console.warn('[계산 기록] 저장 실패', e && (e.message || e)); } catch (_) {}
        }
        return out;
      };
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wrapAll, { once: true });
  else wrapAll();
})();
