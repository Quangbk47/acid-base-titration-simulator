const ABSOLUTE_ZERO_K = 0;
const SUPPORTED_TEMPERATURE_TOLERANCE_K = 1e-9;

export const STANDARD_TEMPERATURE_C = 25;
export const STANDARD_TEMPERATURE_K = 298.15;
export const STANDARD_KW = 1e-14;

export class ChemistryInputError extends Error {
  constructor(code, message, fields = {}) {
    super(message);
    this.name = 'ChemistryInputError';
    this.code = code;
    this.fields = fields;
  }
}

export const isFiniteNumber = (value) =>
  typeof value === 'number' && Number.isFinite(value);

export const createInputError = (code, message, fields = {}) => ({
  code,
  message,
  fields,
});

export const mlToL = (millilitres) => {
  if (!isFiniteNumber(millilitres)) return null;
  return millilitres / 1000;
};

export const lToMl = (litres) => {
  if (!isFiniteNumber(litres)) return null;
  return litres * 1000;
};

export const celsiusToKelvin = (temperatureC) => {
  if (!isFiniteNumber(temperatureC) || temperatureC <= -273.15) return null;
  return temperatureC + 273.15;
};

export const isSupportedTemperatureK = (temperatureK) =>
  isFiniteNumber(temperatureK) &&
  Math.abs(temperatureK - STANDARD_TEMPERATURE_K) <= SUPPORTED_TEMPERATURE_TOLERANCE_K;

export const validateStrongStrongInput = (input) => {
  if (!input || typeof input !== 'object') {
    return {
      ok: false,
      error: createInputError('INVALID_INPUT', 'Input phải là một object.', {}),
    };
  }

  const { Ca, Va, Cb, Vb, temperature } = input;
  const fields = {};
  for (const [name, value] of Object.entries({ Ca, Va, Cb, Vb, temperature })) {
    if (!isFiniteNumber(value)) fields[name] = `${name} phải là số hữu hạn.`;
  }
  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      error: createInputError('NON_FINITE_INPUT', 'Input chứa giá trị không hữu hạn.', fields),
    };
  }
  if (Ca <= 0) fields.Ca = 'Ca phải lớn hơn 0 M.';
  if (Va <= 0) fields.Va = 'Va phải lớn hơn 0 L.';
  if (Cb <= 0) fields.Cb = 'Cb phải lớn hơn 0 M.';
  // Zero is valid only for the initial titration state; negative volume is not.
  if (Vb < 0) fields.Vb = 'Vb không được âm; 0 L là trạng thái ban đầu.';
  if (temperature <= ABSOLUTE_ZERO_K) {
    fields.temperature = 'temperature phải lớn hơn 0 K.';
  } else if (!isSupportedTemperatureK(temperature)) {
    fields.temperature = `Phase 1 chỉ hỗ trợ ${STANDARD_TEMPERATURE_K} K (25 °C).`;
  }
  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      error: createInputError('OUT_OF_RANGE', 'Input nằm ngoài miền hợp lệ.', fields),
    };
  }

  const totalVolumeL = Va + Vb;
  if (!(totalVolumeL > 0) || !isFiniteNumber(totalVolumeL)) {
    return {
      ok: false,
      error: createInputError('ZERO_TOTAL_VOLUME', 'Tổng thể tích phải lớn hơn 0.', {}),
    };
  }

  return {
    ok: true,
    value: { Ca, VaL: Va, Cb, VbL: Vb, temperatureK: temperature, totalVolumeL },
  };
};
