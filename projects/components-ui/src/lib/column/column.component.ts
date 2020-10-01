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
  @Input() public orderDirection?: 'ASC' | 'DESC' | 'NONE';
  @Output() public orderDirectionChange: EventEmitter<'ASC' | 'DESC' | 'NONE'> = new EventEmitter<'ASC' | 'DESC' | 'NONE'>();
  @Input() public orderIndex?: number;

  public get filter(): any {
    return this.filterValue;
  }
  public set filter(value: any) {
    this.filterValue = value;
    this.filterValueChange.emit(this.filterValue);
    // console.info(`filter value sent: ${this.filterValue}`);
  }

  public get orderDir(): 'ASC' | 'DESC' | 'NONE' {
    return this.orderDir;
  }
  public set orderDir(value: 'ASC' | 'DESC' | 'NONE') {
    this.orderDirection = value;
    this.orderDirectionChange.emit(value);
  }
  public toggleOrderDirection(): void {
    switch (this.orderDir) {
      case 'NONE':
        this.orderDir = 'ASC';
        break;
      case 'ASC':
        this.orderDir = 'DESC';
        break;
      case 'DESC':
        this.orderDir = 'NONE';
        break;    
      default:
        break;
    }
  }

  // public constructor() { }

  public ngOnInit(): void {
    // nothing to do
  }

}
