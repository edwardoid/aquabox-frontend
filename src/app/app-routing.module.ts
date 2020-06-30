import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'devices/:box',
    loadChildren: './devices/devices.module#DevicesPageModule'
  },
  {
    path: 'rules/:box/:dev',
    loadChildren: './rules/rules.module#RulesPageModule'
  },
  {
    path: 'qrscanning',
    loadChildren: './qrscanning/qrscanning.module#QRScanningPageModule'
  },
  {
    path: 'rule-wizard/:box/:dev',
    loadChildren: './rule-wizard/rule-wizard.module#RuleWizardPageModule'
  },
  {
    path: 'rule-wizard/:box/:dev/:rule',
    loadChildren: './rule-wizard/rule-wizard.module#RuleWizardPageModule'
  },
  { path: 'add-new-host', loadChildren: './add-new-host/add-new-host.module#AddNewHostPageModule' },
  { path: 'settings/:box', loadChildren: './host-settings/host-settings.module#HostSettingsPageModule' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
