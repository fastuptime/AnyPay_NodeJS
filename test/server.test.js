const { AnypayClient, crypto } = require('../lib/index');
const express = require('express');
const request = require('supertest');
const bodyParser = require('body-parser');

// Test uygulaması
function createTestApp() {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Test yapılandırması
  const client = new AnypayClient({
    merchantId: '1399',
    secretKey: 'NLmx0woAqrgHYnMbDSVLChCJ77R8adf',
    apiId: 'test-api-id',
    apiKey: 'test-api-key'
  });

  // Ödeme bildirimi işleme endpoint'i
  app.post('/payment-callback', (req, res) => {
    const notification = req.body;
    const ipAddress = req.ip || '127.0.0.1'; // Test için localhost IP

    try {
      // Bildirimi doğrula
      // Not: Test ortamında IP kontrolünü geçici olarak devre dışı bırakıyoruz
      // Gerçek ortamda şu şekilde kullanılır: client.validateNotification(notification, ipAddress)
      const isValidSignature = crypto.validateNotificationSign(notification, client.secretKey);
      
      if (isValidSignature) {
        // Ödeme geçerli, işlem yapın
        console.log('Geçerli ödeme bildirimi alındı');

        // İşlem başarılı
        res.send('OK');
      } else {
        // Geçersiz imza
        console.error('Geçersiz ödeme bildirimi - imza hatası');
        res.status(400).send('Invalid signature');
      }
    } catch (error) {
      console.error('Bildirim işleme hatası:', error);
      res.status(500).send('Error');
    }
  });

  return app;
}

describe('Anypay Payment Notification Handler', () => {
  let app;
  const secretKey = 'NLmx0woAqrgHYnMbDSVLChCJ77R8adf';
  
  beforeEach(() => {
    app = createTestApp();
  });

  test('should successfully validate payment notification with valid signature', async () => {
    // Geçerli ödeme bildirimi
    const notification = {
      currency: 'RUB',
      amount: '100.00',
      pay_id: '12345',
      merchant_id: '1399',
      status: 'paid',
      transaction_id: '4950030',
      profit: '95.00'
    };

    // İmzayı hesapla
    const signParams = [
      notification.currency,
      notification.amount,
      notification.pay_id,
      notification.merchant_id,
      notification.status,
      secretKey
    ];
    
    // İmza oluşturma parametrelerini yazdır
    console.log('Test için imza parametreleri:', signParams.join(':'));
    
    notification.sign = crypto.createSHA256Sign(signParams);
    console.log('Test için oluşturulan imza:', notification.sign);

    const response = await request(app)
      .post('/payment-callback')
      .send(notification);

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('OK');
  });

  test('should reject payment notification with invalid signature', async () => {
    // Geçersiz imzalı ödeme bildirimi
    const invalidNotification = {
      currency: 'RUB',
      amount: '100.00',
      pay_id: '12345',
      merchant_id: '1399',
      status: 'paid',
      sign: 'invalid-signature'
    };

    const response = await request(app)
      .post('/payment-callback')
      .send(invalidNotification);

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe('Invalid signature');
  });
});
