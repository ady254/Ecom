'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, ImagePlus } from 'lucide-react';
import { productsAdminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';

interface Props {
  images: string[];
  onChange: (urls: string[]) => void;
}

export default function ImageUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const valid = Array.from(files).filter((f) => {
      if (!validTypes.includes(f.type)) {
        toast.error(`${f.name} is not a valid image type`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        toast.error(`${f.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (!valid.length) return;

    setUploading(true);
    try {
      const urls = await productsAdminApi.uploadImages(valid);
      onChange([...images, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? 's' : ''} uploaded`);
    } catch {
      toast.error('Image upload failed — check API is running');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {/* Upload zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          uploading
            ? 'border-[var(--color-gold)] bg-[rgba(207,169,106,0.05)]'
            : 'border-gray-200 hover:border-[var(--color-gold)] hover:bg-[rgba(207,169,106,0.03)]'
        }`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-[var(--color-gold-dark)]">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm font-medium">Uploading to Cloudinary…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <ImagePlus size={28} />
            <p className="text-sm">
              <span className="font-semibold text-[var(--color-navy)]">Click to upload</span> or drag & drop
            </p>
            <p className="text-xs">JPEG, PNG, WebP — max 5MB each, up to 10 images</p>
          </div>
        )}
      </div>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
          {images.map((url, i) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
              <Image src={url} alt={`Product image ${i + 1}`} fill sizes="100px" className="object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-[var(--color-navy)] text-white px-1.5 py-0.5 rounded font-medium">
                  Main
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {/* Add more slot */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-[var(--color-gold)] hover:text-[var(--color-gold-dark)] transition-colors"
          >
            <Upload size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
