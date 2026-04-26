const excelSerialToMonthLabel = (value) => {
  if (value === null || value === undefined || value === '') return null;

  const num = typeof value === 'number' ? value : parseFloat(value);

  if (!isNaN(num) && num > 40000 && num < 60000) {
    const date = new Date(Math.round((num - 25569) * 86400 * 1000));
    const month = date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
    const year  = String(date.getUTCFullYear()).slice(-2);
    return `${month}-${year}`;
  }

  const str = String(value).trim();
  const match = str.match(/^([a-z]{3})[a-z]*[-\s]*(\d{2,4})$/i);
  if (match) {
    const mon  = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    const yr   = match[2].length === 4 ? match[2].slice(-2) : match[2];
    return `${mon}-${yr}`;
  }

  return str;
};

module.exports = { excelSerialToMonthLabel };