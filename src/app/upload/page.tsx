"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface UploadFile {
    file: File;
    id: string;
    status: "queued" | "processing" | "success" | "failed";
    progress: number;
    error?: string;
    invoiceId?: string;
}

export default function UploadPage() {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map((file) => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            status: "queued" as const,
            progress: 0,
        }));
        setFiles((prev) => [...prev, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"] },
    });

    const removeFile = (id: string) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const startUpload = async () => {
        if (files.length === 0 || isUploading) return;
        setIsUploading(true);

        const updatedFiles = [...files];

        for (let i = 0; i < updatedFiles.length; i++) {
            if (updatedFiles[i].status === "success") continue;
            updatedFiles[i].status = "processing";
            updatedFiles[i].progress = 20;
        }
        setFiles([...updatedFiles]);

        try {
            const formData = new FormData();
            files.filter(f => f.status !== "success").forEach(f => formData.append("files", f.file));

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                const results = data.results;
                const finalized = files.map(f => {
                    const result = results.find((r: any) => r.fileName === f.file.name);
                    if (result) {
                        return {
                            ...f,
                            status: result.success ? "success" : "failed",
                            progress: 100,
                            error: result.error,
                            invoiceId: result.invoiceId
                        } as UploadFile;
                    }
                    return f;
                });
                setFiles(finalized);
                toast.success("Upload complete!");
            } else {
                throw new Error(data.error || "Upload failed");
            }
        } catch (err: any) {
            toast.error(err.message);
            setFiles(prev => prev.map(f => f.status === "processing" ? { ...f, status: "failed", error: err.message } : f));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Upload Invoices</h1>
                <p className="text-gray-500">Bulk upload your invoice PDFs. We'll extract and organize everything for you.</p>
            </div>

            <div
                {...getRootProps()}
                className={cn(
                    "relative border-2 border-dashed rounded-3xl p-12 transition-all flex flex-col items-center justify-center cursor-pointer group",
                    isDragActive ? "border-blue-500 bg-blue-50/50" : "border-gray-200 hover:border-blue-400 hover:bg-gray-50/50",
                    files.length > 0 && "py-10"
                )}
            >
                <input {...getInputProps()} />
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-lg font-semibold text-gray-900">
                    {isDragActive ? "Drop the files here" : "Click or drag files here to upload"}
                </p>
                <p className="text-sm text-gray-500 mt-1">Only PDF format supported (max 10MB per file)</p>
            </div>

            {files.length > 0 && (
                <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="p-6 border-b flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">{files.length} Files Selected</span>
                            <div className="flex gap-3">
                                <Button variant="ghost" size="sm" onClick={() => setFiles([])} disabled={isUploading}>Clear All</Button>
                                <Button variant="blue" size="sm" onClick={startUpload} disabled={isUploading}>
                                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Start Processing
                                </Button>
                            </div>
                        </div>
                        <div className="divide-y max-h-[400px] overflow-y-auto">
                            {files.map((file) => (
                                <div key={file.id} className="p-6 flex items-start gap-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <FileText className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{file.file.name}</p>
                                            <button onClick={() => removeFile(file.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <Progress value={file.progress} className="h-1.5" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 w-10 text-right">{file.progress}%</span>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2">
                                            {file.status === "processing" && <span className="text-xs text-blue-600 font-bold flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Extracting Data...</span>}
                                            {file.status === "success" && <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Processed</span>}
                                            {file.status === "failed" && <span className="text-xs text-red-600 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {file.error || "Failed"}</span>}
                                            {file.status === "queued" && <span className="text-xs text-gray-500 font-bold italic">Queued</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
