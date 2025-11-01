# Panduan Mengatasi Masalah Login dengan Email

## Masalah yang Teridentifikasi

Berdasarkan error yang muncul:
```
Database error querying schema
Failed to load resource: the server responded with a status of 500
```

Masalah utama adalah:
1. Skema database tidak sinkron dengan kode aplikasi
2. Tabel `profiles` belum memiliki kolom `email`
3. User authentication belum terkonfigurasi dengan benar

## Langkah-langkah Penyelesaian

### 1. Jalankan Script SQL di Supabase

Buka Supabase Dashboard → SQL Editor → Jalankan script berikut:

```sql
-- 1. Tambah kolom email di tabel profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- 2. Update email berdasarkan auth.users untuk user yang sudah ada
UPDATE public.profiles 
SET email = auth.users.email
FROM auth.users 
WHERE profiles.id = auth.users.id;

-- 3. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. Hapus user demo lama jika ada
DELETE FROM auth.users WHERE email LIKE '%@login.internal';

-- 5. Insert user demo dengan email yang benar
-- Superadmin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440001',
  'authenticated',
  'authenticated',
  'superadmin@login.internal',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{}',
  '{}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = now();

-- Leader Alpha
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440002',
  'authenticated',
  'authenticated',
  'leader_alpha@login.internal',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{}',
  '{}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = now();

-- Host 1
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '550e8400-e29b-41d4-a716-446655440003',
  'authenticated',
  'authenticated',
  'host1@login.internal',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{}',
  '{}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  updated_at = now();

-- 6. Insert/Update profiles dengan email
INSERT INTO public.profiles (id, full_name, username, position, email, start_date, created_at, updated_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Super Administrator', 'superadmin', 'superadmin', 'superadmin@login.internal', CURRENT_DATE, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'Leader Alpha', 'leader_alpha', 'leader', 'leader_alpha@login.internal', CURRENT_DATE, now(), now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'Host Live 1', 'host1', 'staff_host_live', 'host1@login.internal', CURRENT_DATE, now(), now())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  updated_at = now();

-- 7. Verifikasi data
SELECT 
  p.id,
  p.full_name,
  p.username,
  p.email,
  p.position,
  au.email as auth_email
FROM public.profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email LIKE '%@login.internal'
ORDER BY p.position;
```

### 2. Verifikasi RLS (Row Level Security) Policies

Pastikan RLS policies tidak memblokir akses:

```sql
-- Cek RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Jika RLS aktif dan menyebabkan masalah, disable sementara untuk testing
-- HATI-HATI: Hanya untuk development
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Atau buat policy yang permisif untuk testing
CREATE POLICY "Allow all for authenticated users" ON public.profiles
  FOR ALL USING (auth.role() = 'authenticated');
```

### 3. Cek Environment Variables

Pastikan file `.env` memiliki konfigurasi yang benar:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Test Login

Setelah menjalankan script SQL, test login dengan:

**Demo Credentials:**
- **Superadmin**: `superadmin@login.internal` / `password123`
- **Leader**: `leader_alpha@login.internal` / `password123`  
- **Staff**: `host1@login.internal` / `password123`

### 5. Debug Console

Jika masih error, buka Developer Tools → Console dan cari:

1. **Network errors** - Check apakah request ke Supabase berhasil
2. **CORS errors** - Pastikan domain sudah ditambahkan di Supabase Dashboard
3. **Schema errors** - Pastikan kolom email sudah ada di tabel profiles

### 6. Verifikasi di Supabase Dashboard

1. Buka **Authentication → Users** - Pastikan user demo sudah terbuat
2. Buka **Table Editor → profiles** - Pastikan kolom email ada dan terisi
3. Buka **Settings → API** - Pastikan URL dan Key sesuai dengan .env

## Jika Masih Bermasalah

### Reset Supabase Database (Hati-hati)

```sql
-- Backup data penting dulu!
-- DROP semua tabel dan buat ulang sesuai schema
-- Atau gunakan Supabase Migration
```

### Alternative: Gunakan Username Login

Jika email login masih bermasalah, bisa kembali ke username dengan mengedit `signIn` function:

```typescript
const signIn = async (username: string, password: string) => {
  const email = `${username}@login.internal`;
  // ... rest of code
};
```

## Troubleshooting Checklist

- [ ] Script SQL sudah dijalankan
- [ ] Kolom email sudah ada di tabel profiles
- [ ] User demo sudah terbuat di auth.users
- [ ] Environment variables sudah benar
- [ ] RLS policies tidak memblokir akses
- [ ] CORS sudah dikonfigurasi di Supabase
- [ ] Network request berhasil (status 200)
- [ ] Browser cache sudah dibersihkan

## Kontak Support

Jika masih mengalami kendala, hubungi:
- Developer: Ramdani Fahmy
- Email: ramdanifahmy2023@gmail.com
- GitHub: [AffiliateTracker Repository](https://github.com/ramdanifahmy2023/AffiliateTracker-FSSayyida)