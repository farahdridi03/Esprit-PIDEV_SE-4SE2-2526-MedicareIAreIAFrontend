import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ForumService, Post, Comment, CommentRequest } from '../../services/forum.service';
import { WhatsAppService } from '../../services/whatsapp.service';
import { MessagingService, ChatChannel, ChatMessage, ChatMessageRequest } from '../../services/messaging.service';
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
  bellPulse = false;
  private notifSub?: Subscription;

  // Search & filter
  searchQuery = '';
  categoryFilter = '';

  // User Info for Topbar
  userName: string = '';
  userInitials: string = '';
  
  // Reaction System
  activeReactionPostId: number | null = null;
  postReactions: { [postId: number]: string } = {};
  reactions = [
    { type: 'like', icon: '👍', color: '#3b82f6' },
    { type: 'love', icon: '❤️', color: '#ef4444' },
    { type: 'haha', icon: '😂', color: '#f59e0b' },
    { type: 'wow', icon: '😲', color: '#8b5cf6' },
    { type: 'sad', icon: '😢', color: '#facc15' }
  ];

  // Messaging (sidebar)
  showMessaging = false;
  channels: ChatChannel[] = [];
  activeChannel: ChatChannel | null = null;
  channelMessages: ChatMessage[] = [];
  newChatMessage = '';
  sendingMessage = false;
  private msgSub?: Subscription;

  // WhatsApp
  sendingWhatsApp = false;
  whatsappSuccess = false;

  // Comment image
  commentImageFile: File | null = null;
  commentImagePreview: string | null = null;
  commentViolationError: string | null = null;

  // Code Blue
  showCodeBlueModal = false;
  activeCodeBlue: any = null;
  codeBluePresences: any[] = [];
  codeBlueCountdown = 300;
  codeBlucMeetLink = '';
  private countdownInterval: any = null;
  currentUserConfirmed = false;

  // Trending Topics
  trendingKeywords: { word: string; count: number; score: number }[] = [];
  trendingLastUpdated: Date | null = null;
  private trendingInterval: any = null;
  private likeSub?: Subscription;

  // Archive filter
  showArchived = true;

  constructor(
    private forumService: ForumService,
    private whatsAppService: WhatsAppService,
    private messagingService: MessagingService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    this.loadUserInfo();
    this.connectNotifications();
    this.loadChannels();
    this.checkActiveCodeBlue();
    this.loadTrendingKeywords();
    this.connectLikeUpdates();
    // auto-refresh trending + posts every 2 min (matches backend scheduler)
    this.trendingInterval = setInterval(() => {
      this.loadTrendingKeywords();
      this.loadPosts();
    }, 120_000);
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
    this.msgSub?.unsubscribe();
    this.likeSub?.unsubscribe();
    this.notificationService.disconnect();
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.trendingInterval) clearInterval(this.trendingInterval);
  }

  // ── Notifications temps réel (WebSocket STOMP) ────────────────
  connectNotifications(): void {
    // 1) Charger le compteur initial depuis le serveur
    this.notificationService.fetchUnreadCount();

    // 2) S'abonner au compteur (BehaviorSubject)
    this.notifSub = this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });

    // 3) Ouvrir la connexion WebSocket avec le token JWT
    const token = this.authService.getToken();
    if (token) {
      this.notificationService.connect(token);
    }

    // 4) Écouter les nouvelles notifications en temps réel
    this.notificationService.onNewNotification().subscribe(notif => {
      if (notif.type === 'CODE_BLUE') {
        if (this.isMedicalStaff()) {
          this.openCodeBlueModal(notif);
        }
        return;
      }
      // Insérer en tête de liste si le dropdown est déjà ouvert
      this.notifications = [notif, ...this.notifications];
      // Faire pulser la cloche visuellement
      this.bellPulse = true;
      setTimeout(() => { this.bellPulse = false; }, 2000);
    });
  }

  connectLikeUpdates(): void {
    this.likeSub = this.notificationService.onLikeUpdate().subscribe(update => {
      // mettre à jour le post dans la liste
      const post = this.posts.find(p => p.id === update.postId);
      if (post) post.likesCount = update.likesCount;
      // mettre à jour le post sélectionné si ouvert
      if (this.selectedPost?.id === update.postId) {
        this.selectedPost.likesCount = update.likesCount;
      }
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

  getCurrentRole(): string {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return (currentUser.role || '').toUpperCase().replace(/^ROLE_/, '');
  }

  isMedicalStaff(): boolean {
    const role = this.getCurrentRole();
    return ['DOCTOR', 'CLINIC', 'PHARMACIST', 'LABORATORY_STAFF', 'NUTRITIONIST', 'HOME_CARE_PROVIDER', 'ADMIN'].includes(role);
  }

  // Seuls DOCTOR, PHARMACIST, NUTRITIONIST, LABORATORIST peuvent poster
  canCreatePost(): boolean {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser?.token) return false;
    const allowedRoles = ['DOCTOR', 'PHARMACIST', 'NUTRITIONIST', 'LABORATORIST', 'LABORATORY_STAFF', 'ADMIN'];
    return allowedRoles.includes(this.getCurrentRole());
  }

  // PATIENT et VISITOR peuvent uniquement liker et commenter
  canOnlyLikeAndComment(): boolean {
    return ['PATIENT', 'VISITOR', ''].includes(this.getCurrentRole());
  }

  // Seul l'auteur du post (ou ADMIN) peut modifier/supprimer
  isPostAuthor(post: Post): boolean {
    const role = this.getCurrentRole();
    if (role === 'ADMIN') return true;
    const medicalRoles = ['DOCTOR','CLINIC','PHARMACIST','LABORATORY_STAFF','NUTRITIONIST','HOME_CARE_PROVIDER'];
    if (!medicalRoles.includes(role)) return false;
    const currentUserId = this.authService.getUserId();
    return post.authorId !== undefined && post.authorId === currentUserId;
  }

  // Peut envoyer une alerte WhatsApp (tous les posts, rôles pro)
  canSendWhatsApp(_post: Post): boolean {
    return this.canCreatePost();
  }

  showRestrictedAccessMessage(action: string): void {
    const role = this.getCurrentRole();
    if (role === 'PATIENT') {
      alert(`As a patient, you cannot ${action}. Only healthcare professionals can create or modify posts.`);
    } else {
      alert(`You do not have the required permissions to ${action}.`);
    }
  }

  // ── Role display helpers ──────────────────────────────────
  getRoleLabel(role?: string): string {
    switch (role?.toUpperCase()) {
      case 'DOCTOR':            return 'Doctor';
      case 'PHARMACIST':        return 'Pharmacist';
      case 'NUTRITIONIST':      return 'Nutritionist';
      case 'LABORATORIST':      return 'Lab Staff';
      case 'LABORATORY_STAFF':  return 'Lab Staff';
      case 'HOME_CARE_PROVIDER': return 'Home Care';
      case 'CLINIC':            return 'Clinic';
      case 'ADMIN':             return 'Admin';
      case 'PATIENT':           return 'Patient';
      default:                  return role || 'Member';
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
      case 'ALERT':         return 'Alert';
      case 'CLINICAL_CASE': return 'Clinical Case';
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

  // ── WhatsApp ──────────────────────────────────────────────
  sendWhatsAppAlert(post: Post): void {
    if (!post.postType || post.postType !== 'ALERT') return;
    this.sendingWhatsApp = true;
    this.whatsAppService.sendAlert({
      postId: post.id,
      postTitle: post.title,
      postContent: post.content,
      authorName: post.authorName,
      authorRole: post.authorRole || '',
      targetRoles: ['DOCTOR', 'PHARMACIST', 'LABORATORIST', 'LABORATORY_STAFF']
    }).subscribe({
      next: (res) => {
        post.whatsappSent = res.sent;
        post.whatsappCount = res.recipientCount;
        this.sendingWhatsApp = false;
        this.whatsappSuccess = true;
        setTimeout(() => this.whatsappSuccess = false, 4000);
      },
      error: () => { this.sendingWhatsApp = false; }
    });
  }

  // ── Messaging sidebar ─────────────────────────────────────
  loadChannels(): void {
    this.messagingService.getChannels().subscribe({
      next: (ch) => this.channels = ch,
      error: () => {
        // Fallback channels si backend pas encore prêt
        this.channels = [
          { id: 1, name: 'alerts-urgentes',  unreadCount: 3 },
          { id: 2, name: 'cardiologie',       unreadCount: 0 },
          { id: 3, name: 'pharmacie',         unreadCount: 1 },
          { id: 4, name: 'nutrition',         unreadCount: 0 }
        ];
      }
    });
  }

  toggleMessaging(): void {
    this.showMessaging = !this.showMessaging;
    if (this.showMessaging && !this.activeChannel && this.channels.length > 0) {
      this.selectChannel(this.channels[0]);
    }
  }

  selectChannel(channel: ChatChannel): void {
    this.msgSub?.unsubscribe();
    this.activeChannel = channel;
    this.channelMessages = [];
    this.msgSub = this.messagingService.pollMessages(channel.id).subscribe({
      next: (msgs) => {
        const userId = this.authService.getUserId();
        this.channelMessages = msgs.map(m => ({
          ...m,
          isOwn: m.authorName === this.userName
        }));
      },
      error: () => {}
    });
  }

  sendChatMessage(): void {
    if (!this.newChatMessage.trim() || !this.activeChannel) return;
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.sendingMessage = true;
    const req: ChatMessageRequest = {
      channelId: this.activeChannel.id,
      content: this.newChatMessage.trim(),
      authorId: userId
    };
    this.messagingService.sendMessage(req).subscribe({
      next: (msg) => {
        this.channelMessages.push({ ...msg, isOwn: true });
        this.newChatMessage = '';
        this.sendingMessage = false;
      },
      error: () => { this.sendingMessage = false; }
    });
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

    // Hide archived posts by default
    if (!this.showArchived) {
      result = result.filter(p => (p as any).status !== 'ARCHIVED');
    }

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

  loadTrendingKeywords(): void {
    this.forumService.getTrendingKeywords().subscribe({
      next: (data) => {
        this.trendingKeywords = data.slice(0, 8);
        this.trendingLastUpdated = new Date();
      },
      error: () => { this.trendingKeywords = []; }
    });
  }

  getMaxTrendingScore(): number {
    if (!this.trendingKeywords.length) return 1;
    return Math.max(...this.trendingKeywords.map(k => k.score || 1));
  }

  getScorePercent(kw: { score: number }): number {
    return Math.round((kw.score / this.getMaxTrendingScore()) * 100);
  }

  searchByKeyword(word: string): void {
    this.searchQuery = word;
    this.selectedPost = null;
    this.isCreating = false;
    this.isEditing = false;
  }

  archivedPostsCount(): number {
    return this.posts.filter(p => (p as any).status === 'ARCHIVED').length;
  }

  getPostTrendingKeywords(post: Post): { word: string; count: number }[] {
    if (!post || !this.trendingKeywords.length) return [];
    const text = ((post.title || '') + ' ' + (post.content || '')).toLowerCase();
    return this.trendingKeywords.filter(kw => text.includes(kw.word.toLowerCase()));
  }

  isArchived(post: Post): boolean {
    return (post as any).status === 'ARCHIVED';
  }

  // ── Code Blue ─────────────────────────────────────────────

  // Appelé au chargement — pour les users qui ouvrent le forum après le déclenchement
  checkActiveCodeBlue(): void {
    if (!this.isMedicalStaff()) return;
    this.forumService.getActiveCodeBlues().subscribe({
      next: (activePosts) => {
        if (activePosts.length > 0 && !this.showCodeBlueModal) {
          const post = activePosts[0];
          this.openCodeBlueModal({
            id: post.id,
            title: 'CODE BLUE',
            message: 'Urgence active : ' + post.title,
            type: 'CODE_BLUE',
            relatedId: post.id,
            isRead: false,
            createdAt: post.codeBlueTriggeredAt,
            meetLink: post.meetLink || ''
          });
        }
      },
      error: () => {}
    });
  }

  openCodeBlueModal(notif: any): void {
    // Extraire le lien Meet depuis le message SSE (format: "texte | MEET:https://...")
    let meetLink = notif.meetLink || '';
    if (!meetLink && notif.message && notif.message.includes('| MEET:')) {
      meetLink = notif.message.split('| MEET:')[1]?.trim() || '';
      notif.message = notif.message.split('| MEET:')[0]?.trim();
    }
    this.codeBlucMeetLink = meetLink;
    this.activeCodeBlue = notif;
    this.showCodeBlueModal = true;
    this.currentUserConfirmed = false;
    this.codeBlueCountdown = 300;
    this.startCountdown();
    if (notif.relatedId) {
      this.forumService.getCodeBluePresences(notif.relatedId).subscribe({
        next: (p) => { this.codeBluePresences = p; },
        error: () => {}
      });
    }
  }

  startCountdown(): void {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      if (this.codeBlueCountdown > 0) {
        this.codeBlueCountdown--;
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  confirmCodeBluePresence(): void {
    if (!this.activeCodeBlue?.relatedId) return;
    this.forumService.confirmCodeBluePresence(this.activeCodeBlue.relatedId).subscribe({
      next: () => {
        this.currentUserConfirmed = true;
        this.forumService.getCodeBluePresences(this.activeCodeBlue.relatedId).subscribe({
          next: (p) => { this.codeBluePresences = p; },
          error: () => {}
        });
      },
      error: () => {}
    });
  }

  resolveCodeBlue(): void {
    if (!this.activeCodeBlue?.relatedId) return;
    this.forumService.resolveCodeBlue(this.activeCodeBlue.relatedId).subscribe({
      next: () => {
        this.closeCodeBlueModal();
        this.loadPosts();
      },
      error: () => {}
    });
  }

  closeCodeBlueModal(): void {
    this.showCodeBlueModal = false;
    this.activeCodeBlue = null;
    this.codeBluePresences = [];
    if (this.countdownInterval) clearInterval(this.countdownInterval);
  }

  formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  canResolveCodeBlue(): boolean {
    const role = this.getCurrentRole();
    return role === 'DOCTOR' || role === 'ADMIN';
  }

  backToDashboard(): void {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const rawRole = currentUser.role || '';
    const userRole = rawRole.toUpperCase().replace(/^ROLE_/, '');

    const routes: Record<string, string> = {
      DOCTOR:            '/front/doctor/dashboard',
      PATIENT:           '/front/patient/dashboard',
      PHARMACIST:        '/front/pharmacist/dashboard',
      CLINIC:            '/front/clinic/dashboard',
      NUTRITIONIST:      '/front/nutritionist/dashboard',
      LABORATORY_STAFF:  '/front/laboratorystaff/dashboard',
      HOME_CARE_PROVIDER:'/front/home-care/dashboard',
      ADMIN:             '/admin/dashboard',
    };

    this.router.navigate([routes[userRole] || '/front/patient/dashboard']);
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

  onCommentImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.commentViolationError = 'Invalid format. Only JPEG, PNG, GIF and WEBP are accepted.';
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.commentViolationError = 'Image is too large. Maximum allowed size is 5 MB.';
      input.value = '';
      return;
    }

    this.commentViolationError = null;
    this.commentImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.commentImagePreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  removeCommentImage(): void {
    this.commentImageFile = null;
    this.commentImagePreview = null;
  }

  canDeleteComment(comment: Comment): boolean {
    const userId = this.authService.getUserId();
    return userId !== null && Number(comment.authorId) === Number(userId);
  }

  deleteComment(commentId: number): void {
    if (!confirm('Delete this comment?')) return;
    this.forumService.deleteComment(commentId).subscribe({
      next: () => {
        if (this.selectedPost?.comments) {
          this.selectedPost.comments = this.selectedPost.comments.filter(c => c.id !== commentId);
        }
      },
      error: (err) => console.error('Error deleting comment:', err)
    });
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
        } else if (err.status === 400 && err.error?.error) {
          this.commentViolationError = err.error.error;
        } else {
          console.error('Error creating comment:', err);
        }
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
