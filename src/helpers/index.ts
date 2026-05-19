/**
 * Formatea un número como kilometraje con separadores de miles.
 * @param {number|string} value - El valor del kilometraje.
 * @param {string} locale - El código de localidad (ej: 'es-HN', 'es-MX', 'en-US').
 * @returns {string} - El kilometraje formateado (ej: "2,135,641 KM").
 */
export function formatearKilometraje(value: number, locale: string = 'es-HN'): string {
  const number = parseFloat(value.toString());

  // Si no es un número válido, devolvemos un string vacío o un guion
  if (isNaN(number)) return '-- KM';

  const formattedNumber = new Intl.NumberFormat(locale).format(number);

  return `${formattedNumber} KM`;
};