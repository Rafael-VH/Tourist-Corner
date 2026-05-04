import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Image,
  Trash2,
  X,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ImageUploadProps {
  images: string[];
  coverImage?: string;
  onImagesChange: (images: string[]) => void;
  onCoverChange: (coverImage: string) => void;
  onUpload: (files: File[]) => Promise<string[]>;
  onDelete: (imageUrl: string) => Promise<void>;
  maxImages?: number;
  maxSizeMB?: number;
}

export function ImageUpload({
  images,
  coverImage,
  onImagesChange,
  onCoverChange,
  onUpload,
  onDelete,
  maxImages = 20,
  maxSizeMB = 10,
}: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return `${file.name} no es una imagen`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `${file.name} excede ${maxSizeMB}MB`;
    }
    return null;
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (images.length + fileArray.length > maxImages) {
        setError(`Maximo ${maxImages} imagenes permitidas`);
        return;
      }

      const errors = fileArray.map(validateFile).filter(Boolean);
      if (errors.length > 0) {
        setError(errors.join(", "));
        return;
      }

      setError("");
      setUploading(true);
      setUploadProgress(0);

      try {
        const validFiles = fileArray.filter((f) => validateFile(f) === null);
        const uploadedUrls: string[] = [];

        for (let i = 0; i < validFiles.length; i++) {
          const urls = await onUpload([validFiles[i]]);
          uploadedUrls.push(...urls);
          setUploadProgress(((i + 1) / validFiles.length) * 100);
        }

        onImagesChange([...images, ...uploadedUrls]);
        if (!coverImage && uploadedUrls.length > 0) {
          onCoverChange(uploadedUrls[0]);
        }
      } catch (err: unknown) {
        setError((err as Error).message || "Error al subir imagenes");
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [images, maxImages, maxSizeMB, onUpload, onCoverChange, coverImage],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  const handleDelete = async (imageUrl: string) => {
    try {
      await onDelete(imageUrl);
      const newImages = images.filter((img) => img !== imageUrl);
      onImagesChange(newImages);
      if (coverImage === imageUrl) {
        onCoverChange(newImages[0] || "");
      }
    } catch (err: unknown) {
      setError((err as Error).message || "Error al eliminar imagen");
    }
  };

  const handleSetCover = (imageUrl: string) => {
    onCoverChange(imageUrl);
  };

  return (
    <div>
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging
            ? "border-[#E8850C] bg-[#FFF8F1] dark:bg-[#242B35]"
            : "border-[#E8D9C8] dark:border-[#2D3748] hover:border-[#E8850C]/50"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        <Upload className="w-8 h-8 mx-auto text-[#96785A] dark:text-[#64748B] mb-2" />
        <p className="text-sm text-[#5E4836] dark:text-[#94A3B8] font-medium">
          Arrastra imagenes aqui o haz clic para seleccionar
        </p>
        <p className="text-xs text-[#96785A] dark:text-[#64748B] mt-1">
          Se convertiran a WebP automaticamente — Max {maxSizeMB}MB
        </p>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="mt-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-[#E8850C] animate-spin" />
          <div className="flex-1 bg-[#FDF8F3] dark:bg-[#242B35] rounded-full h-2">
            <div
              className="bg-[#E8850C] h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-xs text-[#96785A] dark:text-[#64748B]">
            {Math.round(uploadProgress)}%
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button
            onClick={() => setError("")}
            className="ml-auto p-0.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {images.map((img, index) => (
              <motion.div
                key={img}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group rounded-xl overflow-hidden aspect-square"
              >
                <img
                  src={img}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Cover badge */}
                {img === coverImage && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-[#E8850C] text-white text-xs font-medium rounded-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    Portada
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {img !== coverImage && (
                    <button
                      onClick={() => handleSetCover(img)}
                      className="p-2 bg-white/90 rounded-lg text-[#E8850C] hover:bg-white transition-colors"
                      title="Establecer como portada"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(img)}
                    className="p-2 bg-white/90 rounded-lg text-red-500 hover:bg-white transition-colors"
                    title="Eliminar imagen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add more button */}
          {images.length < maxImages && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="border-2 border-dashed border-[#E8D9C8] dark:border-[#2D3748] rounded-xl aspect-square flex flex-col items-center justify-center gap-2 text-[#96785A] dark:text-[#64748B] hover:border-[#E8850C] hover:text-[#E8850C] transition-colors"
            >
              <Image className="w-8 h-8" />
              <span className="text-xs font-medium">Agregar</span>
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !uploading && (
        <div className="mt-4 p-8 text-center bg-[#FDF8F3] dark:bg-[#242B35] rounded-xl">
          <Image className="w-12 h-12 mx-auto text-[#D4BEA5] dark:text-[#2D3748] mb-2" />
          <p className="text-sm text-[#96785A] dark:text-[#64748B]">
            No hay imagenes aun
          </p>
        </div>
      )}
    </div>
  );
}
