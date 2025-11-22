// -------------------- Helpers ---------------------

export const uid = () => Math.random().toString(36).slice(2, 9);

export const nameOf = (patients, id) =>
  patients.find((p) => p.id === id)?.name || "Bệnh nhân";
