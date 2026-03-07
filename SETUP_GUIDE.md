# Dream Analyzer - Supabase Setup Guide

## 📝 Adım Adım Kurulum

### 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) web sitesine gidin
2. "Start your project" butonuna tıklayın
3. Yeni bir proje oluşturun:
   - **Organization**: Mevcut veya yeni organization seçin
   - **Project Name**: `dream-analyzer` (veya istediğiniz isim)
   - **Database Password**: Güçlü bir şifre belirleyin (**KAYDET!**)
   - **Region**: Size en yakın bölgeyi seçin (örn: `eu-central-1`)
4. "Create new project" butonuna tıklayın
5. Proje oluşturulurken bekleyin (1-2 dakika)

### 2. API Keys Alma

Proje hazır olduğunda:

1. Sol menüden **Settings** > **API** sayfasına gidin
2. Aşağıdaki bilgileri kopyalayın:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Environment Variables Ayarlama

Proje klasöründe `.env` dosyasını açın ve aşağıdaki değerleri güncelleyin:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co  # Project URL buraya
SUPABASE_ANON_KEY=eyJhbGci...                    # anon public key buraya
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...            # service_role key buraya

# JWT Configuration (en az 32 karakter olmalı)
JWT_SECRET=super-secret-jwt-key-for-dream-analyzer-minimum-32-chars

# Diğerleri varsayılan kalabilir
PORT=3000
NODE_ENV=development
JWT_EXPIRES_IN=7d
API_PREFIX=api
```

### 4. Database Schema Oluşturma

1. Supabase Dashboard'da sol menüden **SQL Editor** sayfasına gidin
2. "New query" butonuna tıklayın
3. Proje klasöründeki `supabase/migrations/001_initial_schema.sql` dosyasını açın
4. **TÜM** SQL kodunu kopyalayıp SQL Editor'e yapıştırın
5. **RUN** butonuna tıklayın (veya Ctrl+Enter)
6. "Success. No rows returned" mesajını görmelisiniz

### 5. Database Kontrolü

Schema'nın doğru oluşturulduğunu kontrol edin:

1. Sol menüden **Table Editor** sayfasına gidin
2. Aşağıdaki tabloları görmelisiniz:
   - `users`
   - `dreams`
   - `insights`
   - `faqs`
   - `faq_translations`

### 6. Projeyi Çalıştırma

Terminal'de proje klasörüne gidin ve:

```bash
# Bağımlılıkları yükleyin (henüz yapmadıysanız)
bun install

# Projeyi çalıştırın
bun run dev
```

Başarılı olursa şu çıktıyı görmelisiniz:

```
🚀 Application is running on: http://localhost:3000
📚 Scalar API Reference: http://localhost:3000/api/reference
📄 OpenAPI JSON: http://localhost:3000/api/openapi.json
```

## 🧪 API Test Etme

### 1. Register Test

Postman, Insomnia veya curl ile:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test12345",
    "name": "Test",
    "surname": "User"
  }'
```

Başarılı response:

```json
{
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "test@example.com",
      "name": "Test",
      "surname": "User"
    },
    "session": {
      "accessToken": "eyJhbGci...",
      "refreshToken": "...",
      "expiresIn": 3600
    }
  }
}
```

### 2. Login Test

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test12345"
  }'
```

### 3. Supabase Dashboard'da User Kontrolü

1. Supabase Dashboard > **Authentication** > **Users**
2. Az önce oluşturduğunuz kullanıcıyı görmelisiniz
3. **Table Editor** > **users** tablosunda da profil bilgilerini görebilirsiniz

## ❗ Yaygın Hatalar ve Çözümleri

### Hata: "Invalid environment variables"

**Sebep**: `.env` dosyası eksik veya yanlış yapılandırılmış

**Çözüm**:

- `.env` dosyasının var olduğundan emin olun
- Tüm gerekli değişkenlerin dolu olduğunu kontrol edin
- `JWT_SECRET` en az 32 karakter olmalı

### Hata: "Failed to connect to Supabase"

**Sebep**: API key'ler yanlış veya proje URL'i hatalı

**Çözüm**:

- Supabase Dashboard'dan API key'leri tekrar kopyalayın
- `SUPABASE_URL` https:// ile başlamalı ve .supabase.co ile bitmeli
- Key'lerde boşluk veya satır sonu olmadığından emin olun

### Hata: "relation 'users' does not exist"

**Sebep**: Database migration çalıştırılmamış

**Çözüm**:

- SQL Editor'e gidin
- `001_initial_schema.sql` dosyasındaki kodu tekrar çalıştırın
- Table Editor'de tabloları kontrol edin

### Hata: "Email already registered" (409)

**Sebep**: Bu email zaten kayıtlı

**Çözüm**:

- Farklı bir email kullanın
- VEYA Supabase Dashboard > Authentication > Users'dan mevcut kullanıcıyı silin

## 🎯 Sonraki Adımlar

Kurulum başarılıysa:

1. ✅ API Documentation'ı inceleyin: http://localhost:3000/api/reference
2. ✅ README.md'deki Database Models bölümünü okuyun
3. ✅ Kalan modüllerin geliştirilmesine başlayın (User, Dream, Insight, FAQ)

## 📞 Destek

Sorun yaşıyorsanız:

1. Terminal'deki hata mesajlarını kontrol edin
2. Supabase Dashboard > Logs bölümünde hataları inceleyin
3. `.env` dosyasının doğru olduğundan emin olun
4. Gerekirse projeyi temizleyip yeniden başlatın:

```bash
# Node modules ve build'i temizle
rm -rf node_modules dist

# Yeniden yükle
bun install

# Yeniden çalıştır
bun run dev
```
