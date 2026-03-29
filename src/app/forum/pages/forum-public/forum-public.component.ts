import { Component, OnInit } from '@angular/core';
import { ForumService, Post, Comment, CommentRequest } from '../../services/forum.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forum-public',
  templateUrl: './forum-public.component.html',
  styleUrls: ['./forum-public.component.scss']
})
export class ForumPublicComponent implements OnInit {
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

  constructor(private forumService: ForumService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  canCreatePost(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser || !currentUser.token) return false;
    
    // Les patients ne peuvent pas créer de posts
    const patientRoles = ['PATIENT'];
    const rawRole = currentUser.role || '';
    const userRole = rawRole.toUpperCase().replace(/^ROLE_/, '');
    
    return !patientRoles.includes(userRole);
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

  getInitial(name?: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  getTotalComments(): number {
    return this.posts.reduce((s, p) => s + (p.comments?.length || 0), 0);
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

  toggleLike(post: Post): void {
    if (post.isLikedByUser) {
      this.forumService.unlikePost(post.id).subscribe({
        next: () => {
          // Update the post in the posts array
          const postInArray = this.posts.find(p => p.id === post.id);
          if (postInArray) {
            postInArray.isLikedByUser = false;
            postInArray.likesCount = (postInArray.likesCount || 0) - 1;
          }
          
          // Also update selectedPost if it's the same post
          if (this.selectedPost && this.selectedPost.id === post.id) {
            this.selectedPost.isLikedByUser = false;
            this.selectedPost.likesCount = (this.selectedPost.likesCount || 0) - 1;
          }
        },
        error: (err) => {
          console.error('Error unliking post:', err);
        }
      });
    } else {
      this.forumService.likePost(post.id).subscribe({
        next: () => {
          // Update the post in the posts array
          const postInArray = this.posts.find(p => p.id === post.id);
          if (postInArray) {
            postInArray.isLikedByUser = true;
            postInArray.likesCount = (postInArray.likesCount || 0) + 1;
          }
          
          // Also update selectedPost if it's the same post
          if (this.selectedPost && this.selectedPost.id === post.id) {
            this.selectedPost.isLikedByUser = true;
            this.selectedPost.likesCount = (this.selectedPost.likesCount || 0) + 1;
          }
        },
        error: (err) => {
          console.error('Error liking post:', err);
        }
      });
    }
  }

  likePost(post: Post): void {
    this.toggleLike(post);
  }

  submitComment(): void {
    if (!this.selectedPost || !this.newComment.trim()) {
      return;
    }

    this.submittingComment = true;
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User not authenticated');
      this.submittingComment = false;
      return;
    }
    
    const commentRequest: CommentRequest = {
      content: this.newComment.trim(),
      postId: this.selectedPost.id,
      authorId: userId
    };

    this.forumService.createComment(commentRequest).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.newComment = '';
        this.submittingComment = false;
        
        // Update the post in the posts array
        const postInArray = this.posts.find(p => p.id === this.selectedPost!.id);
        if (postInArray) {
          if (!postInArray.comments) postInArray.comments = [];
          postInArray.comments.unshift(comment);
        }
        
        // Also update selectedPost
        if (this.selectedPost) {
          this.selectedPost.comments = [...(this.selectedPost.comments || []), comment];
        }
      },
      error: (err) => {
        console.error('Error creating comment:', err);
        this.submittingComment = false;
      }
    });
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'à l\'instant';
    if (diffInMinutes < 60) return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR');
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
