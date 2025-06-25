import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit3, Trash2, Eye, CheckCircle, Clock, Send, Archive, FileCheck, FilePen, FileClock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const fetchContentList = async (page = 1, limit = 10) => {
  console.log(`Fetching content: page ${page}, limit ${limit}`);
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    docs: [
      { _id: '1', title: 'First Blog Post', status: 'published' as const, author: { name: 'Admin User' }, contentType: 'blog_post', updatedAt: new Date().toISOString(), publishedAt: new Date().toISOString() },
      { _id: '2', title: 'Understanding React Hooks', status: 'draft' as const, author: { name: 'Editor Jane' }, contentType: 'article', updatedAt: new Date().toISOString() },
      { _id: '3', title: 'New Feature Announcement', status: 'scheduled' as const, author: { name: 'Admin User' }, contentType: 'announcement', updatedAt: new Date().toISOString(), scheduledAt: new Date(Date.now() + 86400000).toISOString() },
      { _id: '4', title: 'Archived Content Example', status: 'archived' as const, author: { name: 'Old Author' }, contentType: 'article', updatedAt: new Date().toISOString() },
      { _id: '5', title: 'Content Pending Approval', status: 'pending_approval' as const, author: { name: 'Contributor Dave' }, contentType: 'article', updatedAt: new Date().toISOString() },
    ],
    totalDocs: 5,
    limit: 10,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
};

const deleteContentItem = async (id: string) => {
  console.log(`Deleting content item ${id}`);
  await new Promise(resolve => setTimeout(resolve, 300));
  return true;
};

const updateContentStatus = async (id: string, status: string) => {
    console.log(`Updating content item ${id} to status ${status}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return { _id: id, status: status, title: `Updated Item ${id}`, author: { name: 'System' }, contentType: 'article', updatedAt: new Date().toISOString() };
};

interface ContentItem {
  _id: string;
  title: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'scheduled' | 'published' | 'archived';
  author?: { name?: string; email?: string };
  contentType?: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledAt?: string;
}

interface ContentListResponse {
  docs: ContentItem[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ContentListComponentProps {
  onEditContent: (contentId: string) => void;
}

const ContentListComponent: React.FC<ContentListComponentProps> = ({ onEditContent }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkActionError, setBulkActionError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 1,
  });

  const loadContent = async (page = pagination.page, limit = pagination.limit) => {
    setIsLoading(true);
    setError(null);
    try {
      const data: ContentListResponse = await fetchContentList(page, limit);
      setContentItems(data.docs);
      setPagination({
        page: data.page,
        limit: data.limit,
        totalDocs: data.totalDocs,
        totalPages: data.totalPages,
      });
    } catch (err) {
      console.error('Failed to load content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContent();
    return () => {
        setSelectedContentIds([]);
    }
  }, []);

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedContentIds(contentItems.map(item => item._id));
    } else {
      setSelectedContentIds([]);
    }
  };

  const handleRowSelect = (contentId: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedContentIds(prev => [...prev, contentId]);
    } else {
      setSelectedContentIds(prev => prev.filter(id => id !== contentId));
    }
  };

  const performBulkAction = async (action: 'publish' | 'archive' | 'draft' | 'approve' | 'pending_approval') => {
    if (selectedContentIds.length === 0) {
      setBulkActionError("No items selected for bulk action.");
      return;
    }
    setBulkActionError(null);
    setIsLoading(true);

    const targetStatus = action === 'archive' ? 'archived' : action;

    try {
      console.log(`Performing bulk action: ${action} on IDs:`, selectedContentIds, "Target status:", targetStatus);
      await new Promise(resolve => setTimeout(resolve, 1000));

      await loadContent(pagination.page);
      setSelectedContentIds([]);
    } catch (err) {
      console.error(`Failed to perform bulk ${action}:`, err);
      setBulkActionError(`Failed to ${action} selected items. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this content item?')) {
      try {
        await deleteContentItem(id);
        setContentItems(prevItems => prevItems.filter(item => item._id !== id));
        setSelectedContentIds(prev => prev.filter(selId => selId !== id));
      } catch (err) {
        console.error('Failed to delete content:', err);
        setError('Failed to delete content item.');
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
        const updatedItem = await updateContentStatus(id, newStatus);
        setContentItems(prevItems =>
            prevItems.map(item => item._id === id ? { ...item, status: updatedItem.status as ContentItem['status'] } : item)
        );
    } catch (err) {
        console.error(`Failed to change status to ${newStatus}:`, err);
        setError(`Failed to change status to ${newStatus}.`);
    }
  };

  const getStatusBadgeVariant = (status: ContentItem['status']): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case 'published': return 'default';
      case 'scheduled': return 'default';
      case 'draft': return 'secondary';
      case 'pending_approval': return 'outline';
      case 'approved': return 'default';
      case 'archived': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return <p>Loading content...</p>;
  }

  const renderErrorAlert = (message: string | null) => {
    if (!message) return null;
    return (
        <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
  };

  if (error && !isLoading) {
    return renderErrorAlert(error);
  }

  if (contentItems.length === 0 && !isLoading && !error) {
    return <p>No content items found. Start by creating new content.</p>;
  }

  const isAllSelected = contentItems.length > 0 && selectedContentIds.length === contentItems.length;
  const isIndeterminate = selectedContentIds.length > 0 && selectedContentIds.length < contentItems.length;

  return (
    <div className="space-y-4">
      {renderErrorAlert(bulkActionError)}

      {selectedContentIds.length > 0 && (
        <div className="flex items-center justify-between p-2 bg-muted rounded-md">
          <span className="text-sm font-medium">{selectedContentIds.length} item(s) selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">Bulk Actions <MoreHorizontal className="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => performBulkAction('publish')}>
                  <FileCheck className="mr-2 h-4 w-4" /> Mark as Published
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => performBulkAction('draft')}>
                  <FilePen className="mr-2 h-4 w-4" /> Mark as Draft
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => performBulkAction('approve')}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark as Approved
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => performBulkAction('pending_approval')}>
                  <FileClock className="mr-2 h-4 w-4" /> Mark as Pending Approval
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => performBulkAction('archive')} className="text-red-600">
                  <Archive className="mr-2 h-4 w-4" /> Archive Selected
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={isAllSelected ? true : (isIndeterminate ? 'indeterminate' : false)}
                onCheckedChange={handleSelectAll}
                aria-label="Select all rows"
              />
            </TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead>Published/Scheduled</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contentItems.map((item) => (
            <TableRow key={item._id} data-state={selectedContentIds.includes(item._id) ? "selected" : ""}>
              <TableCell>
                <Checkbox
                  checked={selectedContentIds.includes(item._id)}
                  onCheckedChange={(checked) => handleRowSelect(item._id, checked)}
                  aria-label={`Select row ${item.title}`}
                />
              </TableCell>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(item.status)}>
                  {item.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{item.contentType || 'N/A'}</TableCell>
              <TableCell>{item.author?.name || 'Unknown'}</TableCell>
              <TableCell>{new Date(item.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                {item.status === 'published' && item.publishedAt ? new Date(item.publishedAt).toLocaleString() :
                 item.status === 'scheduled' && item.scheduledAt ? `Scheduled: ${new Date(item.scheduledAt).toLocaleString()}` : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditContent(item._id)}>
                      <Edit3 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => console.log('View item:', item._id)}>
                      <Eye className="mr-2 h-4 w-4" /> View
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     {item.status === 'pending_approval' && (
                        <DropdownMenuItem onClick={() => handleStatusChange(item._id, 'approve')}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                        </DropdownMenuItem>
                    )}
                    {item.status === 'approved' && (
                        <>
                            <DropdownMenuItem onClick={() => handleStatusChange(item._id, 'publish')}>
                                <Send className="mr-2 h-4 w-4 text-blue-500" /> Publish Now
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('Schedule item:', item._id)}>
                                <Clock className="mr-2 h-4 w-4 text-orange-500" /> Schedule
                            </DropdownMenuItem>
                        </>
                    )}
                    {item.status === 'draft' && (
                         <DropdownMenuItem onClick={() => handleStatusChange(item._id, 'pending_approval')}>
                            <Send className="mr-2 h-4 w-4" /> Submit for Approval
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete (Archive)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadContent(pagination.page - 1)}
          disabled={pagination.page <= 1 || isLoading}
        >
          Previous
        </Button>
        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadContent(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ContentListComponent;
