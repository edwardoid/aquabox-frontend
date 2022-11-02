import { DevicesMap, HostsMap, RulesMap } from './../id-map';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  trigger,
  style,
  transition,
  animate
} from "@angular/animations"
import { AlertController, IonButton, NavController } from '@ionic/angular';
import { Rule } from '../rule';
import { AquaBoxService } from '../aqua-box.service';
import { AquaboxInstance } from '../aquabox-instance';
import { ValueChange } from '../valuechange';

@Component({
  selector: 'app-rule-wizard',
  templateUrl: './rule-wizard.page.html',
  styleUrls: ['./rule-wizard.page.scss'],
  animations: [
    trigger('listItemState', [
      transition('void => *', [
        style({ transform: 'translateX(-100%)' }),
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
export class RuleWizardPage implements OnInit {

  rule: Rule
  box: AquaboxInstance
  devices: any = []
  dates: any[] = []
  enableRule: boolean = true
  devClass: string = ""

  @ViewChild('doneButton') doneButton: IonButton;

  constructor(public alertController: AlertController,
    private route: ActivatedRoute,
    private navi: NavController,
    private aquabox: AquaBoxService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let boxId = this.route.snapshot.paramMap.get("box");
    let devId = this.route.snapshot.paramMap.get("dev");
    let ruleId = this.route.snapshot.paramMap.get("rule");

    this.aquabox.getHosts((hosts: HostsMap) => {
      this.box = hosts.find(boxId);

      if (!this.box) {
        this.navi.navigateRoot("/home");
      }

      this.box.getDevices((devices: DevicesMap) => {
        for (let dev of devices) {
          this.devices.push({
            id: dev.id,
            name: dev.name
          });

          if (ruleId) {
            this.box.getRules((rules: RulesMap) => {
              this.rule = rules.find(ruleId);
            });

            if (!this.rule) {
              this.navi.navigateRoot("/home");
            }
          }
          else {
            this.rule = new Rule(this.box);
            this.rule.device = devId;
            this.doneButton.disabled = this.rule.actions.length == 0 || this.rule.name.length == 0;
          }

          if (dev.id == devId) {
            this.devClass = dev.deviceClass
          }
        }
      });
    });
  }

  nameChanged(event: any) {
    this.rule.name = event.target.value;
    this.doneButton.disabled = this.rule.actions.length == 0 || this.rule.name.length == 0;
  }

  addAction() {
    let vt = new ValueChange();
    vt.value = -1;

    var nextDate = new Date(Date.now());
    if (this.dates.length > 0) {
      nextDate = new Date(Date.parse(this.dates[this.dates.length - 1]) + 600 * 1000);
    }
    this.dates.push(nextDate.toISOString());
    this.rule.actions.push(vt)
    this.doneButton.disabled = this.rule.actions.length == 0 || this.rule.name.length == 0;
  }

  removeAction(act: any) {
    let idx = this.rule.actions.indexOf(act);
    this.rule.actions.splice(idx, 1);
    this.dates.splice(idx, 1);
    this.doneButton.disabled = this.rule.actions.length == 0 || this.rule.name.length == 0;
  }

  reorderActions(indexes) {
    let element = this.rule.actions[indexes.from];
    this.rule.actions.splice(indexes.from, 1);
    this.rule.actions.splice(indexes.to, 0, element);

    this.dates.splice(indexes.from, 1);
    this.dates.splice(indexes.to, 0, indexes.from);
  }

  private buildCron(d: Date) {
    let date = new Date(d);
    return  [ "0" /*date.getSeconds() */,
              date.getMinutes(),
              date.getHours(),
              "*" /*date.getDate()*/,
              "*" /*(date.getMonth() + 1)*/,
              "*"].join(" ");
  }

  save() {
    this.rule.enabled = this.enableRule
    this.rule.created_at = Date.now();
    this.rule.last_run = 0;
    for (let i in this.rule.actions) {
      this.rule.actions[i].cron =  this.buildCron(this.dates[i]);
    }
    if (this.rule.id == "-1") {
      this.rule.generateId();
    }
    this.aquabox.getHosts((hosts: HostsMap) => {
      for (let host of hosts) {
        this.rule.save((result: boolean) => {
          if (result)
            this.navi.navigateBack("/rules/" + this.box.id + "/" + this.rule.device);
        });
        return;
      }
    });
  }
}
