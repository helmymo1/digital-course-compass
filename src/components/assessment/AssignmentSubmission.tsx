
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, Clock, Calendar } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  maxPoints: number;
  allowedFileTypes: string[];
  maxFileSize: number; // in MB
}

interface AssignmentSubmissionProps {
  assignment: Assignment;
  onSubmit: (submission: {
    title: string;
    description: string;
    files: File[];
  }) => void;
}

const AssignmentSubmission: React.FC<AssignmentSubmissionProps> = ({
  assignment,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Validate file types and size
    const validFiles = selectedFiles.filter(file => {
      const isValidType = assignment.allowedFileTypes.some(type => 
        file.type.includes(type) || file.name.toLowerCase().endsWith(type)
      );
      const isValidSize = file.size <= assignment.maxFileSize * 1024 * 1024;
      
      if (!isValidType) {
        alert(`File ${file.name} is not an allowed file type.`);
        return false;
      }
      if (!isValidSize) {
        alert(`File ${file.name} exceeds the maximum size of ${assignment.maxFileSize}MB.`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    onSubmit({ title, description, files });
    setIsSubmitting(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const timeUntilDue = assignment.dueDate.getTime() - new Date().getTime();
  const daysUntilDue = Math.ceil(timeUntilDue / (1000 * 60 * 60 * 24));
  const isOverdue = timeUntilDue < 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Assignment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {assignment.title}
            <Badge variant={isOverdue ? 'destructive' : daysUntilDue <= 3 ? 'secondary' : 'default'}>
              {isOverdue ? 'Overdue' : `${daysUntilDue} days left`}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Due: {assignment.dueDate.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Max Points: {assignment.maxPoints}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{assignment.description}</p>
        </CardContent>
      </Card>

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Submission Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your submission"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your submission (optional)"
                className="mt-1 min-h-[100px]"
              />
            </div>

            {/* File Upload */}
            <div>
              <Label>Files</Label>
              <div className="mt-2 space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-sm font-medium text-primary hover:text-primary/80">
                        Upload files
                      </span>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="sr-only"
                        accept={assignment.allowedFileTypes.join(',')}
                      />
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Allowed: {assignment.allowedFileTypes.join(', ')} | Max size: {assignment.maxFileSize}MB
                  </p>
                </div>

                {/* Uploaded Files */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files:</Label>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {isSubmitting && (
              <div>
                <Label>Upload Progress</Label>
                <Progress value={uploadProgress} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!title || isSubmitting || isOverdue}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : isOverdue ? 'Submission Closed' : 'Submit Assignment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentSubmission;
