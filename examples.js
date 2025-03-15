const { AnypayClient, crypto } = require('./lib/index');

// AnypayClient örneği oluşturma
const client = new AnypayClient({
  merchantId: '1399',              // Merchant ID
  secretKey: 'NLmx0woAqrgHYnMbDSVLChCJ77R8adf', // Gizli anahtar
  apiId: 'your-api-id',           // API ID
  apiKey: 'your-api-key'          // API anahtarı
});

// Örnek 1: Ödeme formu oluşturma
async function createPaymentFormExample() {
  console.log('--- Ödeme Formu Örneği ---');
  const formParams = {
    pay_id: '12345',
    amount: '100.00',
    currency: 'RUB',
    desc: 'Test ödeme',
    success_url: 'https://example.com/success',
    fail_url: 'https://example.com/fail',
    email: 'customer@example.com'
  };

  const formData = client.createPaymentFormData(formParams);
  console.log('Form Verileri:', formData);

  const formHtml = client.createPaymentForm(formParams);
  console.log('Form HTML:', formHtml);
}

// Örnek 2: Ödeme bildirimi doğrulama
function validateNotificationExample() {
  console.log('--- Ödeme Bildirimi Doğrulama Örneği ---');
  
  // Bildirim nesnesini oluştur
  const notification = {
    currency: 'RUB',
    amount: '100.00',
    pay_id: '12345',
    merchant_id: '1399',
    status: 'paid',
    transaction_id: '4950030',
    profit: '95.00',
    email: 'customer@example.com',
    method: 'card',
    test: '0'
  };

  // API dökümanına göre doğru imza parametreleri:
  // SHA256(currency:amount:pay_id:merchant_id:status:secretKey)
  const secretKey = 'NLmx0woAqrgHYnMbDSVLChCJ77R8adf';
  
  console.log('Debug - İmza bilgileri:');
  console.log('- Currency:', notification.currency);
  console.log('- Amount:', notification.amount);
  console.log('- Pay ID:', notification.pay_id);
  console.log('- Merchant ID:', notification.merchant_id);
  console.log('- Status:', notification.status);
  console.log('- Secret Key:', secretKey);
  
  // İmza oluştur
  const signParams = [
    notification.currency,
    notification.amount,
    notification.pay_id,
    notification.merchant_id,
    notification.status,
    secretKey
  ];
  
  console.log('İmza parametreleri:', signParams.join(':'));
  notification.sign = crypto.createSHA256Sign(signParams);
  console.log('Oluşturulan imza:', notification.sign);

  const ipAddress = '185.162.128.38'; // Anypay'in geçerli IP'lerinden biri

  // Bildirim doğrulama
  const isValid = client.validateNotification(notification, ipAddress);
  console.log('Bildirim Geçerli mi?', isValid);
  
  // Manuel doğrulama (sadece imza kontrolü)
  const manualValidation = crypto.validateNotificationSign(notification, secretKey);
  console.log('Manuel İmza Doğrulama:', manualValidation);
  
  // Farklı değerlerle test
  const invalidIP = '192.168.1.1'; // Geçersiz IP adresi
  console.log('Geçersiz IP ile:', client.validateNotification(notification, invalidIP));
  
  // Geçersiz imza ile test
  const invalidNotification = { ...notification, sign: 'invalid-signature' };
  console.log('Geçersiz İmza ile:', client.validateNotification(invalidNotification, ipAddress));
}

// Örnek 3: Hesap bakiyesi alınması
async function getBalanceExample() {
  console.log('--- Hesap Bakiyesi Örneği ---');
  try {
    const balance = await client.getBalance();
    console.log('Hesap Bakiyesi:', balance);
  } catch (error) {
    console.error('Bakiye alınırken hata:', error.message);
  }
}

// Örnek 4: Döviz kurları alınması
async function getRatesExample() {
  console.log('--- Döviz Kurları Örneği ---');
  try {
    const rates = await client.getRates();
    console.log('Giriş Kurları:', rates.in);
    console.log('Çıkış Kurları:', rates.out);
  } catch (error) {
    console.error('Kurlar alınırken hata:', error.message);
  }
}

// Örnek 5: Komisyon oranları alınması
async function getCommissionsExample() {
  console.log('--- Komisyon Oranları Örneği ---');
  try {
    const commissions = await client.getCommissions();
    console.log('Komisyon Oranları:', commissions);
  } catch (error) {
    console.error('Komisyonlar alınırken hata:', error.message);
  }
}

// Örnek 6: API ile ödeme oluşturma
async function createPaymentExample() {
  console.log('--- API ile Ödeme Oluşturma Örneği ---');
  try {
    const paymentParams = {
      pay_id: '12345',
      amount: '100.00',
      currency: 'RUB',
      desc: 'API ile test ödeme',
      email: 'customer@example.com',
      method: 'card',
      success_url: 'https://example.com/success',
      fail_url: 'https://example.com/fail'
    };

    const payment = await client.createPayment(paymentParams);
    console.log('Oluşturulan Ödeme:', payment);
    console.log('Ödeme URL:', payment.payment_url);
  } catch (error) {
    console.error('Ödeme oluşturulurken hata:', error.message);
  }
}

// Örnek 7: Ödemeleri listele
async function getPaymentsExample() {
  console.log('--- Ödemeleri Listele Örneği ---');
  try {
    const payments = await client.getPayments();
    console.log('Toplam Ödeme Sayısı:', payments.total);
    console.log('Ödemeler:', payments.payments);
  } catch (error) {
    console.error('Ödemeler listelenirken hata:', error.message);
  }
}

// Örnek 8: Para çekme işlemi oluştur
async function createPayoutExample() {
  console.log('--- Para Çekme İşlemi Örneği ---');
  try {
    const payoutParams = {
      payout_id: '54321',
      payout_type: 'card',
      amount: '1000.00',
      wallet: '4000000000000000', // Kredi kartı numarası
      wallet_currency: 'RUB',
      commission_type: 'payment'
    };

    const payout = await client.createPayout(payoutParams);
    console.log('Oluşturulan Para Çekme İşlemi:', payout);
  } catch (error) {
    console.error('Para çekme işlemi oluşturulurken hata:', error.message);
  }
}

// Örnek 9: Para çekme işlemlerini listele
async function getPayoutsExample() {
  console.log('--- Para Çekme İşlemlerini Listele Örneği ---');
  try {
    const payouts = await client.getPayouts();
    console.log('Toplam Para Çekme İşlemi Sayısı:', payouts.total);
    console.log('Para Çekme İşlemleri:', payouts.payouts);
  } catch (error) {
    console.error('Para çekme işlemleri listelenirken hata:', error.message);
  }
}

// Örnek 10: Bildirim IP adreslerini al
async function getNotificationIPsExample() {
  console.log('--- Bildirim IP Adresleri Örneği ---');
  try {
    const ipData = await client.getNotificationIPs();
    console.log('Bildirim IP Adresleri:', ipData.ip);
  } catch (error) {
    console.error('IP adresleri alınırken hata:', error.message);
  }
}

// Tüm örnekleri çalıştır
async function runAllExamples() {
  console.log('====== Anypay API Örnekleri ======\n');
  
  await createPaymentFormExample();
  console.log('\n');
  
  validateNotificationExample();
  console.log('\n');
  
  // API çağrıları için gerçek API anahtarları gerektiğinden,
  // bu örnekler yorum satırına alınmıştır. Gerçek API anahtarları
  // ile çalıştırmak için yorum satırlarını kaldırın.
  
  /* 
  await getBalanceExample();
  console.log('\n');
  
  await getRatesExample();
  console.log('\n');
  
  await getCommissionsExample();
  console.log('\n');
  
  await createPaymentExample();
  console.log('\n');
  
  await getPaymentsExample();
  console.log('\n');
  
  await createPayoutExample();
  console.log('\n');
  
  await getPayoutsExample();
  console.log('\n');
  
  await getNotificationIPsExample();
  */
}

// Örnekleri çalıştır
runAllExamples().catch(error => {
  console.error('Bir hata oluştu:', error);
});
