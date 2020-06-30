import { AquaBoxService } from './../aqua-box.service';
import { Component, OnInit } from '@angular/core';
import { Device } from '../device';
import { ActivatedRoute } from '@angular/router';
import { Aquabox } from '../aquabox';

@Component({
  selector: 'app-rules',
  templateUrl: 'rules.page.html',
  styleUrls: ['rules.page.scss']
})
export class RulesPage implements OnInit {

  private box: Aquabox;
  public device: Device;

  public rules: Device[]

  constructor(private aquabox: AquaBoxService,
              private route: ActivatedRoute) {
    this.rules = [this.device];
  }

  ngOnInit() {
    let boxId = this.route.snapshot.paramMap.get("box");
    let devId = this.route.snapshot.paramMap.get("dev");
    this.aquabox.getHosts((hosts: Map<string, Aquabox>) => {
      this.box = hosts[boxId];
      if (this.box) {
        this.device = this.box.getDevice(devId);
      }
    });
  }
  // add back when alpha.4 is out
  // navigate(item) {
  //   this.router.navigate(['/list', JSON.stringify(item)]);
  // }
}
