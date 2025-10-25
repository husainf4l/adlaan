"use client";

import { useState, useEffect, useRef } from "react";
import { client } from "../../../lib/apollo-client";
import {
  UPLOAD_DOCUMENT_MUTATION,
  CLASSIFY_DOCUMENTS_MUTATION,
  GET_TASK_QUERY,
  GET_DOCUMENTS_QUERY,
  CREATE_FOLDER_MUTATION,
} from "../../../lib/graphql";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Upload, FileText, Folder } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { DashboardLayout } from "../../../components/DashboardLayout";

export default function CloudStoragePage() {
  const { user, company, authLoading } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [classificationResults, setClassificationResults] = useState<any[]>([]);

  useEffect(() => {
    loadFiles();
  }, [user, authLoading]);

  useEffect(() => {
    let timer: any;
    if (taskId) {
      timer = setInterval(async () => {
        try {
          const res = await client.query({
            query: GET_TASK_QUERY,
            variables: { id: taskId },
            fetchPolicy: 'network-only'
          });

          const task = (res.data as any).task;
          setTaskStatus(task?.status || null);
          if (task?.status === 'COMPLETED') {
            setClassificationResults(task.result?.classifications || []);
            clearInterval(timer);
            // After classification, attempt to create folders and move documents
            await organizeClassifiedDocuments(task.result?.classifications || []);
            setTaskId(null);
          }
          if (task?.status === 'FAILED') {
            clearInterval(timer);
            setTaskId(null);
          }
        } catch (err) {
          console.error('Error polling task:', err);
        }
      }, 2000);
    }

    return () => clearInterval(timer);
  }, [taskId]);

  const loadFiles = async () => {
    try {
      const res = await client.query({ query: GET_DOCUMENTS_QUERY, fetchPolicy: 'network-only' });
      setFiles((res.data as any).documents || []);
    } catch (err) {
      console.warn('Failed to load documents, using fallback');
      setFiles([]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement> | null) => {
    const fileList = e?.target?.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    try {
      const uploadedIds: string[] = [];

      for (const file of Array.from(fileList)) {
        try {
          const result = await client.mutate({
            mutation: UPLOAD_DOCUMENT_MUTATION,
            variables: {
              input: {
                file: file,
                parentId: null
              }
            }
          });

          const uploadData = (result.data as any).uploadDocument;
          if (uploadData?.id) uploadedIds.push(uploadData.id);
        } catch (uploadErr) {
          console.error('Upload failed for file, skipping:', uploadErr);
        }
      }

      if (uploadedIds.length > 0) {
        // Kick off classification
        const classifyRes = await client.mutate({
          mutation: CLASSIFY_DOCUMENTS_MUTATION,
          variables: { input: { documentIds: uploadedIds } }
        });

        const task = (classifyRes.data as any)?.classifyDocuments;
        if (task?.taskId) {
          setTaskId(task.taskId);
        }
      }

      // Refresh local file list
      await loadFiles();
    } catch (err) {
      console.error('Error during upload/classify flow:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const organizeClassifiedDocuments = async (classifications: any[]) => {
    if (!classifications || classifications.length === 0) return;

    try {
      // Ensure folders exist for each category
      const categories = Array.from(new Set(classifications.map((c: any) => c.category)));

      const existingFolders = (files || []).filter(f => f.type === 'folder');

      const categoryToFolderId: Record<string, string> = {};

      for (const category of categories) {
        const found = existingFolders.find((f: any) => f.case === category);
        if (found) {
          categoryToFolderId[category] = found.id;
          continue;
        }

        try {
          const created = await client.mutate({
            mutation: CREATE_FOLDER_MUTATION,
            variables: { name: category, parentId: null }
          });

          const folder = (created.data as any).createFolder;
          if (folder?.id) categoryToFolderId[category] = folder.id;
        } catch (err) {
          console.warn('Failed to create folder for category', category, err);
        }
      }

      // Move documents into folders using the safe API endpoint
      const movePromises = classifications.map(async (cls: any) => {
        const docId = cls.documentId;
        const category = cls.category;
        const targetFolderId = categoryToFolderId[category];

        if (!targetFolderId) {
          console.warn(`No folder found for category ${category}, skipping move for document ${docId}`);
          return null;
        }

        try {
          const response = await fetch('/api/documents/move', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // Authorization will be handled by the API route using the user's session
            },
            body: JSON.stringify({
              documentId: docId,
              targetFolderId: targetFolderId
            })
          });

          const result = await response.json();

          if (result.success) {
            console.log(`Successfully moved document ${docId} to folder ${targetFolderId}`);
            return result.document;
          } else {
            console.warn(`Failed to move document ${docId}:`, result.error);
            return null;
          }
        } catch (err) {
          console.error(`Error moving document ${docId}:`, err);
          return null;
        }
      });

      // Wait for all move operations to complete
      await Promise.allSettled(movePromises);

      // Refresh files list to show updated organization
      await loadFiles();

      console.log('Document organization completed');
    } catch (err) {
      console.error('Error organizing classified documents:', err);
    }
  };

  if (authLoading || !user || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading Cloud Storage...</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Cloud Storage</h1>
            <p className="text-sm text-muted-foreground">Upload documents and they will be auto-classified and organized.</p>
          </div>
          <div>
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" /> Upload Files
            </Button>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Folder className="h-5 w-5" /> Folders</CardTitle>
                <CardDescription>Detected folders</CardDescription>
              </CardHeader>
              <CardContent>
                {files.filter(f => f.type === 'folder').length === 0 ? (
                  <div className="text-sm text-muted-foreground">No folders yet</div>
                ) : (
                  <ul className="space-y-2">
                    {files.filter(f => f.type === 'folder').map((f: any) => (
                      <li key={f.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-muted-foreground" />
                          <span>{f.case}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(f.updatedAt).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Recent Uploads</CardTitle>
                <CardDescription>Files recently uploaded to your Cloud Storage</CardDescription>
              </CardHeader>
              <CardContent>
                {files.filter(f => f.type !== 'folder').length === 0 ? (
                  <div className="text-sm text-muted-foreground">No files</div>
                ) : (
                  <ul className="space-y-2">
                    {files.filter(f => f.type !== 'folder').map((f: any) => (
                      <li key={f.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-6 w-6 text-primary" />
                          <div>
                            <div className="font-medium">{f.case}</div>
                            <div className="text-xs text-muted-foreground">{f.mimeType || f.type} • {Math.round((f.size || 0)/1024)} KB</div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">{f.parentId ? 'In folder' : 'Unsorted'}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Classification</CardTitle>
                <CardDescription>Live status of the classifier task</CardDescription>
              </CardHeader>
              <CardContent>
                {taskId ? (
                  <div>Running classification task: {taskId} — status: {taskStatus}</div>
                ) : classificationResults.length > 0 ? (
                  <div className="space-y-3">
                    {classificationResults.map((r: any) => (
                      <div key={r.documentId} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{files.find(f=>f.id===r.documentId)?.case || r.documentId}</div>
                          <div className="text-xs text-muted-foreground">{r.category} • {Math.round(r.confidence*100)}%</div>
                        </div>
                        <div className="text-xs text-muted-foreground">Auto-moved (best-effort)</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No recent classification tasks</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
