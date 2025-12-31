"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Upload,
  FileText,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Link2,
} from "lucide-react";
import { toast } from "sonner";
import { importUrls as importUrlsAction } from "@/actions/import-url";

interface ImportTabProps {
  projectId: string;
  onImportComplete?: () => void;
}

interface ImportProgress {
  current: number;
  total: number;
  processing: string;
}

interface ParsedUrl {
  original: string;
  normalized: string;
  isValid: boolean;
  error?: string;
}

export function ImportTab({ projectId, onImportComplete }: ImportTabProps) {
  const [urls, setUrls] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importMethod, setImportMethod] = useState<"paste" | "upload">("paste");
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(
    null
  );
  const [hasImported, setHasImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse and validate URLs
  const parsedUrls = useMemo<ParsedUrl[]>(() => {
    if (!urls.trim()) return [];

    // Split by newlines, commas, spaces
    const lines = urls
      .split(/[\n,\s]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines.map((url) => {
      try {
        // Try to parse as URL
        let normalized = url;
        
        // Add protocol if missing
        if (!url.match(/^https?:\/\//i)) {
          normalized = `https://${url}`;
        }

        const parsed = new URL(normalized);
        
        // Basic validation
        if (!parsed.hostname.includes('.')) {
          return {
            original: url,
            normalized,
            isValid: false,
            error: "Invalid domain",
          };
        }

        return {
          original: url,
          normalized,
          isValid: true,
        };
      } catch (error) {
        return {
          original: url,
          normalized: url,
          isValid: false,
          error: "Invalid URL format",
        };
      }
    });
  }, [urls]);

  // Get unique valid URLs
  const validUrls = useMemo(() => {
    const seen = new Set<string>();
    return parsedUrls.filter((url) => {
      if (!url.isValid) return false;
      if (seen.has(url.normalized)) return false;
      seen.add(url.normalized);
      return true;
    });
  }, [parsedUrls]);

  const invalidUrls = useMemo(
    () => parsedUrls.filter((url) => !url.isValid),
    [parsedUrls]
  );

  const duplicateCount = parsedUrls.length - validUrls.length - invalidUrls.length;

  const handleUrlChange = useCallback((value: string) => {
    setUrls(value);
  }, []);

  const handlePasteImport = async () => {
    if (validUrls.length === 0) {
      toast.error("Please enter at least one valid URL");
      return;
    }

    setIsImporting(true);

    const urlList = validUrls.map((u) => u.normalized);

    setImportProgress({
      current: 0,
      total: urlList.length,
      processing: "Submitting...",
    });

    try {
      // Submit in chunks to avoid body size limits and improve reliability
      const chunkSize = 500;
      const chunks: string[][] = [];
      for (let i = 0; i < urlList.length; i += chunkSize) {
        chunks.push(urlList.slice(i, i + chunkSize));
      }

      let imported = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        setImportProgress((prev) => ({
          current: Math.min(imported, urlList.length),
          total: urlList.length,
          processing: `Submitting batch ${i + 1} of ${chunks.length}...`,
        }));

        const res = await importUrlsAction(projectId, chunk);
        if (!res.success) {
          throw new Error(res.error || "Failed to import URLs");
        }
        imported += res.data?.imported ?? chunk.length;
        setImportProgress((prev) => ({
          current: Math.min(imported, urlList.length),
          total: urlList.length,
          processing: `Imported ${imported}/${urlList.length}`,
        }));
      }

      setImportProgress({
        current: urlList.length,
        total: urlList.length,
        processing: "Complete!",
      });

      setTimeout(() => {
        toast.success(`Successfully imported ${imported} backlinks`);
        setUrls("");
        setImportProgress(null);
        setHasImported(true);
        onImportComplete?.();
      }, 500);
    } catch (error: any) {
      console.error("Error importing URLs:", error);
      toast.error(error?.message || "Failed to import URLs");
      setImportProgress(null);
    } finally {
      setTimeout(() => setIsImporting(false), 500);
    }
  };

  const handleFileImport = async (file: File) => {
    const allowedExtensions = [".csv", ".txt"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));

    if (!allowedExtensions.includes(fileExtension)) {
      toast.error("Please upload a CSV or TXT file");
      return;
    }

    setIsImporting(true);
    setImportProgress({
      current: 0,
      total: 100,
      processing: "Analyzing file...",
    });

    try {
      const text = await file.text();
      let extractedUrls: string[] = [];

      if (fileExtension === ".csv") {
        // Use PapaParse for CSV parsing with headers
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as any[];
            
            data.forEach((row) => {
              // Check if Nofollow column exists and is true - skip those rows
              const nofollow = row['Nofollow'] || row['nofollow'] || row['NOFOLLOW'];
              if (nofollow === true || nofollow === 'true' || nofollow === 'TRUE' || nofollow === '1') {
                return; // Skip this row
              }

              // Extract URL from 'Source url' column
              const sourceUrl = row['Source url'] || row['Source Url'] || row['source url'] || row['SOURCE URL'];
              
              if (sourceUrl) {
                const cleanUrl = String(sourceUrl).trim();
                
                // Check if it's a full URL
                if (cleanUrl.match(/^https?:\/\/.+/)) {
                  extractedUrls.push(cleanUrl);
                } 
                // Check if it's a domain name
                else if (
                  cleanUrl.match(
                    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}/
                  )
                ) {
                  extractedUrls.push(`https://${cleanUrl}`);
                }
              }
            });
          },
          error: (error: Error) => {
            console.error("PapaParse error:", error);
            toast.error("Failed to parse CSV file");
          },
        });
      } else {
        // Plain text file - split by lines
        extractedUrls = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
      }

      if (extractedUrls.length === 0) {
        toast.error("No URLs found in the file");
        setImportProgress(null);
        setIsImporting(false);
        return;
      }

      setUrls(extractedUrls.join("\n"));
      setUploadedFileName(file.name);
      setImportProgress(null);

      toast.success(
        `Found ${extractedUrls.length} URLs in ${file.name}. Review and import below.`
      );
    } catch (error: any) {
      console.error("Error importing file:", error);
      toast.error("Failed to import file");
      setImportProgress(null);
    } finally {
      setTimeout(() => setIsImporting(false), 500);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileImport(e.dataTransfer.files[0]);
    }
  };

  const handleClearAll = () => {
    setUrls("");
    setImportProgress(null);
    setUploadedFileName(null);
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    const urlLines = urls.split("\n");
    const filtered = urlLines.filter((line) => {
      const trimmed = line.trim();
      return trimmed !== urlToRemove && trimmed !== `https://${urlToRemove}`;
    });
    setUrls(filtered.join("\n"));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xl font-semibold">
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
              <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Import Backlinks
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Add backlinks to monitor their indexing status. Paste URLs manually or upload a CSV/TXT file.
        </p>
      </div>

      <Tabs
        value={importMethod}
        onValueChange={(value) => setImportMethod(value as "paste" | "upload")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paste" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Paste URLs
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="space-y-4 mt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="paste-urls" className="text-sm font-medium">
                Backlink URLs
              </Label>
              {parsedUrls.length > 0 && (
                <div className="flex items-center gap-2">
                  {validUrls.length > 0 && (
                    <Badge variant="default" className="text-xs bg-green-600">
                      {validUrls.length} valid
                    </Badge>
                  )}
                  {invalidUrls.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {invalidUrls.length} invalid
                    </Badge>
                  )}
                  {duplicateCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {duplicateCount} duplicate{duplicateCount > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <Textarea
                id="paste-urls"
                placeholder="Paste your URLs here (one per line, or separated by commas/spaces)&#10;&#10;Examples:&#10;https://example.com/page1&#10;https://myblog.com/article&#10;website.com/post"
                value={urls}
                onChange={(e) => handleUrlChange(e.target.value)}
                className="min-h-50 font-mono text-sm leading-relaxed resize-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900/50"
                disabled={isImporting}
              />

              {urls && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={handleClearAll}
                  disabled={isImporting}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            {uploadedFileName && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                <span>Loaded from: {uploadedFileName}</span>
              </div>
            )}

            {/* URL Preview (hidden after successful import) */}
            {parsedUrls.length > 0 && !hasImported && (
              <div className="border rounded-lg p-4 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">URL Preview</h4>
                  <span className="text-xs text-muted-foreground">
                    {parsedUrls.length} URL{parsedUrls.length > 1 ? "s" : ""} detected
                  </span>
                </div>
                {/* Submit button appears when URLs are parsed */}
                <div className="flex justify-end mb-3">
                  <Button
                    onClick={handlePasteImport}
                    disabled={isImporting || validUrls.length === 0}
                    size="sm"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Submit {validUrls.length > 0 ? `${validUrls.length} URL${validUrls.length > 1 ? "s" : ""}` : "URLs"}
                      </>
                    )}
                  </Button>
                </div>
                <ScrollArea className="h-50">
                  <div className="space-y-2">
                    {validUrls.map((url, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-2 p-2 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          <span className="text-xs font-mono truncate">
                            {url.normalized}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleRemoveUrl(url.original)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    {invalidUrls.map((url, index) => (
                      <div
                        key={`invalid-${index}`}
                        className="flex items-center justify-between gap-2 p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-mono truncate block">
                              {url.original}
                            </span>
                            <span className="text-xs text-red-600">
                              {url.error}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleRemoveUrl(url.original)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4 mt-6">
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer
              ${
                dragActive
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }
              ${isImporting ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isImporting && fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4">
                  <Upload
                    className={`h-12 w-12 ${
                      dragActive ? "text-emerald-600" : "text-gray-400"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {dragActive
                    ? "Drop your file here"
                    : "Drag & drop your file"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports .csv and .txt files with URLs
                </p>
              </div>
            </div>

            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={isImporting}
            />

            {isImporting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-900/90 rounded-xl">
                <div className="space-y-4 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto" />
                  <span className="text-sm font-medium">
                    Processing file...
                  </span>
                </div>
              </div>
            )}
          </div>

          {uploadedFileName && urls && (
            <div className="border rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">
                    {uploadedFileName}
                  </span>
                </div>
                <Badge variant="default" className="bg-emerald-600">
                  {validUrls.length} valid URLs
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Switch to "Paste URLs" tab to review and import.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Import Progress */}
      {importProgress && (
        <div className="border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Import Progress
              </span>
              <span className="text-emerald-600">
                {importProgress.current}/{importProgress.total}
              </span>
            </div>
            <Progress
              value={(importProgress.current / importProgress.total) * 100}
              className="h-2"
            />
            <p className="text-xs text-emerald-600">
              {importProgress.processing}
            </p>
          </div>
        </div>
      )}

      {/* Info Message */}
      {validUrls.length === 0 && parsedUrls.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900">
          <AlertCircle className="h-4 w-4" />
          <span>Add at least 1 valid URL to continue</span>
        </div>
      )}

      <Separator />

      {/* Submit Button (summary) */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {validUrls.length > 0 ? (
            <>
              Ready to submit <strong>{validUrls.length}</strong> backlink{validUrls.length > 1 ? "s" : ""}
            </>
          ) : (
            "Paste or upload URLs to get started"
          )}
        </div>
        <Button
          onClick={handlePasteImport}
          disabled={isImporting || validUrls.length === 0}
          size="lg"
          className="min-w-50"
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Submit {validUrls.length > 0 ? `${validUrls.length} URL${validUrls.length > 1 ? "s" : ""}` : "URLs"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}