import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange } from '@angular/core';
import { RecordLayout } from '../../model/record-layout';
import { AccessFunctions } from '../access-functions';
import { RecordListLayout } from '../../model/record-list-layout';
import { Column } from '../../model/column';
//import AccessFunctions from '../access-functions';

@Component({
  selector: 'ift-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.css']
})
export class RecordComponent<T> implements OnInit, OnChanges {
  @Input() public id?: any;
  @Input() public layout?: RecordLayout<T> & RecordListLayout<T>;
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
  public get detailColumns(): Column<T>[] { return this.layout?.columns.filter((c) => c.detailDisplay !== 'none'); }
  public get listColumns(): Column<T>[] { return this.layout?.columns.filter((c) => c.listDisplay !== 'none' && c.width !== '0'); }

  public get getUrl(): string | undefined { return this.layout?.getUrl || this.url || this.layout?.entityUrl; }
  public get postUrl(): string | undefined { return this.layout?.postUrl || this.url || this.layout?.entityUrl; }
  // eslint-disable-next-line @typescript-eslint/no-parameter-properties
  public constructor(private http: HttpClient, private access: AccessFunctions) {
    this.inst = this;
  }

  public patchUrl(pk: string): string | undefined { return this._urlInsertPk(this.layout?.patchUrl || this.url || this.layout?.entityUrl, pk); }
  public deleteUrl(pk: string): string | undefined { return this._urlInsertPk(this.layout?.deleteUrl || this.url || this.layout?.entityUrl, pk); }

  public checkScopes(): void {
    if(this.layout?.postScope !== undefined && !this.access.hasAccess([this.layout?.postScope])) this.postRestricted = true;

    if(this.layout?.patchScope !== undefined && !this.access.hasAccess([this.layout?.patchScope])) this.patchRestricted=true;

    if(this.layout?.getScope !== undefined && !this.access.hasAccess([this.layout?.getScope])) this.getRestricted=true;
  }

  public cancelChanges(): void {
    if(!this.getRestricted){
      this.http.get(`${this.layout?.entityUrl}/${this.record[this.layout?.primaryKeyProperty]}`)
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
    const modifiedProps = this.layout?.columns
      .filter((c): boolean =>
        this.record[c.recordProperty + 'Modified'] === true
      );

    return modifiedProps.length > 0;
  }

  public isValid(): boolean {
    if (this.record === undefined) {
      return false;
    }
    return this.layout?.columns.filter((c): boolean => {
      return c.isValid !== undefined && !c.isValid(this.record);
    }).length === 0;
  }

  public ngOnInit(): void {

    if (this.layout?.labelsWidth !== undefined) {
      this.labelsWidth = this.layout?.labelsWidth;
    }
    if (this.layout?.valuesWidth !== undefined) {
      this.valuesWidth = this.layout?.valuesWidth;
    }
    if (!this.layout?.detailPosition || ['left', 'right'].includes(this.layout?.detailPosition)) {
      if (this.layout?.labelsWidth !== undefined && this.layout?.valuesWidth !== undefined) {
        const width =  parseInt(this.layout?.labelsWidth.replace('px', ''), 10) +
          parseInt(this.layout?.valuesWidth.replace('px', ''), 10);
        this.componentWidth = `${width + 19}px`;
        this.componentHeight = `${this.layout?.height + 4}px`;
      }  
    } else {
      this.componentWidth = `${this.getWidth() + 19}px`;
      //height is kept as default
    }
    if (this.layout?.title) {
      this.title = this.layout?.title;
    }

    this.checkScopes();

    if (this.layout?.loadOnInit === undefined || this.layout?.loadOnInit) {
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
            if (this.currentUrl !== this.getUrl) {
              // prevent execution if loadOnInit is false & the change hapens during init
              this.load();
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
    // console.debug(`detailPosition: ${this.layout?.detailPosition}`);
    if (this.layout?.detailPosition || this.layout?.detailPosition !== 'none') {
      // if detailPosition is set then gets the record from recordList parent, no own loading
      return;
    }

    if (this.getUrl !== undefined) {
      this.currentUrl = this.getUrl;
      if(!this.getRestricted){
        this.http.get<T[]>(`${this.getUrl}`)
          .subscribe( async (resp: T[]): Promise<void> => {
            this.record = resp[0] === undefined ? undefined : 
              this.layout?.load ? this.layout?.load(resp[0]) : resp[0];
            if (this.record) {
              if (this.layout?.initRecord) { this.record = await this.layout?.initRecord(this.record)}
              (this.record as any).__primaryKey = this.record[this.layout?.primaryKeyProperty];
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
      this.currentUrl = `${this.getUrl}/${this.id}`;
      if(!this.getRestricted){
        this.http.get<T[]>(this.currentUrl)
          .subscribe(async (resp: T[]): Promise<void> => {
            this.record = resp[0] === undefined ? undefined : 
              this.layout?.load ? this.layout?.load(resp[0]) : resp[0];
            if (this.record) {
              if (this.layout?.initRecord) { this.record = await this.layout?.initRecord(this.record)}
              (this.record as any).__primaryKey = this.record[this.layout?.primaryKeyProperty];
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
    if (this.layout?.save !== undefined) {
      const res = await this.layout?.save(this.record);
      this.record = this.layout?.load ? this.layout?.load(res) : res;
      return;
    }

    if (this.record['__primaryKey']) {
      if(!this.patchRestricted){
        const pk = this.record['__primaryKey'];
        this.record['__primaryKey'] = undefined;
        this.http.patch(this.patchUrl(pk), this.record)
          .subscribe(async (resp: T | T[]): Promise<void> => {
            this._updateObj(this.record, Array.isArray(resp) ? resp[0] : resp);
            if (this.layout?.initRecord) { this.record = await this.layout?.initRecord(this.record)}
            (this.record as any).__primaryKey = this.record[this.layout?.primaryKeyProperty];
            this.recordChange.emit(this.record);
          }, (e): void => {
            if(e.status === 403) { this.patchRestricted = true; }
            console.error(JSON.stringify(e));
          });
      }
    } else {
      if(!this.postRestricted){
        this.http.post(this.postUrl, this.record)
          .subscribe( async (resp: T): Promise<void> => {
            this._updateObj(this.record, resp);
            if (this.layout?.initRecord) { this.record = await this.layout?.initRecord(this.record)}
            (this.record as any).__primaryKey = this.record[this.layout?.primaryKeyProperty];
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
      // console.error('Container of tab event not found');
      return;
    }
    let nextValue = target;
    do {
      nextValue = !!event.shiftKey ? nextValue.previousElementSibling : nextValue.nextElementSibling;
      // console.debug(nextValue)
    } while (nextValue !== null &&
    (nextValue.tagName === undefined // It is the case for html comments
      || (!nextValue.tagName.toUpperCase().endsWith('-VALUE')
        || nextValue.getAttribute('edit') === null)));

    if (nextValue === null) {
      // console.debug('No more field found');
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
    return (this.listColumns.map((c): number =>
      parseInt(c.width?.replace('px', '').trim() || '0', 10))
      .reduce((a, b): number => a + b, 0)) + 22 /* 22 for context menu*/;
  }

  private _urlInsertPk = (url: string, pk: string): string => {
    const urlParts = url.split('?');
    return `${urlParts[0]}/${pk}?${urlParts[1] || ''}`;
  }

  private _updateObj(from: T, to: T): void {
    for (const prop in from) { if (from.hasOwnProperty(prop)) { delete from[prop]; } }
    Object.assign(from, to);
  }
}
