"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, Trash2, Loader2, Copy, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { getProjectUrls, ProjectUrls } from "@/actions/get-project-urls";
import { toast } from "sonner";

interface Url {
  id: string;
  url: string;
  domain: string;
  isIndexed: boolean | null;
  status: string;
  checkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface UrlsTableProps {
  projectId: string;
}

export function UrlsTable({ projectId }: UrlsTableProps) {
  const [projectUrls, setProjectUrls] = useState<ProjectUrls[]>([]);
  const [total, setTotal] = useState(0);
  const [totalIndexed, setTotalIndexed] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"url" | "domain" | "updatedAt">("updatedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isIndexedFilter, setIsIndexedFilter] = useState<"all" | "indexed" | "not-indexed">("all");

  const fetchUrls = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getProjectUrls(projectId, page, pageSize, sortBy, sortOrder, search, isIndexedFilter);
      if (!response.success || !response.data) {
        console.error("Failed to fetch project URLs:", response.error);
        return;
      }
      setProjectUrls(response.data.items);
      setTotal(response.data.total);
      setTotalIndexed(response.data.totalIndexed);
    } catch (error) {
      toast.error("Failed to fetch project URLs");
      console.error("Error fetching project URLs:", error);
    }
    finally {
      setLoading(false);
    }
  }, [projectId, page, pageSize, sortBy, sortOrder, search, isIndexedFilter]);

  useEffect(() => {
    fetchUrls();
  }, [fetchUrls]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleSort = (column: "url" | "domain" | "updatedAt") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const getSortIcon = (column: "url" | "domain" | "updatedAt") => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 ml-1 inline" />;
    }
    return sortOrder === "asc" ? 
      <ArrowUp className="h-3 w-3 ml-1 inline" /> : 
      <ArrowDown className="h-3 w-3 ml-1 inline" />;
  };

  const getStatusBadge = (status: string, isIndexed: boolean | null) => {
    if (isIndexed === true) {
      return <Badge variant="default" className="bg-green-500">Indexed</Badge>;
    }
    if (isIndexed === false) {
      return <Badge variant="destructive">Not Indexed</Badge>;
    }
    
    switch (status) {
      case "COMPLETED":
        return <Badge variant="outline">Checked</Badge>;
      case "PROCESSING":
        return <Badge variant="secondary">Processing</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg dark:text-gray-300 text-gray-700 font-bold">URLs</h2>
          <p className="text-muted-foreground text-xs">
            {total} total URLs • {totalIndexed} indexed
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchUrls}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {loading ? "Loading" : "Refresh Status"}
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search URLs or domains..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-8 pr-3 py-2 border rounded-md text-sm focus"
              disabled={loading}
            />
          </div>
          <Button 
            variant="outline" 
            className="py-3"
            onClick={handleSearch}
            disabled={loading}
          >
            Search
          </Button>
        </div>
        <select
          value={isIndexedFilter}
          onChange={(e) => { setIsIndexedFilter(e.target.value as any); setPage(1); }}
          className="text-sm border rounded px-3 py-2"
          disabled={loading}
        >
          <option value="all">All Status</option>
          <option value="indexed">Indexed Only</option>
          <option value="not-indexed">Not Indexed Only</option>
        </select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button 
                  onClick={() => handleSort("url")} 
                  className="flex items-center hover:text-foreground"
                  disabled={loading}
                >
                  URL {getSortIcon("url")}
                </button>
              </TableHead>
              <TableHead>
                <button 
                  onClick={() => handleSort("domain")} 
                  className="flex items-center hover:text-foreground"
                  disabled={loading}
                >
                  Domain {getSortIcon("domain")}
                </button>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <button 
                  onClick={() => handleSort("updatedAt")} 
                  className="flex items-center hover:text-foreground"
                  disabled={loading}
                >
                  Last Updated {getSortIcon("updatedAt")}
                </button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectUrls.length === 0 ? (
              loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8 flex items-center justify-center gap-2">
                    Loading...
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No URLs found
                  </TableCell>
                </TableRow>
              )
            ) : (
              projectUrls.map((url) => (
                <TableRow key={url.id}>
                  <TableCell className="max-w-md truncate font-medium">
                    {url.url}
                  </TableCell>
                  <TableCell>{url.domain}</TableCell>
                  <TableCell>{getStatusBadge(url.status, url.isIndexed)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(url.updatedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopyUrl(url.url)}
                        title="Copy URL"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(url.url, "_blank")}
                        title="Open URL"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        title="Delete URL"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {total === 0 ? (
              ""
            ) : (
              `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="text-sm border rounded px-2 py-1"
              disabled={loading}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
            </select>

            <Button variant="outline" size="sm" onClick={() => { setPage((p) => Math.max(1, p - 1)); }} disabled={loading || page <= 1}>
              Prev
            </Button>
            <div className="text-sm px-2">Page {page} / {Math.max(1, Math.ceil(total / pageSize))}</div>
            <Button variant="outline" size="sm" onClick={() => { setPage((p) => p + 1); }} disabled={loading || page >= Math.ceil(total / pageSize)}>
              Next
            </Button>
            <Button variant="outline" size="sm" onClick={fetchUrls} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              {loading ? "Loading" : "Refresh"}
            </Button>
          </div>
        </div>
    </div>
  );
}
