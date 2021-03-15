import { Component, Input, OnInit } from '@angular/core';
import { ValueChange } from 'src/app/valuechange';


@Component({
  selector: 'app-step-action',
  templateUrl: './step-action.component.html',
  styleUrls: ['./step-action.component.scss'],
})
export class StepActionComponent implements OnInit {

  @Input() change: ValueChange;
  @Input() idx: number;
  @Input() editable: boolean;
  public unit: string = "ml";
  constructor() { }

  ngOnInit() {
    if (this.editable) {
      this.change.property = "times";
      this.change.value = 1;
    }
  }

  actionName() {
    if (this.change.value == 0) {
      return "Turn off"
    }
    return "Turn on"
  }
}
