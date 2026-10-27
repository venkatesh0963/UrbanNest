import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Star,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../api/client';
import type { ListingPhoto } from '../types';

const CURATED_SAMPLE_PHOTOS = [
  {
    label: 'Modern Twin Room',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Bright Student Studio',
    url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Executive Suite',
    url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Study & Lounge Space',
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
  },
];

const MAX_PHOTOS = 12;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Failed to read file "${file.name}"`));
    reader.readAsDataURL(file);
  });
}

interface PhotoDropzoneProps {
  photos: ListingPhoto[];
  onChange: (nextPhotos: ListingPhoto[]) => void;
}

export const PhotoDropzone: React.FC<PhotoDropzoneProps> = ({ photos, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [draggedCardIdx, setDraggedCardIdx] = useState<number | null>(null);

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  const ensurePrimarySet = (list: ListingPhoto[]): ListingPhoto[] => {
    if (list.length === 0) return list;
    const hasPrimary = list.some((p) => p.isPrimary);
    if (!hasPrimary) {
      return list.map((p, idx) => ({ ...p, isPrimary: idx === 0 }));
    }
    return list;
  };

  const handleFilesSelected = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setUploadError(null);
    setUploadSuccess(null);

    if (photos.length + files.length > MAX_PHOTOS) {
      setUploadError(`You can attach up to ${MAX_PHOTOS} photos per property.`);
      return;
    }

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type.toLowerCase())) {
        setUploadError(
          `"${file.name}" is not a supported image format. Please use JPG, PNG, WEBP, AVIF, or GIF.`
        );
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(`"${file.name}" exceeds the 8 MB maximum file size.`);
        return;
      }
    }

    setUploading(true);
    try {
      const prepared = await Promise.all(
        files.map(async (file) => ({
          fileName: file.name,
          mimeType: file.type,
          dataUrl: await readFileAsDataUrl(file),
          caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' '),
        }))
      );

      const response = await api.uploadOwnerPhotos(prepared);
      const combined = ensurePrimarySet([...photos, ...response.photos]);
      onChange(combined);
      setUploadSuccess(
        `Uploaded ${response.photos.length} photo${response.photos.length > 1 ? 's' : ''} successfully.`
      );
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload photos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleSetPrimary = (index: number) => {
    const updated = photos.map((p, idx) => ({
      ...p,
      isPrimary: idx === index,
    }));
    // Also move primary photo to the first slot if desired or keep order with badge
    onChange(updated);
  };

  const handleMovePhoto = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= photos.length) return;
    const copy = [...photos];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    onChange(copy);
  };

  const handleRemovePhoto = (index: number) => {
    const remaining = photos.filter((_, idx) => idx !== index);
    onChange(ensurePrimarySet(remaining));
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const copy = [...photos];
    copy[index] = { ...copy[index], caption };
    onChange(copy);
  };

  const handleAddPhotoUrl = () => {
    if (!newPhotoUrl.trim()) return;
    if (photos.length >= MAX_PHOTOS) {
      setUploadError(`Maximum ${MAX_PHOTOS} photos reached.`);
      return;
    }
    const next = ensurePrimarySet([
      ...photos,
      {
        url: newPhotoUrl.trim(),
        caption: newPhotoCaption.trim() || undefined,
      },
    ]);
    onChange(next);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  return (
    <div className="space-y-5">
      {/* Drag-and-Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDraggingOver
            ? 'border-forest-600 bg-forest-50/80 ring-4 ring-forest-600/15'
            : 'border-neutral-300 bg-neutral-50/70 hover:border-forest-600 hover:bg-forest-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center py-2">
            <Loader2 className="h-9 w-9 animate-spin text-forest-700" />
            <p className="mt-3 text-sm font-semibold text-neutral-900">
              Uploading & optimizing photos...
            </p>
            <p className="mt-1 text-xs text-neutral-500">Please wait a moment</p>
          </div>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-forest-700 shadow-sm border border-neutral-200">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="mt-3 text-sm font-semibold text-neutral-900">
              Drag & drop property photos here, or{' '}
              <span className="text-forest-700 underline">browse files</span>
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              Supports JPG, PNG, WEBP, AVIF up to 8 MB each • Up to {MAX_PHOTOS} photos ({photos.length}/
              {MAX_PHOTOS} added)
            </p>
          </>
        )}
      </div>

      {/* Feedback alerts */}
      {uploadError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-forest-200 bg-forest-50 px-3.5 py-2.5 text-xs font-medium text-forest-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-forest-700" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {/* Photo Grid with Reordering, Primary Cover Badge & Inline Captions */}
      {photos.length > 0 && (
        <div>
          <div className="mb-2.5 flex items-center justify-between text-xs text-neutral-500">
            <span>
              Tip: Drag cards to reorder or click <strong>Cover</strong> to choose the main photo
              shown in search results.
            </span>
            <span className="font-semibold text-neutral-700">
              {photos.length} / {MAX_PHOTOS} Photos
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {photos.map((photo, idx) => (
              <div
                key={`${photo.url}-${idx}`}
                draggable
                onDragStart={() => setDraggedCardIdx(idx)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedCardIdx === null || draggedCardIdx === idx) return;
                  const reordered = [...photos];
                  const [moved] = reordered.splice(draggedCardIdx, 1);
                  reordered.splice(idx, 0, moved);
                  onChange(reordered);
                  setDraggedCardIdx(null);
                }}
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-2xs transition-all ${
                  photo.isPrimary
                    ? 'border-forest-700 ring-2 ring-forest-600/20'
                    : 'border-neutral-200'
                }`}
              >
                <div className="relative h-36 w-full bg-neutral-100">
                  <img
                    src={photo.url}
                    alt={photo.caption || `Property photo ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />

                  {/* Primary / Cover Button */}
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold shadow-sm transition-all ${
                      photo.isPrimary
                        ? 'bg-forest-700 text-white'
                        : 'bg-white/90 text-neutral-700 hover:bg-white'
                    }`}
                  >
                    <Star
                      className={`h-3 w-3 ${photo.isPrimary ? 'fill-white text-white' : ''}`}
                    />
                    {photo.isPrimary ? 'Cover Photo' : 'Set Cover'}
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute right-2.5 top-2.5 rounded-lg bg-neutral-900/75 p-1.5 text-white transition-colors hover:bg-red-600"
                    title="Remove photo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  {/* Reorder Arrows */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMovePhoto(idx, -1)}
                      className="rounded-md bg-white/90 p-1 text-neutral-700 shadow-2xs hover:bg-white disabled:opacity-40"
                      title="Move left"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === photos.length - 1}
                      onClick={() => handleMovePhoto(idx, 1)}
                      className="rounded-md bg-white/90 p-1 text-neutral-700 shadow-2xs hover:bg-white disabled:opacity-40"
                      title="Move right"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Inline Caption Input */}
                <div className="p-2.5">
                  <input
                    type="text"
                    value={photo.caption || ''}
                    onChange={(e) => handleCaptionChange(idx, e.target.value)}
                    placeholder="Add caption (e.g. Double sharing bedroom)"
                    className="w-full rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-800 placeholder:text-neutral-400 focus:border-forest-600 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Secondary: Add by URL or Quick Sample Presets */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 space-y-3">
        <p className="text-xs font-semibold text-neutral-700">
          Or paste an external image URL / use sample presets:
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
          <div className="sm:col-span-6">
            <input
              type="url"
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="input-field py-2 text-xs"
            />
          </div>
          <div className="sm:col-span-4">
            <input
              type="text"
              value={newPhotoCaption}
              onChange={(e) => setNewPhotoCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="input-field py-2 text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleAddPhotoUrl}
              className="btn-secondary w-full py-2 text-xs"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Add URL
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-neutral-500">Quick sample rooms:</span>
          {CURATED_SAMPLE_PHOTOS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                if (photos.length >= MAX_PHOTOS) return;
                onChange(
                  ensurePrimarySet([
                    ...photos,
                    { url: preset.url, caption: preset.label },
                  ])
                );
              }}
              className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 font-medium text-neutral-700 hover:bg-neutral-100"
            >
              + {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
