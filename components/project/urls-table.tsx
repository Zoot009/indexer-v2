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
import { ExternalLink, RefreshCw, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  urls: Url[];
  projectId: string;
}

export function UrlsTable({ urls, projectId }: UrlsTableProps) {
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
          <h2 className="text-2xl font-bold">URLs</h2>
          <p className="text-muted-foreground">
            {urls.length} total URLs • {urls.filter(u => u.isIndexed === true).length} indexed
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check Count</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {urls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No URLs found
                </TableCell>
              </TableRow>
            ) : (
              urls.map((url) => (
                <TableRow key={url.id}>
                  <TableCell className="max-w-md truncate font-medium">
                    {url.url}
                  </TableCell>
                  <TableCell>{url.domain}</TableCell>
                  <TableCell>{getStatusBadge(url.status, url.isIndexed)}</TableCell>
                  <TableCell>{url.checkCount}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(url.updatedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(url.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
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
    </div>
  );
}
