export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return {
    dia: d.getDate(),
    mes: meses[d.getMonth()],
    anio: d.getFullYear(),
    label: `${d.getDate()} de ${meses[d.getMonth()]} ${d.getFullYear()}`
  };
}

export function calcularNoches(entrada, salida) {
  const e = new Date(entrada + 'T12:00:00');
  const s = new Date(salida + 'T12:00:00');
  return Math.max(0, Math.round((s - e) / (1000 * 60 * 60 * 24)));
}

export function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function classNames(...args) {
  return args.filter(Boolean).join(' ');
}
