const ABSOLUTE_ZERO_K = 0;
const CELSIUS_INPUT_THRESHOLD = 200;

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

export const normalizeTemperatureK = (temperature) => {
  if (!isFiniteNumber(temperature) || temperature <= ABSOLUTE_ZERO_K) return null;
  // Public cases may use the convenient 25 °C notation; values >= 200 are K.
  return temperature < CELSIUS_INPUT_THRESHOLD ? temperature + 273.15 : temperature;
};

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
  if (Va <= 0) fields.Va = 'Va phải lớn hơn 0 mL.';
  if (Cb <= 0) fields.Cb = 'Cb phải lớn hơn 0 M.';
  // Zero is valid only for the initial titration state; negative volume is not.
  if (Vb < 0) fields.Vb = 'Vb không được âm; 0 mL là trạng thái ban đầu.';
  if (temperature <= ABSOLUTE_ZERO_K) {
    fields.temperature = 'temperature phải lớn hơn 0 K hoặc lớn hơn -273.15 °C.';
  }
  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      error: createInputError('OUT_OF_RANGE', 'Input nằm ngoài miền hợp lệ.', fields),
    };
  }

  const temperatureK = normalizeTemperatureK(temperature);
  if (!isFiniteNumber(temperatureK)) {
    return {
      ok: false,
      error: createInputError('INVALID_TEMPERATURE', 'temperature không hợp lệ.', {
        temperature: 'Không thể chuẩn hóa nhiệt độ.',
      }),
    };
  }

  const VaL = mlToL(Va);
  const VbL = mlToL(Vb);
  const totalVolumeL = VaL + VbL;
  if (!(totalVolumeL > 0) || !isFiniteNumber(totalVolumeL)) {
    return {
      ok: false,
      error: createInputError('ZERO_TOTAL_VOLUME', 'Tổng thể tích phải lớn hơn 0.', {}),
    };
  }

  return {
    ok: true,
    value: { Ca, Va, VaL, Cb, Vb, VbL, temperature, temperatureK, totalVolumeL },
  };
};
