import { UpdateEvent } from './../update-event';
import { Rule } from './../rule';
import { HostsMap, RulesMap } from './../id-map';
import { NavController, AlertController } from '@ionic/angular';
import { AquaBoxService } from './../aqua-box.service';
import { Component, OnInit } from '@angular/core';
import { Device } from '../device';
import { ActivatedRoute } from '@angular/router';
import { Aquabox } from '../aquabox';
import { trigger, style, transition, animate } from "@angular/animations"
import { ValueChange } from '../valuechange';

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
  public rules: RulesMap;
  public now: number = Date.now();

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
            self.rules = rules;
          });
      } else {
        self.navi.navigateRoot("/home");
      }
    });

    this.aquabox.Updates.subscribe((event: UpdateEvent) => {
      if (event.Box != boxId) {
        return;
      }
      if (event.Class != UpdateEvent.Rule) {
        return;
      }

      self.now = Date.now() / 1000;

      if (event.Data["action"] == "deleted") {
        self.rules.removeById(event.Sender);
      }
      else if (event.Data["action"] == "created") {
        let r = new Rule(self.box);
        r.deserialize(event.Properties["*"]);
        r.subscribeForUpdates();
        self.rules.insert(r, true)
      }
    });

    setInterval(() => {
      self.now = Date.now() / 1000;
    }, 1000);
  }

  remain(rule: Rule) {
    let r = (rule.created_at + rule.delete_after);
    r -= this.now;
    if (r < 2) {
      return " now";
    }
    if (r < 3) {
      return " very soon";
    }
    let n = r % 3600;
    let mins = Math.floor(n / 60);
    let seconds = Math.ceil(n % 60);
    if (mins > 0)
      return "in " + mins + "m " + seconds + "s";
    else
      return "in " + seconds + "s";
  }

  progress(rule: Rule) {
    return 1 - (this.now - rule.created_at) / rule.delete_after
  }

  toggleEnabled(rule: Rule) {
    let curr = rule.enabled;
    rule.enabled = !curr;
    rule.update();
    rule.enabled = curr;
  }

  addNewRule() {
    this.navi.navigateForward("rule-wizard/" + this.box.configuration.id + "/" + this.device.id)
  }

  createTemporaryRule(timeoutInMinutes) {
    let now = new Date();
    let later = new Date(Date.now() + timeoutInMinutes * 60 * 1000);

    let rule = new Rule(this.box);
    rule.name = "Toggle in " + timeoutInMinutes + " minutes."
    rule.generateId();
    let first = new ValueChange();
    first.property = "on"
    first.cron =  now.getSeconds() + " " +
                  now.getMinutes() + " " +
                  now.getHours() + " " +
                  now.getDate() + " " +
                  (now.getMonth() + 1) + " " +
                  "* "
    first.when = now.getTime();
    first.value = this.device.isOn ? 0 : 1;

    let second = new ValueChange();
    second.property = "on";
    second.value = this.device.isOn ? 1 : 0
    second.cron = later.getSeconds() + " " +
                  later.getMinutes() + " " +
                  later.getHours() + " " +
                  later.getDate() + " " +
                  (later.getMonth() + 1) + " " +
                  "*";
    second.when = later.getTime();

    rule.device = this.device.id;
    rule.delete_after = timeoutInMinutes * 60 + 1;
    rule.created_at = now.getTime() / 1000;
    rule.last_run = now.getTime() / 1000;
    rule.actions = [ first, second ];

    rule.save();
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
                self.rules.removeById(rule.id);
            });
          }
        }
      ]
    });

    await alert.present();
  }
}
