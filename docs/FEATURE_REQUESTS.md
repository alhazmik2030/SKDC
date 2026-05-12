# طلبات الميزات الجديدة — من خالد (2026-05-12)

## 1. تفاعل الوحدات (Phase 5 — 3D Editor)
- **فتح/قفل الأبواب** حسب التصميم
- **انفتاح/انغلاق الأدراج** بـ animation
- معاينة تفاعلية: العميل يضغط الباب فيفتح ليرى الداخل

## 2. الإضاءة والـ LED (Phase 5)
- **حفر مجرى الـ LED** على القطع (groove operations في الـ CutPlan)
- **إضافة إضاءة** كعنصر في التصميم (LED strip / spot)
- ربط الإضاءة بالمصدر الكهربائي (placement guide)
- تأثير الإضاءة في render الـ 3D

## 3. الزجاج (Phase 4-5)
- **MaterialType.GLASS** يضاف للـ schema
- درجات الزجاج: شفاف، مصنفر (Frosted)، ملون، Reflective
- سماكات: 4mm / 5mm / 6mm / 8mm / 10mm / 12mm
- الألوان: شفاف، بني، رمادي (smoked)، أبيض حليبي، أسود
- في الـ 3D: rendering مختلف للزجاج

## 4. أنماط التصميم (Phase 4)
- **Project.designStyle** enum جديد:
  - MODERN — مودرن
  - CLASSIC — كلاسيك
  - NEO_CLASSIC — نيو كلاسيك
  - INDUSTRIAL — صناعي (مستقبلاً)
  - SCANDINAVIAN — اسكندنافي (مستقبلاً)
- كل نمط يقترح: ألوان، أنواع أبواب، يدابض، إكسسوارات
- فلتر للقوالب حسب النمط

## كيف ندمجها

### Phase 4 المباشرة (الزجاج + أنماط):
1. إضافة GLASS لـ MaterialType enum + apply_migration
2. إضافة `designStyle` لـ Project model
3. UI: dropdown اختيار النمط عند إنشاء المشروع
4. UI: حقل سماكة + درجة للخامات من نوع GLASS

### Phase 5 (التفاعل + LED):
1. JSON schema للـ Unit options:
   ```json
   {
     "doors": { "count": 2, "openable": true, "hingeSide": "left" },
     "drawers": { "count": 0, "slideType": "soft-close" },
     "led": { "enabled": true, "type": "strip", "color": "#FFFFFF", "wattsPerM": 12 }
   }
   ```
2. PieceOperation type: `GROOVE` يدعم LED grooves (موجود بالفعل في types.ts)
3. 3D animation: framer-motion-3d أو Three.js animation للأبواب/الأدراج

---

**كل هذي ستُنفذ تباعاً.** الأولوية الآن: Phase 3 (CRUD) → Phase 4 (2D editor + الزجاج + أنماط) → Phase 5 (3D + LED + تفاعل).
