import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Post, PostRequest, ForumService } from '../../services/forum.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss']
})
export class PostFormComponent {
  @Input() post: Post | null = null;
  @Input() isEditing = false;
  @Output() postSaved = new EventEmitter<Post>();
  @Output() cancel = new EventEmitter<void>();

  postForm: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private forumService: ForumService,
    private authService: AuthService
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      category: ['General Health', [Validators.required]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]]
    });
  }

  ngOnInit(): void {
    if (this.post) {
      this.postForm.patchValue({
        title: this.post.title,
        category: this.post.category || 'General Health',
        content: this.post.content
      });
    }
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.markFormGroupAsTouched(this.postForm);
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'Session expirée. Veuillez vous reconnecter.';
      return;
    }

    this.loading = true;
    this.error = null;

    const postData: PostRequest = {
      title: this.postForm.value.title,
      content: this.postForm.value.content,
      category: this.postForm.value.category
    };

    const action = this.isEditing && this.post
      ? this.forumService.updatePost(this.post.id, postData)
      : this.forumService.createPost(postData);

    action.subscribe({
      next: (savedPost) => {
        // Prevent synchronous component destruction issue causing Angular '_' error
        setTimeout(() => {
          this.postSaved.emit(savedPost);
          this.loading = false;
        });
      },
      error: (err) => {
        setTimeout(() => {
          this.error = 'Erreur lors de l\'enregistrement du post';
          this.loading = false;
        });
        console.error('Error saving post:', err);
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private markFormGroupAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupAsTouched(control);
      }
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.postForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Ce champ est obligatoire';
      }
      if (field.errors['minlength']) {
        return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      }
      if (field.errors['maxlength']) {
        return `Maximum ${field.errors['maxlength'].requiredLength} caractères`;
      }
    }
    return '';
  }
}
