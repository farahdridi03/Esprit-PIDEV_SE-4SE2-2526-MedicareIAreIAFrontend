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

  selectedFile: File | null = null;

  imagePreview: string | null = null;

  selectedFileName: string | null = null;



  constructor(

    private fb: FormBuilder,

    private forumService: ForumService,

    private authService: AuthService

  ) {

    this.postForm = this.fb.group({

      title: ['', [

        Validators.required, 

        Validators.minLength(5), 

        Validators.maxLength(200),

        this.titleValidator()

      ]],

      category: ['General Health', [Validators.required]],

      content: ['', [

        Validators.required, 

        Validators.minLength(20), 

        Validators.maxLength(2000),

        this.contentValidator()

      ]]

    });

  }



  // Custom validators

  titleValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const title = control.value.trim();
      
      // Check that the title is not just whitespace
      if (title.length === 0) {
        return { whitespaceOnly: true };
      }
      
      // Check that the title starts with a letter
      if (!/^[A-Za-z]/.test(title)) {
        return { invalidStart: true };
      }
      
      // Check for disallowed special characters
      if (!/^[A-Za-z0-9\s\-_!?.,:;'"()]+$/.test(title)) {
        return { invalidCharacters: true };
      }
      
      return null;
    };
  }



  contentValidator() {
    return (control: any) => {
      if (!control.value) return null;
      const content = control.value.trim();
      
      // Check that the content is not just whitespace
      if (content.length === 0) {
        return { whitespaceOnly: true };
      }
      
      // Check that there are at least 5 words
      const words = content.split(/\s+/).filter((s: string) => s.trim().length > 0);
      if (words.length < 5) {
        return { insufficientContent: true };
      }
      
      // Check for excessive repeating characters
      if (/(.)\1{5,}/.test(content)) {
        return { excessiveRepetition: true };
      }
      
      return null;
    };
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
    console.log('onSubmit called');
    console.log('Form valid:', this.postForm.valid);
    console.log('Form value:', this.postForm.value);
    console.log('Form errors:', this.postForm.errors);
    console.log('Title errors:', this.postForm.get('title')?.errors);
    console.log('Content errors:', this.postForm.get('content')?.errors);
    
    if (this.postForm.invalid) {
      console.log('Form is invalid, marking as touched');
      this.markFormGroupAsTouched(this.postForm);
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'Session expired. Please log in again.';
      return;
    }

    this.loading = true;
    this.error = null;

    // Create FormData to handle file upload
    const formData = new FormData();
    formData.append('title', this.postForm.value.title);
    formData.append('content', this.postForm.value.content);
    formData.append('category', this.postForm.value.category);
    formData.append('authorId', userId.toString());
    
    // Ajouter l'image si elle existe
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const action = this.isEditing && this.post
      ? this.forumService.updatePost(this.post.id, formData)
      : this.forumService.createPost(formData);

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
          this.error = 'Error while saving post';
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
        return 'This field is required';
      }
      
      if (field.errors['minlength']) {
        return `Minimum ${field.errors['minlength'].requiredLength} characters`;
      }
      
      if (field.errors['maxlength']) {
        return `Maximum ${field.errors['maxlength'].requiredLength} characters`;
      }
      
      if (field.errors['whitespaceOnly']) {
        return 'Field cannot contain only whitespace';
      }
      
      if (field.errors['invalidStart']) {
        return 'Title must start with a letter';
      }
      
      if (field.errors['invalidCharacters']) {
        return 'Disallowed characters in title';
      }
      
      if (field.errors['insufficientContent']) {
        return 'Content must contain at least 5 words';
      }
      
      if (field.errors['excessiveRepetition']) {
        return 'Too many consecutive characters repeated';
      }
      
      if (field.errors['invalidFileType']) {
        return 'Only image files are allowed (JPG, PNG, GIF)';
      }
      
      if (field.errors['fileTooLarge']) {
        return 'File size must not exceed 5MB';
      }
    }
    
    return '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validation du type de fichier
      if (!file.type.startsWith('image/')) {
        this.postForm.get('image')?.setErrors({ invalidFileType: true });
        this.postForm.get('image')?.markAsTouched();
        return;
      }
      
      // Validation de la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.postForm.get('image')?.setErrors({ fileTooLarge: true });
        this.postForm.get('image')?.markAsTouched();
        return;
      }
      
      this.selectedFile = file;
      this.selectedFileName = file.name;
      
      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      // Effacer les erreurs précédentes
      this.postForm.get('image')?.setErrors(null);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.selectedFileName = null;
    
    // Réinitialiser l'input file
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

}
