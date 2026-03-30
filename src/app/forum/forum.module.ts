import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { ForumRoutingModule } from './forum-routing.module';
import { ForumService } from './services/forum.service';
import { NonPatientGuard } from './guards/non-patient.guard';

import { ForumModerationComponent } from './pages/forum-moderation/forum-moderation.component';
import { ForumPublicComponent } from './pages/forum-public/forum-public.component';
import { PostFormComponent } from './components/post-form/post-form.component';
import { TrendingTopicsComponent } from './components/trending-topics/trending-topics.component';

@NgModule({
  declarations: [
    ForumModerationComponent,
    ForumPublicComponent,
    PostFormComponent,
    TrendingTopicsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ForumRoutingModule
  ],
  providers: [
    ForumService,
    NonPatientGuard
  ],
  exports: [
    ForumModerationComponent,
    ForumPublicComponent,
    PostFormComponent,
    TrendingTopicsComponent
  ]
})
export class ForumModule { }
