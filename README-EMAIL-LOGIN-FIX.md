# 🔧 Panduan Mengatasi Masalah Login Email - AffiliateTracker

## ⚠️ Masalah yang Teridentifikasi

Berdasarkan error yang muncul di console:
```
Database error querying schema
Failed to load resource: the server responded with a status of 500
```

**Root cause:** Skema database tidak sinkron dengan kode aplikasi yang sudah diubah untuk menggunakan email login.

## 🚀 Solusi Cepat (Step-by-Step)

### Step 1: Backup Database
```
⚠️ PENTING: Backup database Supabase terlebih dahulu!
```

### Step 2: Jalankan Script SQL

1. Buka **[Supabase Dashboard](https://supabase.com/dashboard)**
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Copy dan paste script dari file `fix-database-schema.sql`
5. Klik **Run** untuk menjalankan script

### Step 3: Verifikasi Database

Jalankan query ini untuk memastikan data sudah benar:

```sql
SELECT 
    p.full_name,
    p.username,
    p.email,
    p.position,
    au.email as auth_email
FROM public.profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.email LIKE '%@login.internal'
ORDER BY p.position;
```

**Expected Result:**
| full_name | username | email | position | auth_email |
|-----------|----------|-------|----------|------------|
| Super Administrator | superadmin | superadmin@login.internal | superadmin | superadmin@login.internal |
| Leader Alpha | leader_alpha | leader_alpha@login.internal | leader | leader_alpha@login.internal |
| Host Live 1 | host1 | host1@login.internal | staff_host_live | host1@login.internal |

### Step 4: Clear Cache & Restart

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** halaman (Ctrl+Shift+R)
3. **Restart development server**:
   ```bash
   npm run dev
   # atau
   yarn dev
   # atau
   bun dev
   ```

### Step 5: Test Login

Gunakan kredensial demo ini:

| Role | Email | Password |
|------|-------|----------|
| **Superadmin** | `superadmin@login.internal` | `password123` |
| **Leader** | `leader_alpha@login.internal` | `password123` |
| **Staff** | `host1@login.internal` | `password123` |

## 🔍 Debugging Jika Masih Error

### Cek Console Browser

Buka **Developer Tools** (F12) → **Console** dan lihat error messages:

#### Error: "CORS policy blocked"
**Solusi:** Tambahkan domain di Supabase Dashboard → Settings → API → CORS Origins

#### Error: "Invalid JWT"
**Solusi:** 
```sql
-- Reset semua sessions
DELETE FROM auth.sessions;
DELETE FROM auth.refresh_tokens;
```

#### Error: "Row Level Security policy violation"
**Solusi:** Disable RLS untuk testing:
```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

### Cek Environment Variables

Pastikan file `.env` sesuai:

```env
VITE_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

**Cara cek:**
1. Supabase Dashboard → Settings → API  
2. Copy **Project URL** dan **anon/public key**
3. Paste ke file `.env`
4. Restart development server

### Cek Network Tab

1. Buka **Developer Tools** → **Network**
2. Filter: XHR/Fetch
3. Coba login dan lihat request ke Supabase
4. Jika status **500**: masalah di database
5. Jika status **404**: URL atau endpoint salah
6. Jika status **401**: masalah authentication

## 🛠️ File yang Sudah Diperbaiki

✅ **src/pages/Login.tsx** - Form login menggunakan email  
✅ **src/hooks/useAuth.tsx** - Authentication logic dengan email  
✅ **src/types/database.ts** - Database types sesuai skema  
✅ **fix-database-schema.sql** - Script perbaikan database  

## 📋 Checklist Troubleshooting

- [ ] Database script sudah dijalankan
- [ ] Kolom `email` sudah ada di tabel `profiles`
- [ ] Demo users sudah terbuat di `auth.users`
- [ ] Environment variables sudah benar
- [ ] Browser cache sudah dibersihkan
- [ ] Development server sudah di-restart
- [ ] RLS policies tidak memblokir akses
- [ ] CORS sudah dikonfigurasi
- [ ] Network requests berhasil (status 200)

## 🆘 Jika Masih Bermasalah

### Option 1: Reset Database

⚠️ **HATI-HATI: Ini akan menghapus semua data!**

```sql
-- Drop dan recreate tabel profiles
DROP TABLE IF EXISTS public.profiles CASCADE;
-- Kemudian buat ulang sesuai schema asli
```

### Option 2: Rollback ke Username Login

Edit `src/hooks/useAuth.tsx`:

```typescript
const signIn = async (username: string, password: string) => {
  const email = `${username}@login.internal`;
  // ... rest of code
};
```

Dan edit `src/pages/Login.tsx` untuk kembali menggunakan username field.

### Option 3: Kontak Developer

**Developer:** Ramdani Fahmy  
**Email:** ramdanifahmy2023@gmail.com  
**GitHub:** [AffiliateTracker-FSSayyida](https://github.com/ramdanifahmy2023/AffiliateTracker-FSSayyida)  

## ✅ Expected Success

Setelah berhasil:
1. Login page terbuka tanpa error console
2. Bisa login dengan email demo
3. Redirect ke dashboard setelah login
4. User profile data muncul dengan benar
5. Logout berfungsi normal

---

**Good luck, Tuan! 🚀**

Jika ada kendala lain, jangan ragu untuk bertanya. Saya siap membantu menyelesaikan project AffiliateTracker ini.