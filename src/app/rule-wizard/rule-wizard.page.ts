import { ActionType } from './../actiontype';
import {
  Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations"
import { AlertController } from '@ionic/angular';
import { Rule } from '../rule';
import { AquaBoxService } from '../aqua-box.service';
import { Action } from '../action';

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
  constructor(public alertController: AlertController,
    private aquabox: AquaBoxService) {
    this.rule = new Rule(this.aquabox);
    this.rule.device = "dev1";
  }

  ngOnInit() {
  }

  async selectWorkDays() {
    const alert = await this.alertController.create({
      header: 'Checkbox',
      inputs: [
        {
          name: 'checkbox1',
          type: 'checkbox',
          label: 'Checkbox 1',
          value: 'value1',
          checked: true
        },

        {
          name: 'checkbox2',
          type: 'checkbox',
          label: 'Checkbox 2',
          value: 'value2'
        },

        {
          name: 'checkbox3',
          type: 'checkbox',
          label: 'Checkbox 3',
          value: 'value3'
        },

        {
          name: 'checkbox4',
          type: 'checkbox',
          label: 'Checkbox 4',
          value: 'value4'
        },

        {
          name: 'checkbox5',
          type: 'checkbox',
          label: 'Checkbox 5',
          value: 'value5'
        },

        {
          name: 'checkbox6',
          type: 'checkbox',
          label: 'Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6 Checkbox 6',
          value: 'value6'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: () => {
            console.log('Confirm Ok');
          }
        }
      ]
    });

    await alert.present();
  }

  addAction() {
    let type = ActionType.TurnOn;

    if (this.rule.actions.length != 0 && this.rule.actions[this.rule.actions.length - 1].type == ActionType.TurnOn) {
      type = ActionType.TurnOff;
    }
    this.rule.actions.push(new Action(type))
  }

  removeAction(act: any) {
    this.rule.actions.splice(this.rule.actions.indexOf(act), 1);
  }

  reorderActions(indexes) {
    let element = this.rule.actions[indexes.from];
    this.rule.actions.splice(indexes.from, 1);
    this.rule.actions.splice(indexes.to, 0, element);
  }

  save() {
    for (let k in this.aquabox.getHosts()) {
      this.rule.save(this.aquabox.hosts[k]);
      break;
    }
  }
}
