import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  category?: string;
  authorName: string;
  imageUrl?: string;
  comments?: Comment[];
  likes?: Like[];
  likeCount?: number;
  likesCount?: number; // Backend sends likesCount
  isLikedByUser?: boolean;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  authorName: string;
  postId: number;
}

export interface Like {
  id: number;
  user: {
    id: number;
    username: string;
  };
  post: {
    id: number;
  };
}

export interface PostRequest {
  title: string;
  content: string;
  category: string;
  authorId: number;
}

export interface CommentRequest {
  content: string;
  postId: number;
  authorId: number;
}

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Posts
  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/api/forum/posts`);
  }

  getPost(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/api/forum/posts/${id}`);
  }

  createPost(post: PostRequest | FormData): Observable<Post> {
    // Si c'est déjà du FormData, l'envoyer directement
    if (post instanceof FormData) {
      return this.http.post<Post>(`${this.apiUrl}/api/forum/posts`, post);
    }

    // Convertir PostRequest en FormData
    const formData = new FormData();
    formData.append('title', post.title);
    formData.append('content', post.content);
    formData.append('category', post.category || '');
    formData.append('authorId', post.authorId.toString());

    return this.http.post<Post>(`${this.apiUrl}/api/forum/posts`, formData);
  }

  updatePost(id: number, post: PostRequest | FormData): Observable<Post> {
    // Si c'est déjà du FormData, l'envoyer directement
    if (post instanceof FormData) {
      return this.http.put<Post>(`${this.apiUrl}/api/forum/posts/${id}`, post);
    }

    // Convertir PostRequest en FormData
    const formData = new FormData();
    formData.append('title', post.title);
    formData.append('content', post.content);
    formData.append('category', post.category || '');
    formData.append('authorId', post.authorId.toString());

    return this.http.put<Post>(`${this.apiUrl}/api/forum/posts/${id}`, formData);
  }

  deletePost(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/forum/posts/${id}`);
  }

  // Likes
  likePost(postId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/forum/posts/${postId}/like`, {});
  }

  unlikePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/forum/posts/${postId}/like`);
  }

  // Comments
  getCommentsByPost(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/api/forum/posts/${postId}/comments`);
  }

  createComment(comment: CommentRequest): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/api/forum/posts/${comment.postId}/comments`, comment);
  }

  updateComment(id: number, comment: CommentRequest): Observable<Comment> {
    return this.http.put<Comment>(`${this.apiUrl}/api/forum/comments/${id}`, comment);
  }

  deleteComment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/forum/comments/${id}`);
  }

  getTrendingCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/forum/trending-categories`);
  }
}
