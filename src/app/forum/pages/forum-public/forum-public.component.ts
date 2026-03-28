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

  // Search & filter
  searchQuery = '';
  categoryFilter = '';

  constructor(private forumService: ForumService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPosts();
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
    return this.posts.reduce((s, p) => s + (p.likeCount || 0), 0);
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


  likePost(post: Post): void {
    if (post.isLikedByUser) {
      this.forumService.unlikePost(post.id).subscribe({
        next: () => {
          post.isLikedByUser = false;
          post.likeCount = (post.likeCount || 0) - 1;
        },
        error: (err) => {
          console.error('Error unliking post:', err);
        }
      });
    } else {
      this.forumService.likePost(post.id).subscribe({
        next: () => {
          post.isLikedByUser = true;
          post.likeCount = (post.likeCount || 0) + 1;
        },
        error: (err) => {
          console.error('Error liking post:', err);
        }
      });
    }
  }

  submitComment(): void {
    if (!this.newComment.trim() || !this.selectedPost) {
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
        
        // Mettre à jour le nombre de commentaires du post
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
}
