import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'ift-column',
  templateUrl: './column.component.html',
  styleUrls: ['./column.component.css']
})
export class ColumnComponent implements OnInit {
  @Input() public label: string;
  @Input() public isFilterVisible?: boolean;
  @Input() public filterValue?: any;
  @Output() public filterValueChange: EventEmitter<any> = new EventEmitter<any>();

  public get filter(): any {
    return this.filterValue;
  }
  public set filter(value: any) {
    this.filterValue = value;
    this.filterValueChange.emit(this.filterValue);
    console.info(`filter value sent: ${this.filterValue}`);
  }

  public constructor() { }

  public ngOnInit(): void {
  }

}
