/**
 * 돈공부 도구 (money.chatgpts.kr) - 금융 계산 엔진
 */

/**
 * 1. 예금 계산기 (정기예금)
 */
function calculateDeposit({ principal, annualRatePercent, months, taxType = 'normal', compoundType = 'simple' }) {
  const r = annualRatePercent / 100;
  const taxRate = MONEY_CONFIG.TAX_RATES[taxType] !== undefined ? MONEY_CONFIG.TAX_RATES[taxType] : 0.154;

  let interestGross = 0;

  if (compoundType === 'compound') {
    // 월복리
    const totalAmount = principal * Math.pow(1 + (r / 12), months);
    interestGross = totalAmount - principal;
  } else {
    // 단리
    interestGross = principal * r * (months / 12);
  }

  interestGross = Math.floor(interestGross);
  const tax = Math.floor(interestGross * taxRate);
  const interestNet = interestGross - tax;
  const totalPayout = principal + interestNet;

  return {
    principal,
    annualRatePercent,
    months,
    taxType,
    compoundType,
    interestGross,
    tax,
    taxRate,
    interestNet,
    totalPayout
  };
}

/**
 * 2. 적금 계산기 (정기적금 - 월초불입 기준)
 */
function calculateSavings({ monthlyAmount, annualRatePercent, months, taxType = 'normal', compoundType = 'simple' }) {
  const r = annualRatePercent / 100;
  const taxRate = MONEY_CONFIG.TAX_RATES[taxType] !== undefined ? MONEY_CONFIG.TAX_RATES[taxType] : 0.154;
  const totalPrincipal = monthlyAmount * months;

  let interestGross = 0;

  if (compoundType === 'compound') {
    // 월복리: 매월 불입금이 (months - i)개월 동안 월복리 운용
    for (let i = 0; i < months; i++) {
      const remainingMonths = months - i;
      const futureVal = monthlyAmount * Math.pow(1 + (r / 12), remainingMonths);
      interestGross += (futureVal - monthlyAmount);
    }
  } else {
    // 단리: 공식 monthlyAmount * (r / 12) * (months * (months + 1) / 2)
    interestGross = monthlyAmount * (r / 12) * ((months * (months + 1)) / 2);
  }

  interestGross = Math.floor(interestGross);
  const tax = Math.floor(interestGross * taxRate);
  const interestNet = interestGross - tax;
  const totalPayout = totalPrincipal + interestNet;

  return {
    monthlyAmount,
    totalPrincipal,
    annualRatePercent,
    months,
    taxType,
    compoundType,
    interestGross,
    tax,
    taxRate,
    interestNet,
    totalPayout
  };
}

/**
 * 3. 복리 계산기 (스노우볼/장기투자)
 */
function calculateCompound({ initialPrincipal, monthlyAddition = 0, annualRatePercent, years }) {
  const r = annualRatePercent / 100;
  const monthlyRate = r / 12;
  const totalMonths = years * 12;

  let currentPrincipal = initialPrincipal;
  let totalBalance = initialPrincipal;
  const schedule = []; // 연도별 데이터

  let yearlyPrincipal = initialPrincipal;
  let yearlyInterestAccum = 0;

  for (let m = 1; m <= totalMonths; m++) {
    // 월초 불입액 추가
    if (monthlyAddition > 0) {
      totalBalance += monthlyAddition;
      yearlyPrincipal += monthlyAddition;
    }

    // 한 달 이자 발생
    const monthlyInterest = totalBalance * monthlyRate;
    totalBalance += monthlyInterest;
    yearlyInterestAccum += monthlyInterest;

    // 연도 마감 기록
    if (m % 12 === 0) {
      const yearIndex = m / 12;
      const totalAccumulatedPrincipal = initialPrincipal + (monthlyAddition * m);
      const totalAccumulatedInterest = totalBalance - totalAccumulatedPrincipal;
      schedule.push({
        year: yearIndex,
        totalPrincipal: Math.round(totalAccumulatedPrincipal),
        totalInterest: Math.round(totalAccumulatedInterest),
        totalBalance: Math.round(totalBalance)
      });
    }
  }

  const finalPrincipal = initialPrincipal + (monthlyAddition * totalMonths);
  const finalInterest = totalBalance - finalPrincipal;
  const ruleOf72Years = r > 0 ? (72 / annualRatePercent).toFixed(1) : 0;

  return {
    initialPrincipal,
    monthlyAddition,
    annualRatePercent,
    years,
    totalPrincipal: Math.round(finalPrincipal),
    totalInterest: Math.round(finalInterest),
    finalBalance: Math.round(totalBalance),
    returnRate: finalPrincipal > 0 ? ((finalInterest / finalPrincipal) * 100) : 0,
    ruleOf72Years,
    schedule
  };
}

/**
 * 4. 대출 이자 계산기 (상환 스케줄 포함)
 */
function calculateLoan({ principal, annualRatePercent, months, gracePeriodMonths = 0, repaymentType = 'level' }) {
  const r = (annualRatePercent / 100) / 12; // 월이자율
  const repaymentMonths = months - gracePeriodMonths;
  let remainingPrincipal = principal;
  const schedule = [];

  let totalInterest = 0;
  let totalPayment = 0;

  // 1) 거치 기간 동안 이자만 납부
  for (let m = 1; m <= gracePeriodMonths; m++) {
    const interest = Math.round(remainingPrincipal * r);
    totalInterest += interest;
    totalPayment += interest;
    schedule.push({
      month: m,
      isGrace: true,
      payment: interest,
      principalPaid: 0,
      interestPaid: interest,
      remainingPrincipal: Math.round(remainingPrincipal)
    });
  }

  // 2) 분할 상환 기간
  if (repaymentType === 'level') {
    // 원리금 균등 분할 상환
    let monthlyFixedPayment = 0;
    if (r > 0) {
      monthlyFixedPayment = Math.round(
        principal * (r * Math.pow(1 + r, repaymentMonths)) / (Math.pow(1 + r, repaymentMonths) - 1)
      );
    } else {
      monthlyFixedPayment = Math.round(principal / repaymentMonths);
    }

    for (let m = 1; m <= repaymentMonths; m++) {
      const monthNumber = gracePeriodMonths + m;
      const interest = Math.round(remainingPrincipal * r);
      let principalPaid = monthlyFixedPayment - interest;

      // 마지막 달 보정
      if (m === repaymentMonths || remainingPrincipal - principalPaid < 0) {
        principalPaid = remainingPrincipal;
      }
      remainingPrincipal -= principalPaid;
      const payment = principalPaid + interest;

      totalInterest += interest;
      totalPayment += payment;

      schedule.push({
        month: monthNumber,
        isGrace: false,
        payment,
        principalPaid,
        interestPaid: interest,
        remainingPrincipal: Math.max(0, Math.round(remainingPrincipal))
      });
    }
  } else if (repaymentType === 'equal_principal') {
    // 원금 균등 분할 상환
    const monthlyPrincipalFixed = Math.floor(principal / repaymentMonths);
    let principalSumCheck = 0;

    for (let m = 1; m <= repaymentMonths; m++) {
      const monthNumber = gracePeriodMonths + m;
      let principalPaid = monthlyPrincipalFixed;
      if (m === repaymentMonths) {
        principalPaid = principal - principalSumCheck; // 잔여 단수 처리
      }
      principalSumCheck += principalPaid;

      const interest = Math.round(remainingPrincipal * r);
      remainingPrincipal -= principalPaid;
      const payment = principalPaid + interest;

      totalInterest += interest;
      totalPayment += payment;

      schedule.push({
        month: monthNumber,
        isGrace: false,
        payment,
        principalPaid,
        interestPaid: interest,
        remainingPrincipal: Math.max(0, Math.round(remainingPrincipal))
      });
    }
  } else {
    // 만기 일시 상환 (bullet)
    for (let m = 1; m <= repaymentMonths; m++) {
      const monthNumber = gracePeriodMonths + m;
      const interest = Math.round(remainingPrincipal * r);
      let principalPaid = 0;
      if (m === repaymentMonths) {
        principalPaid = principal;
        remainingPrincipal = 0;
      }
      const payment = principalPaid + interest;

      totalInterest += interest;
      totalPayment += payment;

      schedule.push({
        month: monthNumber,
        isGrace: false,
        payment,
        principalPaid,
        interestPaid: interest,
        remainingPrincipal: Math.max(0, Math.round(remainingPrincipal))
      });
    }
  }

  const firstMonthPayment = schedule.length > 0 ? schedule[0].payment : 0;

  return {
    principal,
    annualRatePercent,
    months,
    gracePeriodMonths,
    repaymentType,
    firstMonthPayment,
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    schedule
  };
}

/**
 * 5. 투자 수익률 계산기 (주식/가상자산/부동산)
 */
function calculateInvestmentReturn({
  buyPrice,
  buyQuantity,
  sellPrice,
  feeRateBuyPercent = 0.015,
  feeRateSellPercent = 0.015,
  taxRateSellPercent = 0.18, // 주식 거래세 기본 0.18% (2024~2025 코스피/코스닥)
  dividendAmount = 0
}) {
  const grossBuy = buyPrice * buyQuantity;
  const buyFee = Math.floor(grossBuy * (feeRateBuyPercent / 100));
  const totalBuyCost = grossBuy + buyFee;

  const grossSell = sellPrice * buyQuantity;
  const sellFee = Math.floor(grossSell * (feeRateSellPercent / 100));
  const sellTax = Math.floor(grossSell * (taxRateSellPercent / 100));
  const netSellProceeds = grossSell - sellFee - sellTax;

  // 순손익 = 실매도금액 - 총매수비용 + 배당금
  const netProfit = netSellProceeds - totalBuyCost + dividendAmount;
  const returnRatePercent = totalBuyCost > 0 ? ((netProfit / totalBuyCost) * 100) : 0;

  // 손익분기 매도가격 (Break-even Price)
  // grossSell - sellFee - sellTax = totalBuyCost
  // sellPrice * qty * (1 - (feeRateSell + taxRateSell)/100) = totalBuyCost
  const sellDeductionRatio = 1 - ((feeRateSellPercent + taxRateSellPercent) / 100);
  const breakEvenPrice = (sellDeductionRatio > 0 && buyQuantity > 0)
    ? Math.ceil(totalBuyCost / (buyQuantity * sellDeductionRatio))
    : buyPrice;

  return {
    grossBuy: Math.round(grossBuy),
    buyFee: Math.round(buyFee),
    totalBuyCost: Math.round(totalBuyCost),
    grossSell: Math.round(grossSell),
    sellFee: Math.round(sellFee),
    sellTax: Math.round(sellTax),
    netSellProceeds: Math.round(netSellProceeds),
    dividendAmount: Math.round(dividendAmount),
    netProfit: Math.round(netProfit),
    returnRatePercent,
    breakEvenPrice: Math.round(breakEvenPrice)
  };
}

// Node.js 환경 테스트 지원
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateDeposit,
    calculateSavings,
    calculateCompound,
    calculateLoan,
    calculateInvestmentReturn
  };
}
