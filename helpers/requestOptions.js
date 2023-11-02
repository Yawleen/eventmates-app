export const requestOptions = (method, token, data) => ({
  method: method,
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
  ...(data && {
    body: JSON.stringify(data),
  }),
});
