# GLB Storage Setup

The `KitchenTemplate` model stores public URLs to `.glb` files served from
Supabase Storage. The bucket below must exist before admins can register
templates through `/dashboard/admin/templates`.

## 1. Create the bucket

In the Supabase dashboard → **Storage** → **New bucket**:

- **Name:** `kitchen-models`
- **Public:** **ON** (read-only — anyone with the URL can GET a `.glb`).
- **File size limit:** at least `20 MB` (real Sketchfab kitchen models run 2-15 MB).

## 2. Policies

Add the following policies on `storage.objects` for this bucket:

```sql
-- Anyone can read (the bucket is public, but explicit policy keeps it intentional)
create policy "Public read on kitchen-models"
on storage.objects
for select
to public
using ( bucket_id = 'kitchen-models' );

-- Authenticated users can upload (workshop staff). Admin enforcement of "who
-- can register a template" happens at the application layer via the
-- requireAdmin() helper in lib/actions/templates-glb.ts.
create policy "Authenticated upload on kitchen-models"
on storage.objects
for insert
to authenticated
with check ( bucket_id = 'kitchen-models' );
```

## 3. Folder structure

Organise uploads under category-level prefixes so the bucket stays browsable:

```
kitchen-models/
├── cabinets/
│   ├── lower/
│   ├── upper/
│   ├── corner/
│   ├── tall/
│   └── drawer/
├── appliances/
└── accessories/
```

## 4. Workflow

The admin page (`/dashboard/admin/templates`) takes a **public URL** rather
than uploading directly — `@supabase/supabase-js` is not yet a project
dependency. To register one of the 20 downloaded Sketchfab kitchens:

1. Open the Supabase dashboard → Storage → `kitchen-models`.
2. Upload the `.glb` into the matching folder (e.g.
   `appliances/whirlpool-fridge.glb`).
3. Click the file → **Copy URL** (public URL).
4. Paste that URL into the admin form along with name, dimensions, license,
   and attribution. Submit.

The template is immediately available in the Studio palette under the
"قوالب من المكتبة" section.

## 5. Pre-flight checks before uploading

Run `node scripts/inspect-glb.mjs <path-to.glb>` to print the triangle count
and file size you'll need to enter in the form. Anything over ~80k triangles
should be decimated before upload — the scene renders ten or more units at a
time, so each GLB needs to stay light.
