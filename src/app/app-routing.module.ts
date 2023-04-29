import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { zip } from 'rxjs';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(x => x.HomePageModule )
  },
  {
    path: 'version',
    loadChildren: () => import('./version/version.module').then(x => x.VersionPageModule )
  },
  {
    path: 'devices/:box',
    loadChildren: () => import('./devices/devices.module').then(x => x.DevicesPageModule )
  },
  {
    path: 'rules/:box/:dev',
    loadChildren: () => import('./rules/rules.module').then(x => x.RulesPageModule)
  },
  {
    path: 'qrscanning',
    loadChildren: () => import('./qrscanning/qrscanning.module').then(x => x.QRScanningPageModule )
  },
  {
    path: 'rule-wizard/:box/:dev',
    loadChildren: () => import('./rule-wizard/rule-wizard.module').then(x => x.RuleWizardPageModule)
  },
  {
    path: 'rule-wizard/:box/:dev/:rule',
    loadChildren: () => import('./rule-wizard/rule-wizard.module').then(x => x.RuleWizardPageModule )
  },
  { path: 'add-new-host', loadChildren: () => import('./add-new-host/add-new-host.module').then(x => x.AddNewHostPageModule) },
  { path: 'settings/:box', loadChildren: () => import('./host-settings/host-settings.module').then(x => x.HostSettingsPageModule) },
  { path: 'device-setup/:box/:dev', loadChildren: () => import('./device-setup/device-setup.module').then(x => x.DeviceSetupPageModule) },
  { path: 'network/:box', loadChildren: () => import('./network-setup/network-setup.module').then(x => x.NetworkSetupPageModule) },
  { path: 'about', loadChildren: () => import('./about/about.module').then(x => x.AboutPageModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
