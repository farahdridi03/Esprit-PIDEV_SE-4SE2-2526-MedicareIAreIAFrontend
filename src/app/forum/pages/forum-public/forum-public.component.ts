import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ForumService, Post, Comment, CommentRequest } from '../../services/forum.service';
import { AuthService } from '../../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { NotificationService, ForumNotification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

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
  showComments = false; // Toggle for comment card visibility

  // Notifications
  unreadCount = 0;
  notifications: ForumNotification[] = [];
  showNotifDropdown = false;
  private notifSub?: Subscription;

  // Search & filter
  searchQuery = '';
  categoryFilter = '';

  // User Info for Topbar
  userName: string = '';
  userInitials: string = '';
  
  // Reaction System
  activeReactionPostId: number | null = null;
  postReactions: { [postId: number]: string } = {}; // Local storage for simulation
  reactions = [
    { type: 'like', icon: '👍', color: '#3b82f6' },
    { type: 'love', icon: '❤️', color: '#ef4444' },
    { type: 'haha', icon: '😂', color: '#f59e0b' },
    { type: 'wow', icon: '😲', color: '#8b5cf6' },
    { type: 'sad', icon: '😢', color: '#facc15' }
  ];

  constructor(
    private forumService: ForumService, 
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    this.loadUserInfo();
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    if (this.notifSub) {
      this.notifSub.unsubscribe();
    }
  }

  loadNotifications(): void {
    this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });
  }

  toggleNotifDropdown(): void {
    this.showNotifDropdown = !this.showNotifDropdown;
    if (this.showNotifDropdown) {
      this.notificationService.getNotifications().subscribe(notifs => {
        this.notifications = notifs;
      });
    }
  }

  markNotifAsRead(notif: ForumNotification): void {
    this.notificationService.markAsRead(notif.id).subscribe(() => {
      notif.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      
      // If it's a social notif, select the post
      if (notif.relatedId) {
        const post = this.posts.find(p => p.id === notif.relatedId);
        if (post) {
          this.selectPost(post);
          this.showNotifDropdown = false;
        }
      }
    });
  }

  loadUserInfo(): void {
    const fullName = this.authService.getUserFullName();
    this.userName = fullName || 'User';
    this.userInitials = this.getInitial(this.userName);
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
      alert(`As a patient, you are not authorized to ${action}. Please contact a healthcare professional to create or modify posts.`);
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
      this.showRestrictedAccessMessage('delete posts');
      return;
    }
    
    if (confirm(`Delete post "${post.title}"?`)) {
      this.forumService.deletePost(post.id).subscribe({
        next: () => {
          this.loadPosts();
          this.selectedPost = null;
        },
        error: (err) => {
          this.error = 'Error while deleting post';
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
          isLikedByUser: false // To be implemented with authentication logic
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error while loading posts';
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

  backToDashboard(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const rawRole = currentUser.role || '';
    const userRole = rawRole.toUpperCase().replace(/^ROLE_/, '');

    if (userRole === 'DOCTOR') {
      this.router.navigate(['/front/doctor/dashboard']);
    } else {
      this.router.navigate(['/front/patient/dashboard']);
    }
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
    this.showComments = false; // Reset toggle on post selection
    if (!post.comments || post.comments.length === 0) {
      this.loadComments(post.id);
    }
  }

  toggleComments(): void {
    this.showComments = !this.showComments;
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

  likePost(post: Post): void {
    if (post.isLikedByUser) {
      this.forumService.unlikePost(post.id).subscribe({
        next: () => {
          post.isLikedByUser = false;
          post.likesCount = (post.likesCount || 1) - 1;
          delete this.postReactions[post.id];
          
          // Sync with selectedPost if needed
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
          this.postReactions[post.id] = '❤️'; // Default to heart
          
          // Sync with selectedPost if needed
          if (this.selectedPost && this.selectedPost.id === post.id) {
            this.selectedPost.isLikedByUser = true;
            this.selectedPost.likesCount = post.likesCount;
          }
        }
      });
    }
  }

  onReactionSelect(post: Post, reaction: any): void {
    if (!post.isLikedByUser) {
      this.forumService.likePost(post.id).subscribe({
        next: () => {
          post.isLikedByUser = true;
          post.likesCount = (post.likesCount || 0) + 1;
          this.postReactions[post.id] = reaction.icon;
          this.activeReactionPostId = null;
          
          if (this.selectedPost && this.selectedPost.id === post.id) {
            this.selectedPost.isLikedByUser = true;
            this.selectedPost.likesCount = post.likesCount;
          }
        }
      });
    } else {
      this.postReactions[post.id] = reaction.icon;
      this.activeReactionPostId = null;
    }
  }

  toggleReactionPicker(postId: number, event: Event): boolean {
    event.preventDefault(); // Empêcher le menu contextuel par défaut
    this.activeReactionPostId = (this.activeReactionPostId === postId) ? null : postId;
    return false;
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
        this.newComment = '';
        this.submittingComment = false;
        
        // selectedPost and postInArray point to the same reference. 
        // We only need to push the new comment ONCE to their common comments list.
        if (this.selectedPost) {
          if (!this.selectedPost.comments) {
            this.selectedPost.comments = [];
          }
          // We use unshift to put it at the beginning (most recent)
          this.selectedPost.comments.unshift(comment);
        }
        
        // Sync with the local comments array if needed for legacy visibility
        this.comments = this.selectedPost?.comments || [];
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
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US');
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    
    let baseUrl = environment.apiUrl;
    // Si baseUrl finit par / et imagePath commence par /, on enlève un /
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    
    return `${cleanBaseUrl}${cleanPath}`;
  }

  handleImageError(event: any): void {
    // Hide the broken image if it fails to load
    event.target.style.display = 'none';
    if (event.target.parentElement) {
      event.target.parentElement.style.display = 'none';
    }
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

  onTrendingCategorySelected(category: string): void {
    if (this.categoryFilter === category) {
      this.categoryFilter = ''; // Deselect if already selected
    } else {
      this.categoryFilter = category;
    }
    // Scroll to posts feed
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }
}
