# Anypay Node.js Entegrasyonu

Bu modül, [Anypay](https://anypay.io/) ödeme geçidi için Node.js entegrasyonu sağlar. Ödeme formları oluşturma, ödeme bildirimleri doğrulama ve Anypay API'sini kullanma gibi işlevler sunar.

## Kurulum

```bash
npm install anypay-node
```

veya

```bash
yarn add anypay-node
```

## Hızlı Başlangıç

```javascript
const { AnypayClient } = require('anypay-node');

// AnypayClient örneği oluşturma
const client = new AnypayClient({
  merchantId: 'YOUR_MERCHANT_ID',
  secretKey: 'YOUR_SECRET_KEY',
  apiId: 'YOUR_API_ID',
  apiKey: 'YOUR_API_KEY'
});

// Ödeme formu oluşturma
const formHtml = client.createPaymentForm({
  pay_id: '12345',
  amount: '100.00',
  currency: 'RUB',
  desc: 'Test ödeme'
});

console.log(formHtml);
```

## Özellikler

- Ödeme formu oluşturma
- Ödeme bildirimi doğrulama
- Hesap bakiyesi sorgulama
- Döviz kurlarını alma
- Komisyon oranlarını alma
- API üzerinden ödeme oluşturma
- Ödeme işlemlerini listeleme
- Para çekme işlemi oluşturma
- Para çekme işlemlerini listeleme
- Bildirim IP adreslerini alma

## API Referansı

### AnypayClient

Anypay API'si ile etkileşim kurmak için ana sınıf.

#### Constructor

```javascript
new AnypayClient({
  merchantId: 'YOUR_MERCHANT_ID',
  secretKey: 'YOUR_SECRET_KEY',
  apiId: 'YOUR_API_ID',
  apiKey: 'YOUR_API_KEY'
})
```

#### Parametreler

- `merchantId` (string): Anypay Merchant ID
- `secretKey` (string): Anypay gizli anahtarı
- `apiId` (string): Anypay API ID
- `apiKey` (string): Anypay API anahtarı

### Ödeme İşlemleri

#### createPaymentFormData(params)

Ödeme formu verilerini oluşturur.

```javascript
const formData = client.createPaymentFormData({
  pay_id: '12345',
  amount: '100.00',
  currency: 'RUB',
  desc: 'Test ödeme',
  success_url: 'https://example.com/success',
  fail_url: 'https://example.com/fail',
  email: 'customer@example.com'
});
```

#### createPaymentForm(params)

Ödeme formu HTML'i oluşturur.

```javascript
const formHtml = client.createPaymentForm({
  pay_id: '12345',
  amount: '100.00',
  currency: 'RUB',
  desc: 'Test ödeme'
});
```

#### validateNotification(notification, ipAddress)

Ödeme bildirimini doğrular.

```javascript
const isValid = client.validateNotification(notification, ipAddress);
```

#### async getBalance()

Hesap bakiyesini alır.

```javascript
const balance = await client.getBalance();
```

#### async getRates()

Döviz kurlarını alır.

```javascript
const rates = await client.getRates();
```

#### async getCommissions()

Komisyon oranlarını alır.

```javascript
const commissions = await client.getCommissions();
```

#### async createPayment(params)

API üzerinden ödeme oluşturur.

```javascript
const payment = await client.createPayment({
  pay_id: '12345',
  amount: '100.00',
  currency: 'RUB',
  desc: 'API ile test ödeme',
  email: 'customer@example.com',
  method: 'card'
});
```

#### async getPayments(params)

Ödeme işlemlerini listeler.

```javascript
const payments = await client.getPayments({
  trans_id: '12345',  // isteğe bağlı
  pay_id: '12345',    // isteğe bağlı
  offset: 0           // isteğe bağlı, varsayılan: 0
});
```

#### async createPayout(params)

Yeni para çekme işlemi oluşturur.

```javascript
const payout = await client.createPayout({
  payout_id: '54321',
  payout_type: 'card',
  amount: '1000.00',
  wallet: '4000000000000000',
  wallet_currency: 'RUB',
  commission_type: 'payment'
});
```

#### async getPayouts(params)

Para çekme işlemlerini listeler.

```javascript
const payouts = await client.getPayouts({
  trans_id: '12345',  // isteğe bağlı
  payout_id: '12345', // isteğe bağlı
  offset: 0           // isteğe bağlı, varsayılan: 0
});
```

#### async getNotificationIPs()

Bildirim IP adreslerini alır.

```javascript
const ipData = await client.getNotificationIPs();
```

## Ödeme Bildirimleri İşleme

Anypay, ödeme tamamlandığında belirttiğiniz callback URL'sine bir bildirim gönderir. Bu bildirimi doğrulamak için:

```javascript
// Express.js örneği
app.post('/payment-callback', (req, res) => {
  const notification = req.body;
  const ipAddress = req.ip;
  
  // Bildirimi doğrula
  const isValid = client.validateNotification(notification, ipAddress);
  
  if (isValid) {
    // Ödeme geçerli, işlem yapın
    console.log('Geçerli ödeme:', notification);
    
    // Ödeme verilerini işle
    const { transaction_id, pay_id, amount, currency, status } = notification;
    
    if (status === 'paid') {
      // Siparişi onayla, krediyi etkinleştir, vb.
      // Veritabanında işlem durumunu güncelle
      // Örn: await db.updateOrder(pay_id, 'paid');
    } else if (status === 'partially-paid') {
      // Kısmi ödeme alındı
    } else if (status === 'waiting') {
      // Hala ödeme bekleniyor
    }
    
    // İşlem başarılı - Anypay'in beklediği "OK" yanıtını gönder
    res.send('OK');
  } else {
    // Geçersiz bildirim
    console.error('Geçersiz ödeme bildirimi!');
    res.status(400).send('Invalid notification');
  }
});
```

### Bildirim Doğrulama Detayları

Anypay bildirim doğrulama şu adımları içerir:

1. IP adresi kontrolü: Bildirim, Anypay'in resmi IP adreslerinden gelmelidir (185.162.128.38, 185.162.128.39, 185.162.128.88)

2. İmza kontrolü: Bildirim, özel bir algoritma kullanılarak imzalanır:
   ```
   SHA256(currency + ":" + amount + ":" + pay_id + ":" + merchant_id + ":" + status + ":" + secretKey)
   ```

3. İşlem doğrulama: Ödeme miktarı, para birimi ve diğer önemli bilgileri orijinal sipariş verileriyle karşılaştırın.

## Desteklenen Para Birimleri

- `RUB` - Rus Rublesi
- `UAH` - Ukrayna Grivnası
- `BYN` - Belarus Rublesi
- `KZT` - Kazak Tengesi
- `USD` - ABD Doları
- `EUR` - Euro

## Desteklenen Ödeme Yöntemleri

Modül, Anypay tarafından desteklenen tüm ödeme yöntemlerini destekler:

- Banka Kartları
- Elektronik Cüzdanlar (ЮMoney, Webmoney, vb.)
- Kripto Para Birimleri (Bitcoin, Ethereum, vb.)
- Mobil Ödemeler
- ve daha fazlası

Her ödeme yöntemi için tam liste `constants.js` dosyasında bulunabilir.

## Örnekler

Detaylı örnekler için `examples.js` dosyasına bakın.

## License

ISC
