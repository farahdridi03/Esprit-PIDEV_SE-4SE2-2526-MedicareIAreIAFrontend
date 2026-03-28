import { Component, OnInit } from '@angular/core';
import { ForumService, Post, PostRequest } from '../../services/forum.service';
import { AuthService } from '../../../services/auth.service';

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
  isEditing = false;
  isCreating = false;

  // Filter / sort
  searchQuery = '';
  categoryFilter = '';
  sortMode: 'recent' | 'popular' = 'recent';

  // Comment
  newCommentContent = '';
  submittingComment = false;

  constructor(private forumService: ForumService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = null;
    this.forumService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
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

    if (this.sortMode === 'popular') {
      result.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }

  getTotalComments(): number {
    return this.posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);
  }

  getTotalLikes(): number {
    return this.posts.reduce((sum, p) => sum + (p.likeCount || 0), 0);
  }

  getInitial(name?: string): string {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  selectPost(post: Post): void {
    this.selectedPost = post;
    this.isEditing = false;
    this.isCreating = false;
    this.newCommentContent = '';
  }

  createPost(): void {
    this.selectedPost = null;
    this.isCreating = true;
    this.isEditing = false;
  }

  editPost(post: Post): void {
    this.selectedPost = post;
    this.isEditing = true;
    this.isCreating = false;
  }

  deletePost(post: Post): void {
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

  onPostSaved(post: Post): void {
    this.loadPosts();
    this.selectedPost = post;
    this.isEditing = false;
    this.isCreating = false;
  }

  onCancel(): void {
    this.selectedPost = null;
    this.isEditing = false;
    this.isCreating = false;
  }

  toggleLike(post: Post): void {
    const action = post.isLikedByUser
      ? this.forumService.unlikePost(post.id)
      : this.forumService.likePost(post.id);

    action.subscribe({
      next: () => {
        post.isLikedByUser = !post.isLikedByUser;
        post.likeCount = (post.likeCount || 0) + (post.isLikedByUser ? 1 : -1);
      },
      error: (err) => console.error('Error toggling like:', err)
    });
  }

  addComment(postId: number): void {
    if (!this.newCommentContent.trim()) return;

    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    this.submittingComment = true;
    this.forumService.createComment({
      content: this.newCommentContent,
      postId: postId,
      authorId: userId
    }).subscribe({
      next: (comment) => {
        if (this.selectedPost && this.selectedPost.id === postId) {
          if (!this.selectedPost.comments) this.selectedPost.comments = [];
          this.selectedPost.comments.push(comment);
        }
        this.newCommentContent = '';
        this.submittingComment = false;
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.submittingComment = false;
      }
    });
  }
}
