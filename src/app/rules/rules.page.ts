import { Action } from './../action';
import { Rule } from './../rule';
import { HostsMap, RulesMap } from './../id-map';
import { NavController, AlertController } from '@ionic/angular';
import { AquaBoxService } from './../aqua-box.service';
import { Component, OnInit } from '@angular/core';
import { Device } from '../device';
import { ActivatedRoute } from '@angular/router';
import { Aquabox } from '../aquabox';
import { trigger, style, transition, animate } from "@angular/animations"

@Component({
  selector: 'app-rules',
  templateUrl: 'rules.page.html',
  styleUrls: ['rules.page.scss'],
  animations: [
    trigger('listItemState', [
        transition('void => *', [
            style({transform: 'translateX(-100%)'}),
            animate('100ms ease-out')
        ]),
        transition('* => void', [
          animate('500ms ease-out', style({
            opacity: 0,
            height: '0px',
            minHeight: '0px'
          }))
      ])
    ])
  ]
})
export class RulesPage implements OnInit {

  private box: Aquabox;
  public device: Device

  public rules: Rule[]

  constructor(private navi: NavController,
              private aquabox: AquaBoxService,
              private route: ActivatedRoute,
              private alertController: AlertController) {
  }

  ngOnInit() {
    let boxId = this.route.snapshot.paramMap.get("box");
    let devId = this.route.snapshot.paramMap.get("dev");
    let self = this;
    this.aquabox.getHosts((hosts: HostsMap) => {
      self.box = hosts.find(boxId);
      if (this.box) {
        self.device = this.box.devices.find(devId);
        if (!this.device)
          self.navi.navigateRoot("/home");
        else
          self.device.rules((rules: RulesMap) => {
            self.rules = [];
            for (let rule of rules.valuesArray()) {
              self.rules.push(rule);
            }
          });
      } else {
        self.navi.navigateRoot("/home");
      }
    });
  }

  addNewRule() {
    this.navi.navigateForward("rule-wizard/" + this.box.configuration.id + "/" + this.device.id)
  }

  async removeRule(rule: Rule) {
    let self = this;
    const alert = await this.alertController.create({
      header: "You are about to delete rule",
      message: "Do you really want to delete <strong>" + rule.name + "</strong>. This operation can not be reverted",
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Delete anyway',
          handler: () => {
            rule.delete((result: boolean) => {
              if (result)
                self.rules.splice(self.rules.indexOf(rule), 1);
            });
          }
        }
      ]
    });

    await alert.present();
  }
}
