const milestoneFor = (result) => {
  if (!result) return 'initial';
  if ((result.moles?.naohAdded ?? 0) === 0) return 'initial';
  if (result.stage === 'at-equivalence') return 'equivalence';
  if (result.stage === 'after-equivalence') return 'after-equivalence';
  if (result.pH > 3 && result.pH < 7) return 'buffer';
  return 'before-equivalence';
};

const prompts = Object.freeze({
  initial: Object.freeze({ question: 'Dự đoán pH ban đầu và màu phenolphthalein.', expected: 'Axit yếu có pH lớn hơn 1; phenolphthalein không màu.' }),
  'before-equivalence': Object.freeze({ question: 'Bạn dự đoán dung dịch đang ở vùng đệm hay đã tương đương?', expected: 'Trước tương đương, HA và A⁻ cùng tồn tại; pH tăng dần trong vùng đệm.' }),
  buffer: Object.freeze({ question: 'Chất nào đang đệm thay đổi pH khi thêm một giọt NaOH?', expected: 'Cặp HA/A⁻ hấp thụ thay đổi nhỏ của acid/base.' }),
  equivalence: Object.freeze({ question: 'Tại tương đương, chất dư và màu chỉ thị là gì?', expected: 'A⁻ bị thủy phân nên dung dịch có tính bazơ; phenolphthalein bắt đầu vào vùng chuyển màu.' }),
  'after-equivalence': Object.freeze({ question: 'Sau tương đương, yếu tố nào quyết định pH?', expected: 'OH⁻ dư từ NaOH quyết định pH và phenolphthalein hồng bền.' }),
});

export const guidedPromptFor = (result) => {
  const key = milestoneFor(result);
  return Object.freeze({ milestone: key, ...prompts[key] });
};

const expectedColor = (pH) => (pH < 8.2 ? 'clear' : pH < 10 ? 'pink-transition' : 'pink');

export const evaluateGuidedAnswer = (result, answer) => {
  if (!result) return { score: 0, feedback: 'Hãy bắt đầu mô phỏng trước khi trả lời.' };
  const expected = {
    pH: result.pH,
    color: expectedColor(result.pH),
    excess: result.excess?.species ?? 'none',
  };
  const pH = Number(answer.pH);
  const pHCorrect = Number.isFinite(pH) && Math.abs(pH - expected.pH) <= 0.25;
  const colorCorrect = answer.color === expected.color;
  const excessCorrect = answer.excess === expected.excess;
  const correct = [pHCorrect, colorCorrect, excessCorrect].filter(Boolean).length;
  return {
    score: correct,
    total: 3,
    expected,
    feedback: correct === 3
      ? 'Chính xác. Dự đoán khớp với state hóa học hiện tại.'
      : `Đúng ${correct}/3 ý. Hãy đối chiếu pH, màu chỉ thị và chất dư với state hiện tại.`,
  };
};
