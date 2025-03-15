const crypto = require('crypto');

/**
 * MD5 imzası oluşturur
 * @param {Array} params İmzalanacak parametreler
 * @returns {string} MD5 imzası
 */
function createMD5Sign(params) {
  return crypto.createHash('md5').update(params.join(':')).digest('hex');
}

/**
 * SHA256 imzası oluşturur
 * @param {Array} params İmzalanacak parametreler
 * @returns {string} SHA256 imzası
 */
function createSHA256Sign(params) {
  return crypto.createHash('sha256').update(params.join(':')).digest('hex');
}

/**
 * Ödeme formu imzası oluşturur (SHA256)
 * @param {Object} params Ödeme parametreleri
 * @param {string} secretKey Gizli anahtar
 * @returns {string} İmza
 */
function createPaymentFormSign(params, secretKey) {
  const signParams = [
    params.merchant_id,
    params.pay_id,
    params.amount,
    params.currency,
    params.desc || '',
    params.success_url || '',
    params.fail_url || '',
    secretKey
  ];

  return createSHA256Sign(signParams);
}

/**
 * Ödeme bildirimi imzası doğrular (SHA256)
 * @param {Object} notification Bildirim verileri
 * @param {string} secretKey Gizli anahtar
 * @returns {boolean} İmza geçerli mi?
 */
function validateNotificationSign(notification, secretKey) {
  // Gerekli parametreler eksikse false döndür
  if (!notification.currency || !notification.amount || !notification.pay_id || 
      !notification.merchant_id || !notification.status || !notification.sign) {
    console.debug('Bildirimde eksik parametreler var:', notification);
    return false;
  }
  
  const signParams = [
    notification.currency,
    notification.amount,
    notification.pay_id,
    notification.merchant_id,
    notification.status,
    secretKey
  ];
  
  // Debug için
  if (process.env.NODE_ENV === 'development') {
    console.debug('Doğrulama parametreleri:', signParams.join(':'));
  }

  const calculatedSign = createSHA256Sign(signParams);
  
  // İmzaları karşılaştır
  const isValid = calculatedSign === notification.sign;
  
  // Hata ayıklama için
  if (!isValid && process.env.NODE_ENV === 'development') {
    console.debug('İmza eşleşmedi:');
    console.debug('- Hesaplanan:', calculatedSign);
    console.debug('- Gelen:', notification.sign);
  }
  
  return isValid;
}

/**
 * API isteği imzası oluşturur (SHA256)
 * @param {string} method API metodu
 * @param {Object} params İstek parametreleri
 * @param {string} apiId API ID
 * @param {string} apiKey API anahtarı
 * @returns {string} İmza
 */
function createAPIRequestSign(method, params = {}, apiId, apiKey) {
  let signParams = [method, apiId];
  
  // Metoda göre parametreleri ekle
  switch (method) {
    case 'balance':
    case 'rates':
    case 'ip-notification':
    case 'payouts':
      // Sadece apiKey ekle
      break;
    case 'commissions':
      signParams.push(params.project_id);
      break;
    case 'payments':
      signParams.push(params.project_id);
      break;
    case 'create-payment':
      signParams.push(
        params.project_id,
        params.pay_id,
        params.amount,
        params.currency,
        params.desc,
        params.method
      );
      break;
    case 'create-payout':
      signParams.push(
        params.payout_id,
        params.payout_type,
        params.amount,
        params.wallet
      );
      break;
    default:
      throw new Error(`Unknown API method: ${method}`);
  }

  // API anahtarını ekle
  signParams.push(apiKey);
  
  return createSHA256Sign(signParams);
}

module.exports = {
  createMD5Sign,
  createSHA256Sign,
  createPaymentFormSign,
  validateNotificationSign,
  createAPIRequestSign
};
