const axios = require('axios');
const FormData = require('form-data');
const { BASE_URL, API_ENDPOINTS } = require('./constants');
const crypto = require('crypto');
const { 
  createPaymentFormSign, 
  validateNotificationSign, 
  createAPIRequestSign 
} = require('./crypto');
const {
  validateParam,
  isValidNotificationIP,
  generatePaymentFormHTML
} = require('./utils');

/**
 * Anypay API istemcisi
 */
class AnypayClient {
  /**
   * @param {Object} config Yapılandırma
   * @param {string} config.merchantId Merchant ID
   * @param {string} config.secretKey Gizli anahtar
   * @param {string} config.apiId API ID
   * @param {string} config.apiKey API anahtarı
   */
  constructor(config) {
    validateParam(config, 'config');
    validateParam(config.merchantId, 'config.merchantId');
    validateParam(config.secretKey, 'config.secretKey');
    validateParam(config.apiId, 'config.apiId');
    validateParam(config.apiKey, 'config.apiKey');
    
    this.merchantId = config.merchantId;
    this.secretKey = config.secretKey;
    this.apiId = config.apiId;
    this.apiKey = config.apiKey;
    this.baseUrl = BASE_URL;
  }

  /**
   * Ödeme formu verileri oluşturur
   * @param {Object} params Ödeme parametreleri
   * @returns {Object} Form verileri
   */
  createPaymentFormData(params) {
    validateParam(params, 'params');
    validateParam(params.pay_id, 'params.pay_id');
    validateParam(params.amount, 'params.amount');
    validateParam(params.currency, 'params.currency');

    const formData = {
      merchant_id: this.merchantId,
      pay_id: params.pay_id,
      amount: params.amount,
      currency: params.currency,
      desc: params.desc || '',
      success_url: params.success_url || '',
      fail_url: params.fail_url || '',
      email: params.email || '',
      phone: params.phone || '',
      method: params.method || '',
      lang: params.lang || 'ru'
    };

    // İmza oluştur
    formData.sign = createPaymentFormSign(formData, this.secretKey);
    
    // Ek parametreler varsa ekle
    if (params.custom) {
      Object.assign(formData, params.custom);
    }

    return formData;
  }

  /**
   * Ödeme formu HTML'i oluşturur
   * @param {Object} params Ödeme parametreleri
   * @returns {string} Form HTML
   */
  createPaymentForm(params) {
    const formData = this.createPaymentFormData(params);
    return generatePaymentFormHTML(formData);
  }

  /**
   * Ödeme bildirimi doğrular
   * @param {Object} notification Bildirim verileri
   * @param {string} ipAddress Bildirim IP adresi
   * @returns {boolean} Bildirim geçerli mi?
   */
  validateNotification(notification, ipAddress) {
    try {
      validateParam(notification, 'notification');
      validateParam(ipAddress, 'ipAddress');

      // IP adresi kontrolü
      if (!isValidNotificationIP(ipAddress)) {
        console.log('Geçersiz IP adresi:', ipAddress);
        return false;
      }

      // İmza doğrulama
      return validateNotificationSign(notification, this.secretKey);
    } catch (error) {
      console.error('Bildirim doğrulama hatası:', error);
      return false;
    }
  }

  /**
   * API isteği gönderir
   * @param {string} method API metodu
   * @param {Object} params İstek parametreleri
   * @returns {Promise<Object>} API yanıtı
   * @private
   */
  async _makeAPIRequest(method, params = {}) {
    // Method isminden endpoint key'i oluştur
    const methodKey = method.replace(/-/g, '_').toUpperCase();
    if (!API_ENDPOINTS[methodKey]) {
      throw new Error(`Unknown API endpoint for method: ${method}`);
    }
    
    const sign = createAPIRequestSign(method, params, this.apiId, this.apiKey);
    const url = `${this.baseUrl}${API_ENDPOINTS[methodKey]}/${this.apiId}`;
    
    const formData = new FormData();
    formData.append('sign', sign);
    
    // Diğer parametreleri ekle
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Accept': 'application/json',
          ...formData.getHeaders()
        }
      });
      
      if (response.data.error) {
        throw new Error(`API Error ${response.data.error.code}: ${response.data.error.message}`);
      }
      
      return response.data.result;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(`API Error ${error.response.data.error.code}: ${error.response.data.error.message}`);
      }
      throw error;
    }
  }

  /**
   * Hesap bakiyesini alır
   * @returns {Promise<Object>} Bakiye bilgileri
   */
  async getBalance() {
    return this._makeAPIRequest('balance');
  }

  /**
   * Döviz kurlarını alır
   * @returns {Promise<Object>} Kur bilgileri
   */
  async getRates() {
    return this._makeAPIRequest('rates');
  }

  /**
   * Komisyon oranlarını alır
   * @returns {Promise<Object>} Komisyon bilgileri
   */
  async getCommissions() {
    return this._makeAPIRequest('commissions', { 
      project_id: this.merchantId 
    });
  }

  /**
   * API üzerinden yeni ödeme oluşturur
   * @param {Object} params Ödeme parametreleri
   * @returns {Promise<Object>} Ödeme detayları
   */
  async createPayment(params) {
    // Zorunlu parametreleri kontrol et
    validateParam(params, 'params');
    validateParam(params.pay_id, 'params.pay_id');
    validateParam(params.amount, 'params.amount');
    validateParam(params.currency, 'params.currency');
    validateParam(params.desc, 'params.desc');
    validateParam(params.email, 'params.email');
    validateParam(params.method, 'params.method');
    
    const methodKey = 'create-payment'.replace(/-/g, '_').toUpperCase();
    if (!API_ENDPOINTS[methodKey]) {
      throw new Error(`Unknown API endpoint for method: create-payment`);
    }
    
    // İstek parametreleri oluştur
    const requestParams = {
      project_id: this.merchantId,
      pay_id: params.pay_id,
      amount: params.amount,
      currency: params.currency,
      desc: params.desc,
      email: params.email,
      method: params.method,
    };
    
    // İsteğe bağlı parametreleri ekle
    if (params.phone) requestParams.phone = params.phone;
    if (params.method_currency) requestParams.method_currency = params.method_currency;
    if (params.success_url) requestParams.success_url = params.success_url;
    if (params.fail_url) requestParams.fail_url = params.fail_url;
    if (params.lang) requestParams.lang = params.lang;
    else requestParams.lang = 'ru'; // Varsayılan dil
    
    // Ek parametreleri ekle
    if (params.custom) {
      Object.entries(params.custom).forEach(([key, value]) => {
        requestParams[key] = value;
      });
    }
    
    // API dokümanına göre imza oluştur - DÜZELTME
    // Doğrudan çalışan kodun imza formatını kullanıyoruz
    const signString = `create-payment${this.apiId}${this.merchantId}${params.pay_id}${params.amount}${params.currency}${params.desc}${params.method}${this.apiKey}`;
    const sign = crypto.createHash('sha256').update(signString).digest('hex');
    
    const url = `${this.baseUrl}${API_ENDPOINTS[methodKey]}/${this.apiId}`;
    
    // FormData oluştur
    const formData = new FormData();
    formData.append('sign', sign);
    
    // Parametreleri FormData'ya ekle
    Object.entries(requestParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Debug için imza ve parametreleri yazdır
    if (process.env.NODE_ENV === 'development') {
      console.debug('Sign string:', signString);
      console.debug('Generated sign:', sign);
      console.debug('Request params:', requestParams);
    }
    
    try {
      const response = await axios.post(url, formData, {
        headers: {
          'Accept': 'application/json',
          ...formData.getHeaders()
        }
      });
      
      if (response.data.error) {
        throw new Error(`API Error ${response.data.error.code}: ${response.data.error.message}`);
      }
      
      return response.data.result;
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(`API Error ${error.response.data.error.code}: ${error.response.data.error.message}`);
      }
      throw error;
    }
  }

  /**
   * Ödeme işlemlerini alır
   * @param {Object} params Sorgu parametreleri
   * @returns {Promise<Object>} Ödeme işlemleri listesi
   */
  async getPayments(params = {}) {
    const requestParams = {
      project_id: this.merchantId,
      trans_id: params.trans_id,
      pay_id: params.pay_id,
      offset: params.offset || 0
    };
    
    return this._makeAPIRequest('payments', requestParams);
  }

  /**
   * Yeni para çekme işlemi oluşturur
   * @param {Object} params Para çekme parametreleri
   * @returns {Promise<Object>} İşlem detayları
   */
  async createPayout(params) {
    validateParam(params, 'params');
    validateParam(params.payout_id, 'params.payout_id');
    validateParam(params.payout_type, 'params.payout_type');
    validateParam(params.amount, 'params.amount');
    validateParam(params.wallet, 'params.wallet');
    
    const requestParams = {
      payout_id: params.payout_id,
      payout_type: params.payout_type,
      amount: params.amount,
      wallet: params.wallet,
      wallet_currency: params.wallet_currency,
      wallet_bank: params.wallet_bank,
      commission_type: params.commission_type,
      status_url: params.status_url
    };
    
    return this._makeAPIRequest('create-payout', requestParams);
  }

  /**
   * Para çekme işlemlerini alır
   * @param {Object} params Sorgu parametreleri
   * @returns {Promise<Object>} Para çekme işlemleri listesi
   */
  async getPayouts(params = {}) {
    const requestParams = {
      trans_id: params.trans_id,
      payout_id: params.payout_id,
      offset: params.offset || 0
    };
    
    return this._makeAPIRequest('payouts', requestParams);
  }

  /**
   * Bildirim IP adreslerini alır
   * @returns {Promise<Object>} IP adresleri listesi
   */
  async getNotificationIPs() {
    return this._makeAPIRequest('ip-notification');
  }
}

module.exports = AnypayClient;
