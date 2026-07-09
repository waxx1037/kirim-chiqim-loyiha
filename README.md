# Kirim-Chiqim | Moliya Boshqaruv Tizimi

## Texnologiyalar
- Next.js 15 (App Router)
- Tailwind CSS + Premium Design System
- shadcn/ui komponentlar
- Prisma ORM + PostgreSQL
- React Hook Form + Zod validation
- Recharts grafiklar
- Lucide React ikonlar
- Sonner toast bildirishnomalar

## O'rnatish

### 1. Bog'liqliklarni o'rnatish
```bash
npm install
```

### 2. .env fayl yaratish
```bash
cp .env.example .env
```

.env faylda DATABASE_URL ni to'ldiring:
```
DATABASE_URL="postgresql://username:password@localhost:5432/kirim_chiqim"
```

### 3. Ma'lumotlar bazasini yaratish
```bash
npm run db:push
npm run db:seed
```

### 4. Loyihani ishga tushirish
```bash
npm run dev
```

Brauzerda: http://localhost:3000

## Sahifalar

- Dashboard  /           - Statistika va grafiklar
- Kirimlar   /kirim      - Kirimlarni boshqarish
- Chiqimlar  /chiqim     - Chiqimlarni boshqarish
- Kirim kategoriyalar    /kirim-kategoriyalar
- Chiqim kategoriyalar   /chiqim-kategoriyalar
- Hisobotlar /hisobotlar - Excel/PDF eksport
- Arxiv      /arxiv      - Eski ma'lumotlar
- Sozlamalar /sozlamalar - Tizim sozlamalari
