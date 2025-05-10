"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onChange: (file: File | null) => void;
  value?: File | string | null;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
  previewClassName?: string;
  buttonText?: string;
  description?: string;
}

export function FileUpload({
  onChange,
  value,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  disabled = false,
  className,
  previewClassName,
  buttonText = "Upload Image",
  description = "Drag and drop an image, or click to browse",
  ...props
}: FileUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Initialize preview if value is a string URL
  React.useEffect(() => {
    if (typeof value === "string" && value) {
      setPreview(value);
    } else if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [value]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const rejectionErrors = rejectedFiles[0].errors.map((err: any) => err.message).join(", ");
        setError(rejectionErrors);
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onChange(file);
        setError(null);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [accept]: [],
    },
    maxSize,
    disabled,
    multiple: false,
  });

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setPreview(null);
  };

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <input {...getInputProps()} />

        {preview ? (
          <div className="relative">
            <div className={cn("relative mx-auto overflow-hidden rounded-md", previewClassName || "max-w-xs max-h-64")}>
              <img
                src={preview}
                alt="Preview"
                className="object-cover w-full h-full"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Click or drag to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            {isDragActive ? (
              <Upload className="h-10 w-10 text-primary mb-2" />
            ) : (
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            )}
            <p className="text-sm font-medium mb-1">{buttonText}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
