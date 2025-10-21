"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Reply,
  Paperclip,
  Send,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Image as ImageIcon,
  Edit,
  Trash,
  Pin,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Comment {
  id: string;
  comment_text: string;
  comment_type: string;
  priority: string;
  status: string;
  position_x?: number;
  position_y?: number;
  annotation_area?: any;
  attachments: string[];
  mentioned_users: string[];
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  creator: {
    id: string;
    first_name: string;
    last_name: string;
    position: string;
  };
  resolver?: {
    id: string;
    first_name: string;
    last_name: string;
    position: string;
  };
  replies: Comment[];
}

interface ThreadedCommentsProps {
  designId: string;
  version?: number;
  currentUserId: string;
  className?: string;
}

export function ThreadedComments({
  designId,
  version,
  currentUserId,
  className = "",
}: ThreadedCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentType, setCommentType] = useState("GENERAL");
  const [priority, setPriority] = useState("NORMAL");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    fetchComments();
  }, [designId, version]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const url = `/api/designs/${designId}/comments${version ? `?version=${version}` : ""}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setComments(data.data);
      } else {
        toast.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      toast.error("Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("comment_text", newComment);
      formData.append("comment_type", commentType);
      formData.append("priority", priority);
      formData.append("version", version?.toString() || "1");
      formData.append("created_by", currentUserId);

      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file);
      });

      const response = await fetch(`/api/designs/${designId}/comments`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Comment added successfully");
        setNewComment("");
        setCommentType("GENERAL");
        setPriority("NORMAL");
        setAttachments([]);
        fetchComments();
      } else {
        toast.error(result.message || "Failed to add comment");
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim()) return;

    try {
      const formData = new FormData();
      formData.append("comment_text", replyText);
      formData.append("comment_type", "GENERAL");
      formData.append("priority", "NORMAL");
      formData.append("version", version?.toString() || "1");
      formData.append("parent_comment_id", parentId);
      formData.append("created_by", currentUserId);

      const response = await fetch(`/api/designs/${designId}/comments`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("Reply added successfully");
        setReplyText("");
        setReplyingTo(null);
        fetchComments();
      } else {
        toast.error(result.message || "Failed to add reply");
      }
    } catch (error) {
      console.error("Failed to add reply:", error);
      toast.error("Failed to add reply");
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "RESOLVED",
          resolved_by: currentUserId,
        }),
      });

      if (response.ok) {
        toast.success("Comment resolved");
        fetchComments();
      } else {
        toast.error("Failed to resolve comment");
      }
    } catch (error) {
      console.error("Failed to resolve comment:", error);
      toast.error("Failed to resolve comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(
        `/api/comments/${commentId}?user_id=${currentUserId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Comment deleted");
        fetchComments();
      } else {
        toast.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachments(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-gray-100 text-gray-800";
      case "NORMAL":
        return "bg-blue-100 text-blue-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "CRITICAL":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "OPEN":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-2 text-muted-foreground">Loading comments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comments & Feedback
          {comments.length > 0 && (
            <Badge variant="secondary">{comments.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Comment */}
        <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="comment-type">Type</Label>
              <Select value={commentType} onValueChange={setCommentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="REVISION_REQUEST">
                    Revision Request
                  </SelectItem>
                  <SelectItem value="APPROVAL">Approval</SelectItem>
                  <SelectItem value="REJECTION">Rejection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="CRITICAL">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="new-comment">Your Comment</Label>
            <Textarea
              id="new-comment"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Add your comment or feedback..."
              rows={3}
            />
          </div>

          {/* Attachments */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Attachments</Label>
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <Button variant="outline" size="sm" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Paperclip className="mr-1 h-4 w-4" />
                    Add Files
                  </label>
                </Button>
              </div>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded border bg-white p-2"
                  >
                    <div className="flex items-center gap-2">
                      {file.type.startsWith("image/") ? (
                        <ImageIcon className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(index)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
            className="w-full"
          >
            <Send className="mr-2 h-4 w-4" />
            {submitting ? "Adding Comment..." : "Add Comment"}
          </Button>
        </div>

        {/* Comments List */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="rounded-lg border">
                <div className="p-4">
                  {/* Comment Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">
                          {comment.creator.first_name}{" "}
                          {comment.creator.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {comment.creator.position}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(comment.status)}
                        <Badge
                          variant="outline"
                          className={getPriorityColor(comment.priority)}
                        >
                          {comment.priority}
                        </Badge>
                        <Badge variant="outline">
                          {comment.comment_type.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(comment.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="mb-3">
                    <p className="whitespace-pre-wrap text-sm">
                      {comment.comment_text}
                    </p>

                    {comment.attachments.length > 0 && (
                      <div className="mt-3">
                        <h5 className="mb-2 text-xs font-medium text-muted-foreground">
                          Attachments:
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {comment.attachments.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                            >
                              <FileText className="h-3 w-3" />
                              Attachment {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id
                        )
                      }
                    >
                      <Reply className="mr-1 h-4 w-4" />
                      Reply
                    </Button>

                    {comment.status === "OPEN" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResolveComment(comment.id)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Resolve
                      </Button>
                    )}

                    {comment.creator.id === currentUserId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-4 rounded border bg-gray-50 p-3">
                      <Textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        rows={2}
                        className="mb-3"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitReply(comment.id)}
                          disabled={!replyText.trim()}
                        >
                          Send Reply
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="border-t bg-gray-50">
                    <div className="space-y-3 p-4">
                      {comment.replies.map(reply => (
                        <div
                          key={reply.id}
                          className="rounded border border-gray-200 bg-white p-3"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-gray-500" />
                              <span className="text-xs font-medium">
                                {reply.creator.first_name}{" "}
                                {reply.creator.last_name}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{reply.comment_text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No comments yet</p>
            <p className="text-sm text-muted-foreground">
              Be the first to add feedback or comments
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
