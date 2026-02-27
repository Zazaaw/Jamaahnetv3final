# File Upload Implementation - CreateTimelineScreen.tsx

## ✅ Implementation Summary

Successfully replaced the URL text input with a proper file upload mechanism using Supabase Storage.

---

## 🔧 Changes Made

### 1. Updated State Management

**Added new state variables:**
```typescript
const [imageFile, setImageFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string>(editPost?.image || '');
const [uploading, setUploading] = useState(false);
```

**Removed:**
- Old `image` state (for URL input) - replaced with file-based approach

---

### 2. File Input UI

**Replaced:**
```typescript
// OLD: URL text input
<input type="url" value={image} onChange={...} />
```

**With:**
```typescript
// NEW: File upload input
<input 
  type="file" 
  accept="image/*" 
  onChange={handleFileSelect}
  disabled={loading || uploading}
/>
```

**Added:**
- Helper text: "Maksimal ukuran file: 5MB"
- Image preview with remove button
- Disabled state during upload/submit

---

### 3. File Size Validation (5MB Maximum)

**Implementation:**
```typescript
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    toast.error('Ukuran gambar maksimal 5MB!');
    e.target.value = ''; // Clear the input
    return; // Do NOT set the state
  }

  // Set file and create preview
  setImageFile(file);
  setImagePreview(URL.createObjectURL(file));
};
```

**Features:**
- ✅ Validates file size immediately on selection
- ✅ Shows error toast if file exceeds 5MB
- ✅ Clears the input field
- ✅ Does NOT set state for oversized files
- ✅ Creates local preview URL for valid files

---

### 4. Image Preview with Remove Button

**Preview UI:**
```typescript
{imagePreview && (
  <motion.div className="mt-3 relative">
    <img 
      src={imagePreview} 
      alt="Preview" 
      className="w-full h-48 object-cover rounded-2xl"
    />
    <button
      type="button"
      onClick={handleClearImage}
      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg"
    >
      <X className="w-4 h-4" />
    </button>
  </motion.div>
)}
```

**Clear Function:**
```typescript
const handleClearImage = () => {
  setImageFile(null);
  setImagePreview('');
  setImage('');
};
```

**Features:**
- ✅ Shows preview immediately after file selection
- ✅ Red X button to clear/remove image
- ✅ Smooth animations (motion.div)
- ✅ Responsive design

---

### 5. Updated Submit Function with Upload

**Upload Flow:**
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validation...
  
  setLoading(true);
  
  try {
    let imageUrl = image; // Use existing image URL if available

    // If there's a new file selected, upload it first
    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      
      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase
        .storage
        .from('timeline-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase
        .storage
        .from('timeline-images')
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
    }

    // Insert/Update post with imageUrl
    // ...
  } catch (err) {
    // Error handling...
  } finally {
    setLoading(false);
  }
};
```

**Features:**
- ✅ Uploads file to `timeline-images` bucket
- ✅ Uses unique filename: `${Date.now()}-${imageFile.name}`
- ✅ Retrieves public URL after upload
- ✅ Inserts URL into `image` column in `timeline_posts` table
- ✅ Handles loading states (button disabled during upload)
- ✅ Error handling with toast notifications

---

## 🎯 Key Features

### User Experience
1. **File Selection:**
   - Click file input → select image from device
   - Instant preview displayed
   - Clear file size limit shown (5MB)

2. **Validation:**
   - Files over 5MB rejected immediately
   - Error toast: "Ukuran gambar maksimal 5MB!"
   - Input cleared automatically

3. **Preview:**
   - Local preview using `URL.createObjectURL()`
   - Remove button to clear selection
   - Smooth animations

4. **Submit:**
   - File uploaded to Supabase Storage
   - Public URL retrieved and saved to database
   - Loading state during upload (button disabled)
   - Success/error toast notifications

### Technical Benefits
- ✅ Direct file upload (no external URLs needed)
- ✅ Files stored in Supabase Storage bucket
- ✅ Unique filenames prevent collisions
- ✅ Public URLs for easy access
- ✅ Proper error handling
- ✅ Loading states prevent double submission

---

## 📂 Supabase Storage Configuration

**Bucket Name:** `timeline-images`

**Required Settings:**
- ✅ Bucket must be **public** (for public URL access)
- ✅ File size limit: Set to 5MB or higher in Supabase dashboard
- ✅ Allowed MIME types: `image/*`

**Storage Policies (RLS):**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'timeline-images');

-- Allow public read access
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'timeline-images');
```

---

## 🔄 Upload Flow Diagram

```
User selects file
    ↓
Validate size (< 5MB)
    ↓
✅ Valid → Show preview
    ↓
User clicks "Posting Sekarang"
    ↓
Upload to Supabase Storage
    ↓
Get public URL
    ↓
Insert post with image URL
    ↓
Success! 🎉
```

**If file > 5MB:**
```
User selects file
    ↓
Validate size (> 5MB)
    ↓
❌ Invalid → Show error toast
    ↓
Clear input field
    ↓
State NOT updated
```

---

## 🧪 Testing Checklist

- [ ] File input accepts images only
- [ ] Files under 5MB are accepted
- [ ] Files over 5MB show error toast
- [ ] Files over 5MB clear input automatically
- [ ] Preview displays correctly
- [ ] Remove button clears preview and file
- [ ] Upload occurs on form submit
- [ ] Public URL is retrieved correctly
- [ ] Post is saved with image URL
- [ ] Loading states work (button disabled)
- [ ] Error handling works (network errors, etc.)
- [ ] Success toast appears after posting

---

## 📝 Database Column

**Table:** `timeline_posts`
**Column:** `image` (TEXT, nullable)

Stores the public URL from Supabase Storage:
```
https://[project-id].supabase.co/storage/v1/object/public/timeline-images/[filename]
```

---

## 🚀 Next Steps (Optional Enhancements)

1. **Image Compression:**
   - Add client-side image compression before upload
   - Use libraries like `browser-image-compression`

2. **Multiple Images:**
   - Allow users to upload multiple images
   - Store as array in database

3. **Progress Indicator:**
   - Show upload progress percentage
   - Use Supabase Storage upload progress callback

4. **Image Optimization:**
   - Add Supabase Image Transformation
   - Create thumbnails automatically

5. **Delete Old Images:**
   - When user updates post with new image
   - Delete old file from storage to save space
