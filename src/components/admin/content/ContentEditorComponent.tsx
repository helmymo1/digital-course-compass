import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// For a richer text editing experience, consider integrating a library like TipTap or ReactQuill
// import RichTextEditor from '@/components/ui/RichTextEditor'; // Placeholder

interface ContentEditorComponentProps {
  contentId?: string | null; // If null/undefined, it's a new content item
  onSave: (data: any) => void; // Callback after saving
  onCancel: () => void; // Callback to go back or cancel
}

// Mock API functions - replace with actual API calls
const fetchContentDetails = async (id: string) => {
  console.log(`Fetching content details for ${id}`);
  await new Promise(resolve => setTimeout(resolve, 500));
  // Replace with: const response = await fetch(`/api/v1/content/${id}`);
  // const data = await response.json();
  // return data;
  return {
    _id: id,
    title: 'Sample Title for Editing',
    body: 'This is the existing body of the content. It can be quite long and support markdown or HTML.',
    status: 'draft',
    contentType: 'article',
    tags: ['react', 'typescript', 'cms'],
    slug: 'sample-title-for-editing',
    version: 2,
    versionHistory: [
        { version: 1, body: 'Old body content', updatedAt: new Date(Date.now() - 86400000*2).toISOString(), updatedBy: { name: 'Admin'} },
    ],
    scheduledAt: null,
  };
};

const saveContentApi = async (contentData: any, id?: string | null) => {
  const method = id ? 'PUT' : 'POST';
  const endpoint = id ? `/api/v1/content/${id}` : '/api/v1/content`;
  console.log(`Saving content to ${endpoint} with method ${method}`, contentData);
  await new Promise(resolve => setTimeout(resolve, 700));
  // Replace with:
  // const response = await fetch(endpoint, {
  //   method,
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(contentData),
  // });
  // if (!response.ok) throw new Error('Failed to save content');
  // return response.json();
  return { ...contentData, _id: id || 'new-id-from-server', updatedAt: new Date().toISOString() };
};


const ContentEditorComponent: React.FC<ContentEditorComponentProps> = ({ contentId, onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'draft'|'pending_approval'|'approved'|'scheduled'|'published'|'archived'>('draft');
  const [contentType, setContentType] = useState('article');
  const [tags, setTags] = useState(''); // Comma-separated string
  const [scheduledAt, setScheduledAt] = useState<string | null>(null); // ISO string for datetime-local
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentContent, setCurrentContent] = useState<any>(null); // To store fetched content for editing

  useEffect(() => {
    if (contentId) {
      setIsLoading(true);
      fetchContentDetails(contentId)
        .then(data => {
          setTitle(data.title);
          setBody(data.body);
          setStatus(data.status as typeof status);
          setContentType(data.contentType);
          setTags(data.tags?.join(', ') || '');
          setScheduledAt(data.scheduledAt ? new Date(data.scheduledAt).toISOString().substring(0, 16) : null);
          setCurrentContent(data);
        })
        .catch(err => {
          console.error("Failed to fetch content details:", err);
          setError("Failed to load content for editing.");
        })
        .finally(() => setIsLoading(false));
    } else {
      // Reset form for new content
      setTitle('');
      setBody('');
      setStatus('draft');
      setContentType('article');
      setTags('');
      setScheduledAt(null);
      setCurrentContent(null);
    }
  }, [contentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const contentData = {
      title,
      body,
      status,
      contentType,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      scheduledAt: status === 'scheduled' && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      // Include other fields like slug if managed on client, or let backend handle
    };

    try {
      const savedData = await saveContentApi(contentData, contentId);
      onSave(savedData); // Callback to parent
    } catch (err) {
      console.error("Failed to save content:", err);
      setError((err as Error).message || "Failed to save content. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertVersion = (versionBody: string) => {
    if (window.confirm("Are you sure you want to revert to this version? Unsaved changes will be lost.")) {
        setBody(versionBody);
        // Optionally, you might want to change status back to 'draft' or similar
        setStatus('draft');
        // Ideally, this would also trigger a save or a specific "revert" API call
        // For now, it just updates the local state.
    }
  };


  if (isLoading && contentId) {
    return <p>Loading editor...</p>; // Replace with Skeleton Loader
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{contentId ? 'Edit Content' : 'Create New Content'}</CardTitle>
        {currentContent?.slug && <CardDescription>Slug: /content/{currentContent.slug} (Version: {currentContent.version})</CardDescription>}
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            {/* Replace with a Rich Text Editor for better UX */}
            <Textarea id="body" value={body} onChange={e => setBody(e.target.value)} rows={10} required />
            {/* <RichTextEditor value={body} onChange={setBody} /> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                  {/* Admins/Editors might see more options directly */}
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger id="contentType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="blog_post">Blog Post</SelectItem>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                  {/* Add more types as needed */}
                </SelectContent>
              </Select>
            </div>
          </div>

          {status === 'scheduled' && (
            <div className="space-y-2">
              <Label htmlFor="scheduledAt">Schedule At</Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt || ''}
                onChange={e => setScheduledAt(e.target.value)}
                required={status === 'scheduled'}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., tech, news, update" />
          </div>

          {/* Version History Display - Basic */}
          {contentId && currentContent?.versionHistory && currentContent.versionHistory.length > 0 && (
            <div className="space-y-2">
                <Label>Version History</Label>
                <Card className="max-h-60 overflow-y-auto">
                    <CardContent className="p-4 space-y-3">
                        {currentContent.versionHistory.slice().sort((a:any,b:any) => b.version - a.version).map((version: any) => (
                            <div key={version.version} className="p-2 border rounded-md">
                                <div className="flex justify-between items-center text-sm">
                                    <span>Version {version.version} (by {version.updatedBy?.name || 'Unknown'})</span>
                                    <span className="text-muted-foreground">{new Date(version.updatedAt).toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 truncate">{version.body.substring(0,100)}...</p>
                                <Button type="button" variant="link" size="sm" onClick={() => handleRevertVersion(version.body)}>Revert to this version</Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (contentId ? 'Saving...' : 'Creating...') : (contentId ? 'Save Changes' : 'Create Content')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ContentEditorComponent;
