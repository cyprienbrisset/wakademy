"use client"

import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { motion } from "framer-motion"
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void
  acceptedFileTypes?: string[]
  maxFileSize?: number
  multiple?: boolean
  className?: string
}

export function FileUploadZone({
  onFilesSelected,
  acceptedFileTypes = [".mp4", ".mp3", ".pdf", ".docx", ".pptx"],
  maxFileSize = 100 * 1024 * 1024, // 100MB
  multiple = true,
  className,
}: FileUploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: "uploading" | "success" | "error" }>({})
  const [mounted, setMounted] = useState(false)

  // Éviter les problèmes d'hydratation
  useEffect(() => {
    setMounted(true)
  }, [])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setUploadedFiles((prev) => [...prev, ...acceptedFiles])
      onFilesSelected(acceptedFiles)

      // Simuler l'upload avec progress
      acceptedFiles.forEach((file) => {
        const fileId = `${file.name}-${file.size}`
        setUploadStatus((prev) => ({ ...prev, [fileId]: "uploading" }))

        // Simuler le progress
        let progress = 0
        const interval = setInterval(() => {
          progress += Math.random() * 15
          if (progress >= 100) {
            progress = 100
            setUploadStatus((prev) => ({ ...prev, [fileId]: "success" }))
            clearInterval(interval)
          }
          setUploadProgress((prev) => ({ ...prev, [fileId]: progress }))
        }, 200)
      })
    },
    [onFilesSelected],
  )

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    multiple,
  })

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles((prev) => prev.filter((file) => file !== fileToRemove))
    const fileId = `${fileToRemove.name}-${fileToRemove.size}`
    setUploadProgress((prev) => {
      const newProgress = { ...prev }
      delete newProgress[fileId]
      return newProgress
    })
    setUploadStatus((prev) => {
      const newStatus = { ...prev }
      delete newStatus[fileId]
      return newStatus
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "mp4":
      case "avi":
      case "mov":
        return "🎥"
      case "mp3":
      case "wav":
      case "flac":
        return "🎵"
      case "pdf":
        return "📄"
      case "docx":
      case "doc":
        return "📝"
      case "pptx":
      case "ppt":
        return "📊"
      default:
        return "📁"
    }
  }

  // Rendu simple côté serveur
  if (!mounted) {
    return (
      <div className={cn("border-2 border-dashed border-muted-foreground/25 rounded-lg p-8", className)}>
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <div className="mt-4">
            <p className="text-lg font-medium">Glissez vos fichiers ici</p>
            <p className="text-sm text-muted-foreground mt-1">
              ou cliquez pour sélectionner des fichiers
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          className,
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <div className="mt-4">
          <p className="text-lg font-medium">
            {isDragActive ? "Déposez vos fichiers ici" : "Glissez vos fichiers ici"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            ou cliquez pour sélectionner des fichiers
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Formats acceptés: {acceptedFileTypes.join(", ")} • Max {formatFileSize(maxFileSize)}
          </p>
        </div>
      </div>

      {/* Erreurs de fichiers rejetés */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {errors.map((error) => error.message).join(", ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Liste des fichiers uploadés */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Fichiers sélectionnés ({uploadedFiles.length})</h3>
          {uploadedFiles.map((file) => {
            const fileId = `${file.name}-${file.size}`
            const progress = uploadProgress[fileId] || 0
            const status = uploadStatus[fileId] || "uploading"

            return (
              <div key={fileId} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-2xl">{getFileIcon(file.name)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2">
                      {status === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {status === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(file)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    {status === "uploading" && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
                      </>
                    )}
                  </div>
                  {status === "uploading" && (
                    <Progress value={progress} className="h-1 mt-2" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
