import { Component, Input, OnInit } from '@angular/core';
import { ValueChange } from 'src/app/valuechange';


@Component({
  selector: 'app-relay-action',
  templateUrl: './relay-action.component.html',
  styleUrls: ['./relay-action.component.scss'],
})
export class RelayActionComponent implements OnInit {

  @Input() change: ValueChange;
  @Input() idx: number;
  @Input() editable: boolean;
  constructor() { }

  ngOnInit() {
    if (this.editable) {
      this.change.property = "on";
      if (this.change.value < 0) {
        this.change.value = this.idx % 2;
      }
    }
  }

  toggle() {
    if (this.editable)
      this.change.value = this.change.value == 1 ? 0 : 1;
  }

  actionName() {
    if (this.change.value == 0) {
      return "Turn off"
    }
    return "Turn on"
  }
}
