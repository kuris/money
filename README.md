# 돈공부 도구 (Money Study Tools) 💰

> 스마트한 재테크와 금융 문해력을 돕는 무료 생활 금융 계산기 및 경제 용어 사전 웹 서비스

- **서비스 도메인**: [https://money.chatgpts.kr](https://money.chatgpts.kr)
- **GitHub 저장소**: [https://github.com/kuris/money.git](https://github.com/kuris/money.git)

---

## 🛠️ 주요 기능

1. **정기예금 계산기 (`/deposit`)**
   - 예치 원금, 기간, 금리에 따른 세후 만기 수령액 계산
   - 단리 및 월복리 옵션
   - 일반과세(15.4%), 세금우대(9.5%), 비과세(0%) 세액 공제

2. **정기적금 계산기 (`/savings`)**
   - 매월 일정 불입금에 대한 회차별 이자 및 총 수령액 계산
   - 일반과세/세금우대/비과세별 실수령액
   - 적금 체감 이자율 해설 가이드

3. **복리 계산기 (`/compound`)**
   - 초기 투자금 + 매월 추가 적립금 스노우볼 시뮬레이션
   - 72의 법칙 (원금이 2배가 되는 햇수)
   - 연도별 자산 성장 시뮬레이션 테이블

4. **대출이자 계산기 (`/loan`)**
   - 원리금 균등 분할 상환, 원금 균등 분할 상환, 만기 일시 상환 방식 비교
   - 거치기간 설정 지원
   - 전 회차별 월 상환액 및 대출 잔액 스케줄표

5. **투자 수익률 계산기 (`/return`)**
   - 주식, 코인, 부동산 투자 실질 순손익 및 수익률(%) 산출
   - 매수/매도 수수료 및 증권거래세, 배당금 공제
   - 본전 매도가격 (손익분기점) 자동 산출

6. **경제·금융 용어 사전 (`/terms`)**
   - DSR, LTV, CAGR, PER, PBR, ISA, 기준금리 등 20여 개 핵심 용어
   - 카테고리 필터 및 실시간 키워드 검색
   - 실전 재테크 꿀팁 및 연관 태그 탐색

---

## 📁 디렉토리 구조

```
money/
├── index.html            # 메인 허브 대시보드
├── deposit.html          # 정기예금 계산기 (/deposit)
├── savings.html          # 정기적금 계산기 (/savings)
├── compound.html         # 복리 계산기 (/compound)
├── loan.html             # 대출이자 계산기 (/loan)
├── return.html           # 투자수익률 계산기 (/return)
├── terms.html            # 경제 용어 사전 (/terms)
├── css/
│   └── style.css         # 에메랄드/네이비 다크모드 하모니 디자인 시스템
├── js/
│   ├── common.js         # 금액 단위 포맷팅, 토스트, 패밀리 드롭다운
│   ├── calculators.js    # 예금, 적금, 복리, 대출, 투자 손익 공식 엔진
│   ├── terms-data.js     # 경제 용어 데이터베이스 및 검색 로직
│   ├── supabase-config.js# Supabase 공통 설정
│   └── track.js          # 방문 및 체류 시간 집계 트래킹
├── ads.txt               # Google AdSense 인증 파일
├── robots.txt            # 검색엔진 크롤링 규칙
├── sitemap.xml           # SEO 사이트맵
├── vercel.json           # Vercel 배포 및 Clean URL 라우팅 설정
└── README.md             # 프로젝트 안내 문서
```

---

## 🎨 기술 스택 & 인프라

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS (반응형 모바일 최적화)
- **Monetization & Analytics**:
  - Google AdSense Auto Ads (`ca-pub-3321070604000141`)
  - Vercel Web Analytics
  - Supabase PV/UV 트래커 (`data-service="money"`)
- **Deployment**: Vercel (`cleanUrls: true`)
