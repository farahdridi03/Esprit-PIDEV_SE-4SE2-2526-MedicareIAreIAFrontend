import { Component, OnInit } from '@angular/core';
import { ForumService, Post, Comment, CommentRequest } from '../../services/forum.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forum-moderation',
  templateUrl: './forum-moderation.component.html',
  styleUrls: ['./forum-moderation.component.scss']
})
export class ForumModerationComponent implements OnInit {
  posts: Post[] = [];
  loading = false;
  error: string | null = null;
  selectedPost: Post | null = null;
  comments: Comment[] = [];
  loadingComments = false;
  newComment: string = '';
  submittingComment = false;
  isCreating = false;
  isEditing = false;

  // Search & filter
  searchQuery = '';
  categoryFilter = '';
  sortMode: 'recent' | 'popular' = 'recent';

  // Reactions
  reactions = [
    { type: 'like', icon: '👍', color: '#3b82f6' },
    { type: 'love', icon: '❤️', color: '#ef4444' },
    { type: 'haha', icon: '😂', color: '#f59e0b' },
    { type: 'wow', icon: '😲', color: '#8b5cf6' },
    { type: 'sad', icon: '😢', color: '#facc15' }
  ];
  postReactions: { [postId: number]: string } = {};
  activeReactionPostId: number | null = null;

  // Comment image
  commentImageFile: File | null = null;
  commentImagePreview: string | null = null;
  commentViolationError: string | null = null;

  constructor(private forumService: ForumService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  canCreatePost(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.token) return false;
    
    // Les patients ne peuvent pas créer/éditer de posts
    const patientRoles = ['PATIENT'];
    const rawRole = currentUser.role || '';
    const userRole = rawRole.toUpperCase().replace(/^ROLE_/, '');
    
    // Autoriser les médecins, administrateurs, etc.
    const allowedRoles = ['DOCTOR', 'ADMIN', 'PHARMACIST', 'NUTRITIONIST', 'LABORATORY'];
    
    return !patientRoles.includes(userRole) && (allowedRoles.includes(userRole) || userRole === '');
  }

  showRestrictedAccessMessage(action: string): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const rawRole = currentUser.role || '';
    const userRole = rawRole.toUpperCase().replace(/^ROLE_/, '');
    
    if (userRole === 'PATIENT') {
      alert(`En tant que patient, vous n'êtes pas autorisé à ${action}. Veuillez contacter un professionnel de santé pour créer ou modifier des posts.`);
    }
  }

  createPost(): void {
    if (!this.canCreatePost()) {
      this.showRestrictedAccessMessage('créer des posts');
      return;
    }
    
    this.isCreating = true;
    this.selectedPost = null;
    this.isEditing = false;
  }

  editPost(post: Post): void {
    if (!this.canCreatePost()) {
      this.showRestrictedAccessMessage('modifier des posts');
      return;
    }
    
    this.selectedPost = post;
    this.isEditing = true;
    this.isCreating = false;
  }

  deletePost(post: Post): void {
    if (!this.canCreatePost()) {
      this.showRestrictedAccessMessage('supprimer des posts');
      return;
    }
    
    if (confirm(`Supprimer le post "${post.title}" ?`)) {
      this.forumService.deletePost(post.id).subscribe({
        next: () => {
          this.loadPosts();
          this.selectedPost = null;
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression du post';
          console.error('Error deleting post:', err);
        }
      });
    }
  }

  onPostSaved(post: Post | any): void {
    this.loadPosts();
    this.selectedPost = post;
    this.isEditing = false;
    this.isCreating = false;
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;
    this.forumService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts.map(post => ({
          ...post,
          isLikedByUser: false // À implémenter avec l'authentification
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des posts';
        this.loading = false;
        console.error('Error loading posts:', err);
      }
    });
  }

  filteredPosts(): Post[] {
    let result = [...this.posts];
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.authorName?.toLowerCase().includes(q)
      );
    }
    if (this.categoryFilter) {
      result = result.filter(p => p.category === this.categoryFilter);
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getRoleLabel(role?: string): string {
    switch (role?.toUpperCase()) {
      case 'DOCTOR':       return 'Médecin';
      case 'PHARMACIST':   return 'Pharmacien';
      case 'NUTRITIONIST': return 'Nutritionniste';
      case 'LABORATORIST':    return 'Laborantin';
      case 'LABORATORY_STAFF': return 'Laborantin';
      case 'PATIENT':      return 'Patient';
      default:             return role || 'Membre';
    }
  }

  getRoleColor(role?: string): string {
    switch (role?.toUpperCase()) {
      case 'DOCTOR':       return '#2563eb';
      case 'PHARMACIST':   return '#7c3aed';
      case 'NUTRITIONIST': return '#059669';
      case 'LABORATORIST':     return '#0891b2';
      case 'LABORATORY_STAFF': return '#0891b2';
      default:             return '#64748b';
    }
  }

  getPostTypeLabel(type?: string): string {
    switch (type) {
      case 'ALERT':         return 'Alerte';
      case 'CLINICAL_CASE': return 'Cas Clinique';
      case 'CODE_BLUE':     return 'Code Blue';
      default:              return 'Discussion';
    }
  }

  getPostTypeBadgeClass(type?: string): string {
    switch (type) {
      case 'ALERT':         return 'badge-alert';
      case 'CLINICAL_CASE': return 'badge-clinical';
      case 'CODE_BLUE':     return 'badge-code-blue';
      default:              return 'badge-discussion';
    }
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    let baseUrl = environment.apiUrl;
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    return `${cleanBaseUrl}${cleanPath}`;
  }

  handleImageError(event: any): void {
    event.target.style.display = 'none';
    if (event.target.parentElement) {
      event.target.parentElement.style.display = 'none';
    }
  }

  onCommentImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) return;
    this.commentImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.commentImagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  removeCommentImage(): void {
    this.commentImageFile = null;
    this.commentImagePreview = null;
  }

  toggleLike(post: Post): void {
    if (post.isLikedByUser) {
      this.forumService.unlikePost(post.id).subscribe({
        next: () => {
          post.isLikedByUser = false;
          post.likesCount = (post.likesCount || 1) - 1;
          if (this.selectedPost && this.selectedPost.id === post.id) {
            this.selectedPost.isLikedByUser = false;
            this.selectedPost.likesCount = post.likesCount;
          }
        }
      });
    } else {
      this.forumService.likePost(post.id).subscribe({
        next: () => {
          post.isLikedByUser = true;
          post.likesCount = (post.likesCount || 0) + 1;
          if (this.selectedPost && this.selectedPost.id === post.id) {
            this.selectedPost.isLikedByUser = true;
            this.selectedPost.likesCount = post.likesCount;
          }
        }
      });
    }
  }

  submitComment(): void {
    if (!this.selectedPost || !this.newComment.trim()) return;
    this.submittingComment = true;
    this.commentViolationError = null;
    const userId = this.authService.getUserId();
    if (!userId) { this.submittingComment = false; return; }

    const commentRequest: CommentRequest = {
      content: this.newComment.trim(),
      postId: this.selectedPost.id,
      authorId: userId
    };

    this.forumService.createComment(commentRequest, this.commentImageFile || undefined).subscribe({
      next: (comment) => {
        this.newComment = '';
        this.commentImageFile = null;
        this.commentImagePreview = null;
        this.submittingComment = false;
        if (this.selectedPost) {
          if (!this.selectedPost.comments) this.selectedPost.comments = [];
          this.selectedPost.comments.unshift(comment);
        }
        this.comments = this.selectedPost?.comments || [];
      },
      error: (err) => {
        this.submittingComment = false;
        if (err.status === 422 && err.error?.error === 'CONTENT_VIOLATION') {
          this.commentViolationError = err.error.message;
        } else {
          console.error('Error creating comment:', err);
        }
      }
    });
  }

  getTotalComments(): number {
    return this.posts.reduce((s, p) => s + (p.comments?.length || 0), 0);
  }

  getInitial(name?: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getTotalLikes(): number {
    return this.posts.reduce((s, p) => s + (p.likesCount || 0), 0);
  }

  selectPost(post: Post): void {
    this.selectedPost = post;
    this.newComment = '';
    if (!post.comments || post.comments.length === 0) {
      this.loadComments(post.id);
    }
  }

  loadComments(postId: number): void {
    this.loadingComments = true;
    this.forumService.getCommentsByPost(postId).subscribe({
      next: (comments) => {
        this.comments = comments;
        if (this.selectedPost) {
          this.selectedPost.comments = comments;
        }
        this.loadingComments = false;
      },
      error: (err) => {
        console.error('Error loading comments:', err);
        this.loadingComments = false;
      }
    });
  }

  backToList(): void {
    this.selectedPost = null;
    this.comments = [];
    this.newComment = '';
  }

  onCancel(): void {
    this.selectedPost = null;
    this.isEditing = false;
    this.isCreating = false;
  }
}
