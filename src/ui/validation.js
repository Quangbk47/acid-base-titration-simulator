import { celsiusToKelvin, mlToL } from '../chemistry/index.js';

export const TITRATION_SYSTEMS = Object.freeze({
  'strong-acid-strong-base': Object.freeze({
    analyte: 'HCl',
    titrant: 'NaOH',
    solver: 'strong-strong',
  }),
});

const REQUIRED_FIELDS = Object.freeze([
  ['analyteConcentrationM', 'Nhập nồng độ chất phân tích.'],
  ['analyteVolumeMl', 'Nhập thể tích ban đầu.'],
  ['titrantConcentrationM', 'Nhập nồng độ dung dịch chuẩn.'],
  ['addedVolumeMl', 'Nhập thể tích dung dịch chuẩn đã thêm.'],
]);

const parseNumber = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export function validateTitrationForm(values = {}) {
  const errors = {};
  const system = TITRATION_SYSTEMS[values.systemType];
  if (!values.systemType) errors.systemType = 'Chọn loại chuẩn độ.';
  else if (!system) errors.systemType = 'Loại chuẩn độ này chưa được chemistry engine hỗ trợ.';

  const parsed = {};
  for (const [field, requiredMessage] of REQUIRED_FIELDS) {
    if (values[field] === '' || values[field] === undefined || values[field] === null) {
      errors[field] = requiredMessage;
      continue;
    }
    parsed[field] = parseNumber(values[field]);
    if (parsed[field] === null) errors[field] = 'Giá trị phải là một số hữu hạn.';
  }

  for (const field of ['analyteConcentrationM', 'analyteVolumeMl', 'titrantConcentrationM']) {
    if (parsed[field] !== undefined && parsed[field] !== null && parsed[field] <= 0) {
      errors[field] = 'Giá trị phải lớn hơn 0.';
    }
  }
  if (parsed.addedVolumeMl !== undefined && parsed.addedVolumeMl !== null && parsed.addedVolumeMl < 0) {
    errors.addedVolumeMl = 'Thể tích đã thêm không được âm; 0 mL là trạng thái ban đầu.';
  }

  if (values.systemType === 'weak-acid-strong-base') {
    const ka = parseNumber(values.Ka);
    if (values.Ka === '' || values.Ka === undefined || values.Ka === null) errors.Ka = 'Hệ axit yếu cần Ka.';
    else if (ka === null) errors.Ka = 'Ka phải là một số hữu hạn.';
    else if (!(ka > 0 && ka < 1)) errors.Ka = 'Ka phải thỏa mãn 0 < Ka < 1.';
  }
  if (values.systemType === 'strong-acid-weak-base') {
    const kb = parseNumber(values.Kb);
    if (values.Kb === '' || values.Kb === undefined || values.Kb === null) errors.Kb = 'Hệ bazơ yếu cần Kb.';
    else if (kb === null) errors.Kb = 'Kb phải là một số hữu hạn.';
    else if (!(kb > 0 && kb < 1)) errors.Kb = 'Kb phải thỏa mãn 0 < Kb < 1.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      systemType: values.systemType,
      analyte: system.analyte,
      titrant: system.titrant,
      solver: system.solver,
      analyteConcentrationM: parsed.analyteConcentrationM,
      analyteVolumeMl: parsed.analyteVolumeMl,
      titrantConcentrationM: parsed.titrantConcentrationM,
      addedVolumeMl: parsed.addedVolumeMl,
    },
  };
}

export function toChemistryInput(value) {
  return Object.freeze({
    Ca: value.analyteConcentrationM,
    Va: mlToL(value.analyteVolumeMl),
    Cb: value.titrantConcentrationM,
    Vb: mlToL(value.addedVolumeMl),
    temperature: celsiusToKelvin(25),
  });
}
