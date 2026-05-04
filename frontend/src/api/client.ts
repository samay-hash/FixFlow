import api from './axios';

const normalizeIds = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(normalizeIds);
  if (value && typeof value === 'object') {
    const input = value as Record<string, unknown>;
    const output: Record<string, unknown> = {};
    for (const key of Object.keys(input)) {
      if (key === '_id') {
        output.id = String(input[key]);
        output._id = String(input[key]);
      } else {
        output[key] = normalizeIds(input[key]);
      }
    }
    return output;
  }
  return value;
};

api.interceptors.response.use((response) => {
  response.data = normalizeIds(response.data);
  return response;
});

export default api;
