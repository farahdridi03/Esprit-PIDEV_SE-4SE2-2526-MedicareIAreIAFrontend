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

      

      // Vérifier que le titre n'est pas seulement des espaces

      if (title.length === 0) {

        return { whitespaceOnly: true };

      }

      

      // Vérifier que le titre commence par une lettre

      if (!/^[A-Za-zÀ-ÿ]/.test(title)) {

        return { invalidStart: true };

      }

      

      // Vérifier qu'il n'y a pas de caractères spéciaux non autorisés

      if (!/^[A-Za-zÀ-ÿ0-9\s\-_!?.,:;'"()]+$/.test(title)) {

        return { invalidCharacters: true };

      }

      

      return null;

    };

  }



  contentValidator() {

    return (control: any) => {

      if (!control.value) return null;

      const content = control.value.trim();

      

      // Vérifier que le contenu n'est pas seulement des espaces

      if (content.length === 0) {

        return { whitespaceOnly: true };

      }

      

      // Vérifier qu'il y a au moins 3 phrases (basé sur les points)

      const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);

      if (sentences.length < 2) {

        return { insufficientContent: true };

      }

      

      // Vérifier qu'il n'y a pas trop de caractères répétés

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

      category: this.postForm.value.category,

      authorId: userId

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

