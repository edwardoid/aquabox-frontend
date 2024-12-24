import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddNewHostPage } from './add-new-host.page';

const routes: Routes = [
  {
    path: '',
    component: AddNewHostPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddNewHostPageRoutingModule {}
