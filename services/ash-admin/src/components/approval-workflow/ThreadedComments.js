'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadedComments = ThreadedComments;
const react_1 = __importStar(require("react"));
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const textarea_1 = require("@/components/ui/textarea");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
function ThreadedComments({ designId, version, currentUserId, className = '' }) {
    const [comments, setComments] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [submitting, setSubmitting] = (0, react_1.useState)(false);
    const [newComment, setNewComment] = (0, react_1.useState)('');
    const [commentType, setCommentType] = (0, react_1.useState)('GENERAL');
    const [priority, setPriority] = (0, react_1.useState)('NORMAL');
    const [replyingTo, setReplyingTo] = (0, react_1.useState)(null);
    const [replyText, setReplyText] = (0, react_1.useState)('');
    const [editingComment, setEditingComment] = (0, react_1.useState)(null);
    const [editText, setEditText] = (0, react_1.useState)('');
    const [attachments, setAttachments] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        fetchComments();
    }, [designId, version]);
    const fetchComments = async () => {
        try {
            setLoading(true);
            const url = `/api/designs/${designId}/comments${version ? `?version=${version}` : ''}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setComments(data.data);
            }
            else {
                react_hot_toast_1.toast.error('Failed to fetch comments');
            }
        }
        catch (error) {
            console.error('Failed to fetch comments:', error);
            react_hot_toast_1.toast.error('Failed to fetch comments');
        }
        finally {
            setLoading(false);
        }
    };
    const handleSubmitComment = async () => {
        if (!newComment.trim())
            return;
        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('comment_text', newComment);
            formData.append('comment_type', commentType);
            formData.append('priority', priority);
            formData.append('version', version?.toString() || '1');
            formData.append('created_by', currentUserId);
            attachments.forEach((file, index) => {
                formData.append(`attachment_${index}`, file);
            });
            const response = await fetch(`/api/designs/${designId}/comments`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                react_hot_toast_1.toast.success('Comment added successfully');
                setNewComment('');
                setCommentType('GENERAL');
                setPriority('NORMAL');
                setAttachments([]);
                fetchComments();
            }
            else {
                react_hot_toast_1.toast.error(result.message || 'Failed to add comment');
            }
        }
        catch (error) {
            console.error('Failed to add comment:', error);
            react_hot_toast_1.toast.error('Failed to add comment');
        }
        finally {
            setSubmitting(false);
        }
    };
    const handleSubmitReply = async (parentId) => {
        if (!replyText.trim())
            return;
        try {
            const formData = new FormData();
            formData.append('comment_text', replyText);
            formData.append('comment_type', 'GENERAL');
            formData.append('priority', 'NORMAL');
            formData.append('version', version?.toString() || '1');
            formData.append('parent_comment_id', parentId);
            formData.append('created_by', currentUserId);
            const response = await fetch(`/api/designs/${designId}/comments`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (response.ok) {
                react_hot_toast_1.toast.success('Reply added successfully');
                setReplyText('');
                setReplyingTo(null);
                fetchComments();
            }
            else {
                react_hot_toast_1.toast.error(result.message || 'Failed to add reply');
            }
        }
        catch (error) {
            console.error('Failed to add reply:', error);
            react_hot_toast_1.toast.error('Failed to add reply');
        }
    };
    const handleResolveComment = async (commentId) => {
        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'RESOLVED',
                    resolved_by: currentUserId
                })
            });
            if (response.ok) {
                react_hot_toast_1.toast.success('Comment resolved');
                fetchComments();
            }
            else {
                react_hot_toast_1.toast.error('Failed to resolve comment');
            }
        }
        catch (error) {
            console.error('Failed to resolve comment:', error);
            react_hot_toast_1.toast.error('Failed to resolve comment');
        }
    };
    const handleDeleteComment = async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?'))
            return;
        try {
            const response = await fetch(`/api/comments/${commentId}?user_id=${currentUserId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                react_hot_toast_1.toast.success('Comment deleted');
                fetchComments();
            }
            else {
                react_hot_toast_1.toast.error('Failed to delete comment');
            }
        }
        catch (error) {
            console.error('Failed to delete comment:', error);
            react_hot_toast_1.toast.error('Failed to delete comment');
        }
    };
    const handleFileChange = (event) => {
        const files = event.target.files;
        if (files) {
            setAttachments(prev => [...prev, ...Array.from(files)]);
        }
    };
    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'LOW': return 'bg-gray-100 text-gray-800';
            case 'NORMAL': return 'bg-blue-100 text-blue-800';
            case 'HIGH': return 'bg-orange-100 text-orange-800';
            case 'CRITICAL': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'RESOLVED': return <lucide_react_1.CheckCircle className="w-4 h-4 text-green-600"/>;
            case 'OPEN': return <lucide_react_1.Clock className="w-4 h-4 text-blue-600"/>;
            default: return <lucide_react_1.AlertCircle className="w-4 h-4 text-gray-600"/>;
        }
    };
    const formatFileSize = (bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    if (loading) {
        return (<card_1.Card className={className}>
        <card_1.CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading comments...</p>
        </card_1.CardContent>
      </card_1.Card>);
    }
    return (<card_1.Card className={className}>
      <card_1.CardHeader>
        <card_1.CardTitle className="flex items-center gap-2">
          <lucide_react_1.MessageCircle className="w-5 h-5"/>
          Comments & Feedback
          {comments.length > 0 && (<badge_1.Badge variant="secondary">{comments.length}</badge_1.Badge>)}
        </card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-6">
        {/* Add New Comment */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label_1.Label htmlFor="comment-type">Type</label_1.Label>
              <select_1.Select value={commentType} onValueChange={setCommentType}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="GENERAL">General</select_1.SelectItem>
                  <select_1.SelectItem value="REVISION_REQUEST">Revision Request</select_1.SelectItem>
                  <select_1.SelectItem value="APPROVAL">Approval</select_1.SelectItem>
                  <select_1.SelectItem value="REJECTION">Rejection</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
            
            <div>
              <label_1.Label htmlFor="priority">Priority</label_1.Label>
              <select_1.Select value={priority} onValueChange={setPriority}>
                <select_1.SelectTrigger>
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="LOW">Low</select_1.SelectItem>
                  <select_1.SelectItem value="NORMAL">Normal</select_1.SelectItem>
                  <select_1.SelectItem value="HIGH">High</select_1.SelectItem>
                  <select_1.SelectItem value="CRITICAL">Critical</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>
          
          <div>
            <label_1.Label htmlFor="new-comment">Your Comment</label_1.Label>
            <textarea_1.Textarea id="new-comment" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add your comment or feedback..." rows={3}/>
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label_1.Label>Attachments</label_1.Label>
              <div>
                <input type="file" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleFileChange} className="hidden" id="file-upload"/>
                <button_1.Button variant="outline" size="sm" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <lucide_react_1.Paperclip className="w-4 h-4 mr-1"/>
                    Add Files
                  </label>
                </button_1.Button>
              </div>
            </div>
            
            {attachments.length > 0 && (<div className="space-y-2">
                {attachments.map((file, index) => (<div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                    <div className="flex items-center gap-2">
                      {file.type.startsWith('image/') ? (<lucide_react_1.Image className="w-4 h-4 text-blue-500"/>) : (<lucide_react_1.FileText className="w-4 h-4 text-gray-500"/>)}
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button_1.Button size="sm" variant="ghost" onClick={() => removeAttachment(index)}>
                      <lucide_react_1.Trash className="w-4 h-4 text-red-500"/>
                    </button_1.Button>
                  </div>))}
              </div>)}
          </div>
          
          <button_1.Button onClick={handleSubmitComment} disabled={submitting || !newComment.trim()} className="w-full">
            <lucide_react_1.Send className="w-4 h-4 mr-2"/>
            {submitting ? 'Adding Comment...' : 'Add Comment'}
          </button_1.Button>
        </div>

        {/* Comments List */}
        {comments.length > 0 ? (<div className="space-y-4">
            {comments.map(comment => (<div key={comment.id} className="border rounded-lg">
                <div className="p-4">
                  {/* Comment Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <lucide_react_1.User className="w-4 h-4 text-gray-500"/>
                        <span className="font-medium text-sm">
                          {comment.creator.first_name} {comment.creator.last_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {comment.creator.position}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(comment.status)}
                        <badge_1.Badge variant="outline" size="sm" className={getPriorityColor(comment.priority)}>
                          {comment.priority}
                        </badge_1.Badge>
                        <badge_1.Badge variant="outline" size="sm">
                          {comment.comment_type.replace('_', ' ')}
                        </badge_1.Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <lucide_react_1.Calendar className="w-3 h-3"/>
                      {new Date(comment.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="mb-3">
                    <p className="text-sm whitespace-pre-wrap">{comment.comment_text}</p>
                    
                    {comment.attachments.length > 0 && (<div className="mt-3">
                        <h5 className="text-xs font-medium text-muted-foreground mb-2">Attachments:</h5>
                        <div className="flex flex-wrap gap-2">
                          {comment.attachments.map((url, index) => (<a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                              <lucide_react_1.FileText className="w-3 h-3"/>
                              Attachment {index + 1}
                            </a>))}
                        </div>
                      </div>)}
                  </div>

                  {/* Comment Actions */}
                  <div className="flex items-center gap-2">
                    <button_1.Button size="sm" variant="ghost" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
                      <lucide_react_1.Reply className="w-4 h-4 mr-1"/>
                      Reply
                    </button_1.Button>
                    
                    {comment.status === 'OPEN' && (<button_1.Button size="sm" variant="ghost" onClick={() => handleResolveComment(comment.id)}>
                        <lucide_react_1.CheckCircle className="w-4 h-4 mr-1"/>
                        Resolve
                      </button_1.Button>)}
                    
                    {comment.creator.id === currentUserId && (<button_1.Button size="sm" variant="ghost" onClick={() => handleDeleteComment(comment.id)}>
                        <lucide_react_1.Trash className="w-4 h-4 mr-1"/>
                        Delete
                      </button_1.Button>)}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (<div className="mt-4 p-3 bg-gray-50 rounded border">
                      <textarea_1.Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write your reply..." rows={2} className="mb-3"/>
                      <div className="flex gap-2">
                        <button_1.Button size="sm" onClick={() => handleSubmitReply(comment.id)} disabled={!replyText.trim()}>
                          Send Reply
                        </button_1.Button>
                        <button_1.Button size="sm" variant="outline" onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                    }}>
                          Cancel
                        </button_1.Button>
                      </div>
                    </div>)}
                </div>

                {/* Replies */}
                {comment.replies.length > 0 && (<div className="border-t bg-gray-50">
                    <div className="p-4 space-y-3">
                      {comment.replies.map(reply => (<div key={reply.id} className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <lucide_react_1.User className="w-3 h-3 text-gray-500"/>
                              <span className="font-medium text-xs">
                                {reply.creator.first_name} {reply.creator.last_name}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{reply.comment_text}</p>
                        </div>))}
                    </div>
                  </div>)}
              </div>))}
          </div>) : (<div className="text-center py-8">
            <lucide_react_1.MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4"/>
            <p className="text-muted-foreground">No comments yet</p>
            <p className="text-sm text-muted-foreground">Be the first to add feedback or comments</p>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
