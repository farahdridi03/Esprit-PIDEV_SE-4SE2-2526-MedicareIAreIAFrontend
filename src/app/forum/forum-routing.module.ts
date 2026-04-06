import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NonPatientGuard } from './guards/non-patient.guard';
import { ForumModerationComponent } from './pages/forum-moderation/forum-moderation.component';
import { ForumPublicComponent } from './pages/forum-public/forum-public.component';

const routes: Routes = [
  {
    path: '',
    component: ForumPublicComponent,
    title: 'Forum Public'
  },
  {
    path: 'moderation',
    component: ForumModerationComponent,
    canActivate: [NonPatientGuard],
    title: 'Modération Forum'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ForumRoutingModule { }
