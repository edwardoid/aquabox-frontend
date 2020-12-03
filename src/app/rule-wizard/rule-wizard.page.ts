import { DevicesMap, HostsMap, RulesMap } from './../id-map';
import { ActivatedRoute } from '@angular/router';
import { ActionType } from './../actiontype';
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
import { Action } from '../action';
import { Aquabox } from '../aquabox';

@Component({
  selector: 'app-rule-wizard',
  templateUrl: './rule-wizard.page.html',
  styleUrls: ['./rule-wizard.page.scss'],
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
export class RuleWizardPage implements OnInit {

  rule: Rule
  box: Aquabox
  devices: any = []
  dates: any[] = []

  @ViewChild('doneButton') doneButton: IonButton;

  constructor(public alertController: AlertController,
              private route: ActivatedRoute,
              private navi: NavController,
              private aquabox: AquaBoxService) {
    let boxId = this.route.snapshot.paramMap.get("box");
    let devId = this.route.snapshot.paramMap.get("dev");
    let ruleId = this.route.snapshot.paramMap.get("rule");

    this.aquabox.getHosts((hosts: HostsMap) => {
        this.box = hosts.find(boxId);

        if (!this.box) {
          navi.navigateRoot("/home");
        }

        this.box.getDevices((devices: DevicesMap) => {
          for(let dev of devices) {
            this.devices.push({ 
              id: dev.id,
              name: dev.name
            });

            if (ruleId) {
              this.box.getRules((rules: RulesMap) => {
                this.rule = rules.find(ruleId);
              });

              if (!this.rule) {
                navi.navigateRoot("/home");
              }
            }
            else {
              this.rule = new Rule(this.box);
              this.rule.device = devId;
            }
          }
        });
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    
    this.doneButton.disabled = this.rule.actions.length == 0 || this.rule.name.length == 0;
    
  }

  nameChanged(event: any) {
    this.rule.name = event.target.value;
    this.doneButton.disabled = this.rule.actions.length == 0 || this.rule.name.length == 0;
  }

  addAction() {
    let type = ActionType.TurnOn;

    if (this.rule.actions.length != 0 && this.rule.actions[this.rule.actions.length - 1].type == ActionType.TurnOn) {
      type = ActionType.TurnOff;
    }

    var nextDate = new Date(Date.now());
    if (this.dates.length > 0) {
      nextDate = new Date(Date.parse(this.dates[this.dates.length - 1]) + 600 * 1000);
    }
    this.dates.push(nextDate.toISOString());
    this.rule.actions.push(new Action(type))
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

  save() {
    for (let i in this.rule.actions) {
      this.rule.actions[i].at = Date.parse(this.dates[i]);
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
