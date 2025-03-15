const { NOTIFICATION_IPS } = require('./constants');

/**
 * Parametre değerini doğrular
 * @param {*} value Değer
 * @param {string} paramName Parametre adı
 * @param {boolean} isRequired Zorunlu mu?
 * @throws {Error} Geçersiz parametre hatası
 */
function validateParam(value, paramName, isRequired = true) {
  if (isRequired && (value === undefined || value === null || value === '')) {
    throw new Error(`${paramName} is required`);
  }
}

/**
 * URL'ye sorgu parametreleri ekler
 * @param {string} url Temel URL
 * @param {Object} params Parametreler
 * @returns {string} Parametreli URL
 */
function appendQueryParams(url, params) {
  const urlObj = new URL(url);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      urlObj.searchParams.append(key, value);
    }
  });
  
  return urlObj.toString();
}

/**
 * IP adresinin bildirim için geçerli olup olmadığını kontrol eder
 * @param {string} ip IP adresi
 * @returns {boolean} Geçerli mi?
 */
function isValidNotificationIP(ip) {
  return NOTIFICATION_IPS.includes(ip);
}

/**
 * Nesneyi sorgu dizesine dönüştürür
 * @param {Object} obj Nesne
 * @returns {string} Sorgu dizesi
 */
function objectToQueryString(obj) {
  return Object.entries(obj)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

/**
 * Ödeme formu HTML'i oluşturur
 * @param {Object} formData Form verileri
 * @returns {string} HTML formu
 */
function generatePaymentFormHTML(formData) {
  const formFields = Object.entries(formData)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
    .join('\n');

  return `
<form action="https://anypay.io/merchant" accept-charset="utf-8" method="post">
${formFields}
<input type="submit" value="Öde">
</form>
`;
}

module.exports = {
  validateParam,
  appendQueryParams,
  isValidNotificationIP,
  objectToQueryString,
  generatePaymentFormHTML
};
