import {HttpClient} from '@angular/common/http';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange} from '@angular/core';
import {RecordLayout} from '../../model/record-layout';
import { AccessFunctions } from '../access-functions';
import { RecordListLayout } from '@all41-dev/ui-components';
//import AccessFunctions from '../access-functions';

@Component({
  selector: 'ift-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.css']
})
export class RecordComponent<T> implements OnInit, OnChanges {
  @Input() public id?: any;
  @Input() public layout: RecordLayout<T> & RecordListLayout<T>;
  @Input() public record: T|undefined;
  @Output() public recordChange: EventEmitter<T> = new EventEmitter<T>();
  @Input() public url: string;
  public inst: RecordComponent<T>;

  public getRestricted = false;
  public patchRestricted = false;
  public deleteRestricted = false;
  public postRestricted = false;

  public labelsWidth = 'inherit';
  public valuesWidth = 'inherit';
  public componentWidth = 'inherit';
  public componentHeight = 'inherit';
  public title = '';
  public currentUrl: string = undefined;

  // eslint-disable-next-line @typescript-eslint/no-parameter-properties
  public constructor(private http: HttpClient, private access: AccessFunctions) {
    this.inst = this;
  }

  public checkScopes(): void {
    if(this.layout.postScope !== undefined && !this.access.hasAccess([this.layout.postScope])) this.postRestricted = true;

    if(this.layout.patchScope !== undefined && !this.access.hasAccess([this.layout.patchScope])) this.patchRestricted=true;

    if(this.layout.getScope !== undefined && !this.access.hasAccess([this.layout.getScope])) this.getRestricted=true;
  }

  public cancelChanges(): void {
    if(!this.getRestricted){
      this.http.get(`${this.layout.entityUrl}/${this.record[this.layout.primaryKeyProperty]}`)
        .subscribe((resp: T[]): T => this.record = resp[0],
          (e): void => {
            if(e.status == 403) this.getRestricted = true;
            console.error(JSON.stringify(e));
          });
    }
  }

  // noinspection JSMethodCanBeStatic
  public cancelShortcut(event, cancelButton: HTMLElement): void {
    event.preventDefault();
    event.stopPropagation();

    cancelButton.focus();
    cancelButton.click();
  }

  // todo: this is very expensive, to be optimized
  public isModified(): boolean {
    if (this.record === undefined) {
      return false;
    }
    // test all editable fields of the entity here
    const modifiedProps = this.layout.columns
      .filter((c): boolean =>
        this.record[c.recordProperty + 'Modified'] === true
      );

    return modifiedProps.length > 0;
  }

  public isValid(): boolean {
    if (this.record === undefined) {
      return false;
    }
    return this.layout.columns.filter((c): boolean => {
      return c.isValid !== undefined && !c.isValid(this.record);
    }).length === 0;
  }

  public ngOnInit(): void {
    if (this.layout.labelsWidth !== undefined) {
      this.labelsWidth = this.layout.labelsWidth;
    }
    if (this.layout.valuesWidth !== undefined) {
      this.valuesWidth = this.layout.valuesWidth;
    }
    if (['left', 'right'].includes(this.layout.detailPosition)) {
      if (this.layout.labelsWidth !== undefined && this.layout.valuesWidth !== undefined) {
        const width =  parseInt(this.layout.labelsWidth.replace('px', ''), 10) +
          parseInt(this.layout.valuesWidth.replace('px', ''), 10);
        this.componentWidth = `${width + 19}px`;
        this.componentHeight = `${this.layout.height}px`;
      }  
    } else {
      this.componentWidth = `${this.getWidth() + 19}px`;
      //height is kept as default
    }
    if (this.layout.title !== undefined) {
      this.title = this.layout.title;
    }

    if ((this.layout.entityUrl || this.layout.getUrl) && !this.url) {
      this.url = this.layout.getUrl || this.layout.entityUrl;
    }
    
    this.checkScopes();

    if (this.layout.loadOnInit === undefined || this.layout.loadOnInit) {
      this.load();
    }
  }

  public ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    for (const propName in changes) {
      if (!changes.hasOwnProperty(propName)) { continue; }
      const changedProp = changes[propName];
      switch (propName) {
        case 'layout' :
          if (changedProp.currentValue !== undefined) {
            const getUrl = this.layout.getUrl === undefined ?
              this.layout.entityUrl : this.layout.getUrl;
            if (this.currentUrl !== getUrl) {
              // prevent execution if loadOnInit is false & the change hapens during init
              if (this.currentUrl) {
                this.load();
              }
              this.currentUrl = getUrl;
            }
          }
          break;
        case 'url' :
          if (changedProp.currentValue !== undefined) {
            // console.info('url change detected');
            this.load();
          }
          break;
      }
      // console.info(propName + ' ' + JSON.stringify(changedProp.currentValue));
    }
  }

  public load(): void {
    if (this.url !== undefined) {
      this.currentUrl = this.url;
      if(!this.getRestricted){
        this.http.get<T[]>(`${this.url}`)
          .subscribe((resp: T[]): void => {
            this.record = resp[0] === undefined ? undefined : 
              this.layout.load ? this.layout.load(resp[0]) : resp[0];
            if (this.record) {
              if (this.layout.initRecord) { this.record = this.layout.initRecord([this.record])}
              (this.record as any).__primaryKey = this.record[this.layout.primaryKeyProperty];
            }
            this.recordChange.emit(this.record);
          }, (e): void => {
            if(e.status == 403) this.getRestricted = true;
            console.error(JSON.stringify(e));
          });
      }
    } else if (this.id === undefined) {
      this.currentUrl = undefined;
      // No id provided, nothing displayed if read only, new record if edit
      if (!this.record) {
        this.record = {} as T;
        this.recordChange.emit(this.record);
      }
    } else {
      this.currentUrl = `${this.layout.entityUrl}/${this.id}`;
      if(!this.getRestricted){
        this.http.get<T[]>(this.currentUrl)
          .subscribe((resp: T[]): void => {
            this.record = resp[0] === undefined ? undefined : 
              this.layout.load ? this.layout.load(resp[0]) : resp[0];
            if (this.record) {
              if (this.layout.initRecord) { this.record = this.layout.initRecord([this.record])}
              (this.record as any).__primaryKey = this.record[this.layout.primaryKeyProperty];
            }
            this.recordChange.emit(this.record);
          }, (e): void => {
            if(e.status == 403) this.getRestricted = true;
            console.error(JSON.stringify(e));
          });
      }
    }
  }


  public async save(): Promise<void> {
    if (this.layout.save !== undefined) {
      const res = await this.layout.save(this.record);
      this.record = this.layout.load ? this.layout.load(res) : res;
      return;
    }

    if (this.record['__primaryKey']) {
      if(!this.patchRestricted){
        const pk = this.record['__primaryKey'];
        this.record['__primaryKey'] = undefined;
        this.http.patch(`${this.layout.entityUrl}/${pk}`, this.record)
          .subscribe((resp: T | T[]): void => {
            this.record = Array.isArray(resp) ?
              resp[0] : resp;
            if (this.layout.initRecord) { this.record = this.layout.initRecord([this.record])}
            (this.record as any).__primaryKey = this.record[this.layout.primaryKeyProperty];
            this.recordChange.emit(this.record);
          }, (e): void => {
            if(e.status === 403) { this.patchRestricted = true; }
            console.error(JSON.stringify(e));
          });
      }
    } else {
      if(!this.postRestricted){
        this.http.post(`${this.layout.entityUrl}/`, this.record)
          .subscribe((resp: T): void => {
            this.record = resp;
            if (this.layout.initRecord) { this.record = this.layout.initRecord([this.record])}
            (this.record as any).__primaryKey = this.record[this.layout.primaryKeyProperty];
            this.recordChange.emit(this.record);
          }, (e): void => {
            if(e.status === 403) { this.postRestricted = true; }
            console.error(JSON.stringify(e));
          });
      }
    }
  }

  public saveEnabled(): boolean {
    return (this.id !== undefined && !this.patchRestricted) || (this.id == undefined && !this.postRestricted)
  }

  public saveShortcut(event, saveButton: HTMLElement): void {
    event.preventDefault();
    event.stopPropagation();

    saveButton.focus();
    saveButton.click();
  }

  // noinspection JSMethodCanBeStatic
  public tab(event): void {
    let target = event.target;

    while (target !== null && !target.tagName.toUpperCase().endsWith('-VALUE')) {
      target = target.parentElement;
    }
    if (target === null) {
      console.error('Container of tab event not found');
      return;
    }
    let nextValue = target;
    do {
      nextValue = !!event.shiftKey ? nextValue.previousSibling : nextValue.nextSibling;
    } while (nextValue !== null &&
    (nextValue.tagName === undefined // It is the case for html comments
      || (!nextValue.tagName.toUpperCase().endsWith('-VALUE')
        || nextValue.getAttribute('edit') === null)));

    if (nextValue === null) {
      // console.info('No more field found');
      return;
    }

    Array.from<HTMLElement>(nextValue.children).filter((c): boolean => {
      const classes = c.getAttribute('class').split(' ');
      return classes.indexOf('edit') !== -1;
    })[0].click();
    event.stopPropagation();
    event.preventDefault();
  }
  public getWidth(): number {
    return (this.layout.columns.map((c): number =>
      parseInt(c.width.replace('px', '').trim(), 10))
      .reduce((a, b): number => a + b, 0)) + 22 /* 22 for context menu*/;
  }
}
