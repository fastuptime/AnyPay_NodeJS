const nock = require('nock');
const { AnypayClient } = require('../lib/index');

// Test yapılandırması
const config = {
  merchantId: '1399',
  secretKey: 'NLmx0woAqrgHYnMbDSVLChCJ77R8adf',
  apiId: 'test-api-id',
  apiKey: 'test-api-key'
};

const client = new AnypayClient(config);

describe('AnypayClient', () => {
  // Not: setup.js tüm testler için ortak hooks'ları içeriyor
  // Bu nedenle beforeAll, afterAll ve afterEach burada tekrar tanımlanmıyor

  test('createPaymentFormData should return valid form data with sign', () => {
    const params = {
      pay_id: '12345',
      amount: '100.00',
      currency: 'RUB',
      desc: 'Test payment'
    };

    const formData = client.createPaymentFormData(params);

    expect(formData).toHaveProperty('merchant_id', config.merchantId);
    expect(formData).toHaveProperty('pay_id', params.pay_id);
    expect(formData).toHaveProperty('amount', params.amount);
    expect(formData).toHaveProperty('currency', params.currency);
    expect(formData).toHaveProperty('desc', params.desc);
    expect(formData).toHaveProperty('sign');
  });

  test('createPaymentForm should return HTML form', () => {
    const params = {
      pay_id: '12345',
      amount: '100.00',
      currency: 'RUB',
      desc: 'Test payment'
    };

    const formHtml = client.createPaymentForm(params);

    expect(formHtml).toContain('<form action="https://anypay.io/merchant"');
    expect(formHtml).toContain(`name="merchant_id" value="${config.merchantId}"`);
    expect(formHtml).toContain(`name="pay_id" value="${params.pay_id}"`);
    expect(formHtml).toContain(`name="amount" value="${params.amount}"`);
    expect(formHtml).toContain(`name="currency" value="${params.currency}"`);
    expect(formHtml).toContain(`name="desc" value="${params.desc}"`);
    expect(formHtml).toContain('name="sign" value="');
  });

  test('validateNotification should validate notification data', () => {
    // SHA256 imzası: currency:amount:pay_id:merchant_id:status:secretKey
    // Doğru imza oluşturalım
    const notification = {
      currency: 'RUB',
      amount: '100.00',
      pay_id: '12345',
      merchant_id: config.merchantId,
      status: 'paid',
    };
    
    // İmza oluşturma - Anypay dokümanında belirtilen şekilde
    const signParams = [
      notification.currency,
      notification.amount,
      notification.pay_id,
      notification.merchant_id,
      notification.status,
      config.secretKey
    ];
    
    const crypto = require('crypto');
    const sign = crypto.createHash('sha256').update(signParams.join(':')).digest('hex');
    notification.sign = sign;
    
    const validIP = '185.162.128.38';
    const invalidIP = '192.168.1.1';

    expect(client.validateNotification(notification, validIP)).toBe(true);
    expect(client.validateNotification(notification, invalidIP)).toBe(false);
    
    // Geçersiz imza
    const invalidNotification = { ...notification, sign: 'invalid' };
    expect(client.validateNotification(invalidNotification, validIP)).toBe(false);
  });

  // Jest mockları kullanarak API testlerini güçlendirelim
  test('getBalance should return balance', async () => {
    const mockResponse = {
      result: { balance: 15023.66 }
    };

    nock('https://anypay.io')
      .post('/api/balance/test-api-id')
      .reply(200, mockResponse);

    const result = await client.getBalance();
    expect(result).toEqual({ balance: 15023.66 });
  });

  test('getRates should return exchange rates', async () => {
    const mockResponse = {
      result: {
        in: { usd: 72.96, eur: 86.99 },
        out: { usd: 73.33 }
      }
    };

    nock('https://anypay.io')
      .post('/api/rates/test-api-id')
      .reply(200, mockResponse);

    const result = await client.getRates();
    expect(result).toHaveProperty('in');
    expect(result).toHaveProperty('out');
  });

  test('getCommissions should return commissions', async () => {
    const mockScope = nock('https://anypay.io')
      .post(`/api/commissions/test-api-id`)
      .reply(200, {
        result: {
          qiwi: 6,
          card: 5
        }
      });

    const result = await client.getCommissions();
    expect(result).toHaveProperty('qiwi', 6);
    expect(result).toHaveProperty('card', 5);
    expect(mockScope.isDone()).toBe(true);
  });

  test('createPayment should create new payment', async () => {
    const mockScope = nock('https://anypay.io')
      .post(`/api/create-payment/test-api-id`)
      .reply(200, {
        result: {
          transaction_id: 4950030,
          pay_id: '12345',
          status: 'waiting',
          payment_url: 'https://anypay.io/pay/de13d3493-4508-4c6a-90d4'
        }
      });

    const params = {
      pay_id: '12345',
      amount: '100.00',
      currency: 'RUB',
      desc: 'Test payment',
      email: 'test@example.com',
      method: 'card'
    };

    const result = await client.createPayment(params);
    expect(result).toHaveProperty('transaction_id', 4950030);
    expect(result).toHaveProperty('pay_id', params.pay_id);
    expect(result).toHaveProperty('status', 'waiting');
    expect(result).toHaveProperty('payment_url');
    expect(mockScope.isDone()).toBe(true);
  });
});
