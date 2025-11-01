# 🚀 AffiliateTracker Deployment Guide

## Masalah yang Diperbaiki

**KENDALA SEBELUMNYA**: Login sukses namun tidak masuk ke dashboard (tetap diam di halaman login)

**SOLUSI YANG DITERAPKAN**:
1. ✅ Fixed routing conflict di `AppRouter.tsx`
2. ✅ Improved authentication flow di `useAuth.tsx`
3. ✅ Enhanced login navigation di `Login.tsx`
4. ✅ Updated protected route handling di `ProtectedRoute.tsx`
5. ✅ Comprehensive database fixes di `supabase-fixes.sql`

## 📋 Langkah Deployment

### 1. Database Setup (Supabase)

**PENTING**: Jalankan script SQL berikut di Supabase SQL Editor:

```sql
-- Copy dan jalankan seluruh isi file supabase-fixes.sql
-- File ini sudah tersedia di root repository
```

Script ini akan:
- ✅ Membuat semua ENUM types yang diperlukan
- ✅ Memperbaiki RLS (Row Level Security) policies
- ✅ Membuat demo users untuk testing
- ✅ Setup proper indexing
- ✅ Enable proper permissions

### 2. Environment Variables

Pastikan file `.env` berisi:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Vercel Deployment

1. **Connect Repository ke Vercel**
   - Login ke Vercel
   - Import repository dari GitHub
   - Pilih `ramdanifahmy2023/AffiliateTracker-FSSayyida`

2. **Environment Variables di Vercel**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Tunggu proses build selesai

## 🧪 Testing Login

Setelah deployment, test dengan demo accounts berikut:

| Role | Username | Password | Access Level |
|------|----------|----------|-------------|
| **Superadmin** | `superadmin` | `password123` | Full CRUD access semua page |
| **Leader** | `leader_alpha` | `password123` | CRUD sebagian besar page |
| **Admin** | `admin1` | `password123` | Create/Read terbatas |
| **Staff Host** | `host1` | `password123` | Absensi & Laporan Harian only |
| **Staff Creator** | `creator1` | `password123` | Absensi & Laporan Harian only |
| **Viewer** | `viewer1` | `password123` | Read-only semua page |

## 🔧 Troubleshooting

### Masalah: Login masih tidak redirect ke dashboard

**Solusi**:
1. Buka Browser DevTools (F12)
2. Check Console untuk error messages
3. Verify di Network tab apakah API calls berhasil
4. Pastikan Supabase URL dan Key benar

### Masalah: "Profile tidak ditemukan" setelah login

**Solusi**:
1. Jalankan ulang `supabase-fixes.sql`
2. Verify di Supabase Dashboard > Authentication > Users
3. Check table `profiles` apakah data ada

```sql
-- Query untuk check demo users
SELECT u.email, p.full_name, p.username, p.position 
FROM auth.users u 
JOIN profiles p ON u.id = p.id 
WHERE u.email LIKE '%@login.internal';
```

### Masalah: RLS Policy Error

**Solusi**:
1. Disable RLS sementara untuk testing:

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

2. Atau update policy menjadi lebih permissive:

```sql
DROP POLICY "Enable all access for authenticated users" ON profiles;
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true);
```

### Masalah: Build Error di Vercel

**Solusi**:
1. Check Node.js version compatibility
2. Pastikan semua dependencies ter-install
3. Clear Vercel cache dan redeploy

## 📊 Database Schema Verification

Untuk memastikan database setup benar, jalankan queries berikut:

```sql
-- 1. Check ENUMs
SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname;

-- 2. Check Tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' ORDER BY table_name;

-- 3. Check RLS Policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' ORDER BY tablename;

-- 4. Check Demo Users
SELECT 
    u.email,
    p.full_name,
    p.username,
    p.position,
    p.group_id
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email LIKE '%@login.internal'
ORDER BY p.position;
```

## 🔐 Security Notes

1. **Production Environment**:
   - Ganti password demo users
   - Setup proper RLS policies per role
   - Enable audit logging

2. **Environment Variables**:
   - Jangan commit `.env` ke git
   - Use Vercel environment variables untuk production

3. **Database Security**:
   - Regular backup Supabase database
   - Monitor access logs
   - Setup database alerts

## 📱 PWA Setup (Optional)

Untuk mengaktifkan PWA features:

1. Verify `manifest.json` ada di public folder
2. Setup service worker
3. Test PWA di mobile device
4. Enable push notifications

## 🚦 Status Check

Setelah deployment, verify:

- [ ] ✅ Login redirect ke dashboard works
- [ ] ✅ All demo accounts can login
- [ ] ✅ Role-based access control works
- [ ] ✅ Database queries work without errors
- [ ] ✅ No console errors in browser
- [ ] ✅ Mobile responsive design works

## 📞 Support

Jika masih ada masalah:

1. Check browser console errors
2. Check Supabase logs
3. Verify environment variables
4. Test dengan incognito/private browsing

---

**Last Updated**: November 1, 2024  
**Version**: 1.0.0  
**Status**: ✅ Login Issue Fixed