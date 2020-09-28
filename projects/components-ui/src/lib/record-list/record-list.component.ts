import {Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChange, ViewChild} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import scrollIntoView from 'scroll-into-view-if-needed';
import {RecordListLayout} from '../../model/record-list-layout';
import { Option, EditableColumn, Column } from '../../model/column';
import {AccessFunctions} from '../access-functions';
import { OptionsEditableColumn } from '../../model/column';
import { AuthenticationBase } from '../authentication-base';
import { OAuthService } from 'angular-oauth2-oidc';
import { Config } from '../config';
import { RecordLayout } from '../../model/record-layout';

@Component({
  selector: 'ift-record-list',
  templateUrl: './record-list.component.html',
  styleUrls: ['./record-list.component.css']
})
export class RecordListComponent<T> extends AuthenticationBase implements OnChanges {
  @Input() public layout?: RecordListLayout<T> & Partial<RecordLayout<T>>;
  @Input() public selectedRecords: T[] = [];
  @Input() public url: string;
  @Input() public set authCompleted(value: boolean) {
    if(value) {
      if (!this.isAuthCompleted && this._loadOnAuthCompleted && value) {
        console.info('load from authCompleted');
        this.load();
        this._loadOnAuthCompleted = false;
      }
      this.setAuthCompleted();
    }
  };
  @Output() public selectedRecordsChange: EventEmitter<T[]> = new EventEmitter<T[]>();
  @Input() public records: T[] = [];
  @Output() public recordsChange: EventEmitter<T[]> = new EventEmitter<T[]>();
  @Input() public filterRecords: T[] = [];
  @Output() public filterRecordsChange: EventEmitter<T[]> = new EventEmitter<T[]>();

  public get filteredRecords(): T[] {
    if (!this.records) { return []; }
    const activeFilters = this.layout?.columns.filter((c): boolean => c.filterValue && c.filterValue !== '');
    const cachedOptions: any = {};
    const res = this.records.filter((r): boolean => {
      for (const f of activeFilters) {
        // To be reactivated when implementing complex filters (number range, dates, list of values, etc..)
        // if (typeof f.filterValue === 'string' && f.filterValue !== '') {

        if (['typeahead', 'dropdown'].includes((f as EditableColumn<T>).editType)) {
          let options: Option[] = cachedOptions[f.recordProperty];

          if (!options) {
            const optionsVal = (f as OptionsEditableColumn<T>).options;
            options = typeof optionsVal === 'function' ? optionsVal() : optionsVal;
            cachedOptions[f.recordProperty] = options;  
          }
          let label: string = (r as any)[`__${f.recordProperty}Label`];

          if(!label){
            const option = options.find((o) => o.value === r[f.recordProperty]);
            if (!option) return false;
            label = (r as any)[`__${f.recordProperty}Label`] = option.label;
          }

          if (label.includes(f.filterValue)) continue; // straight test (optimization)

          const filter = f.filterValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
          if (!label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(filter)) return false;
        } else {
          const baseValue: string = r[f.recordProperty] ?
            typeof r[f.recordProperty] === 'string' ?
              r[f.recordProperty] as any :
              `${r[f.recordProperty]}` : '';
          if (baseValue.includes(f.filterValue)) continue; // straight test (optimization)

          const val = baseValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
          const filter = f.filterValue.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
          // if (val === undefined) return false;// should not happen
          if (!val.includes(filter)) return false;
        }
        // } else {
        //   // only string filters are implemented yet.
        // } 
      }
      // all filters passed
      return true;
    });
    if (!this.filterRecords || this.filterRecords.length !== res.length) {
      this.filterRecords = res;
      setTimeout((): void => this.filterRecordsChange.emit(this.filterRecords), 20);
    }
    return res;
  }

  @ViewChild('grid', {static: false}) public grid: ElementRef;
  public inst: RecordListComponent<T>;

  public cursorStyle = 'inherit';
  public loadOnInit = true;

  public get currentRecords(): T[] {
    if (!this.records) { return []; }
    if (this.filteredRecords.length < this.chunkSize * (this.currentChunk + 1) + 1) {
      this.currentChunk = Math.floor(this.filteredRecords.length / this.chunkSize);
    }
    const recs = this.filteredRecords.slice(this.chunkSize * this.currentChunk, this.chunkSize * (this.currentChunk + 1));
    // new records (unsaved)
    const nr = this.records.filter((r): boolean => !r[this.layout?.primaryKeyProperty] && recs.indexOf(r) === -1);
    return recs.concat(nr);
  }
  public get lastCurrentRecord(): number {
    return Math.min(this.chunkSize * (this.currentChunk + 1), this.filteredRecords.length);
  }

  public currentChunk: number;
  public chunkSize: number;
  public get totalChunks(): number {
    return Math.ceil(this.filteredRecords.length / this.chunkSize);
  }

  public getRestricted = false;
  public patchRestricted = false;
  public deleteRestricted = false;
  public postRestricted = false;
  public get listColumns(): Column<T>[] { return this.layout?.columns.filter((c) => c.listDisplay !== 'none' && c.width !== '0') || []; }

  public get getUrl(): string | undefined { return this.layout?.getUrl || this.url || this.layout?.entityUrl; }
  public get postUrl(): string | undefined { return this.layout?.postUrl || this.url || this.layout?.entityUrl; }

  private _loadOnAuthCompleted = false;

  public constructor(private http: HttpClient, protected access: AccessFunctions, protected oauthService: OAuthService, protected config: Config ) {
    super(oauthService, config);
    this.inst = this;
    this.selectedRecordsChange.emit(this.selectedRecords);
    this.recordsChange.emit(this.records);
  }

  public patchUrl(pk: string): string | undefined { return this._urlInsertPk(this.layout?.patchUrl || this.url || this.layout?.entityUrl, pk); }
  public deleteUrl(pk: string): string | undefined { return this._urlInsertPk(this.layout?.deleteUrl || this.url || this.layout?.entityUrl, pk); }

  // eslint-disable-next-line @typescript-eslint/no-parameter-properties
  public gridTemplateColumns(): string {
    return this.layout?.columns.filter((c) => c.listDisplay !== 'none').map((c): string => c.width).reduce((a, b): string => a + ' ' + b) + ' 24px'; // last col for context menu
  }

  public getWidth(): number {
    return (this.listColumns.map((c): number =>
      parseInt(c.width.replace('px', '').trim(), 10))
      .reduce((a, b): number => a + b, 0)) + 22 /* 22 for context menu*/;
  }

  public get outerWidth(): string {
    let res = this.getWidth();
    if (['left', 'right'].includes(this.layout?.detailPosition || '')) {
      const detailWidth =  parseInt(this.layout?.labelsWidth.replace('px', ''), 10) +
        parseInt(this.layout?.valuesWidth.replace('px', ''), 10);
  
      res += detailWidth + 42;
    } 
    return `${res}px`;
  }

  public checkScopes(): void {
    if (this.layout?.postScope !== undefined && !this.access.hasAccess([this.layout?.entityScope, this.layout?.postScope])) {
      this.postRestricted = true;
      this.layout.isAddEnabled = false;
    }

    if (this.layout?.patchScope !== undefined && !this.access.hasAccess([this.layout?.entityScope, this.layout?.patchScope])) {
      this.patchRestricted = true;
    }

    if (this.layout?.getScope !== undefined && !this.access.hasAccess([this.layout?.entityScope, this.layout?.getScope])) {
      this.getRestricted = true;
    }

    if (this.layout?.deleteScope !== undefined && !this.access.hasAccess([this.layout?.entityScope, this.layout?.deleteScope])) {
      this.deleteRestricted = true;
      this.layout.isDeleteEnabled = false;
    }
  }

  // todo: introduce filters
  public async afterAuthInit(): Promise<void> {
    super.afterAuthInit();
    // this.layout = new Proxy(this.layout, {set: this.layoutUpdated})
    // this.layout?.reload = this.load;
    // this.layoutChange.emit(this.layout);
    this.records = [];
    if (this.layout && this.layout?.selectionType === undefined) { this.layout.selectionType = 'single'; }
    if (this.layout && this.layout?.isDeleteEnabled === undefined) { this.layout.isDeleteEnabled = false; }
    if (this.layout && this.layout?.isAddEnabled === undefined) { this.layout.isAddEnabled = false; }
    if (this.layout && this.layout?.newRecTemplate === undefined) { this.layout.newRecTemplate = {}; }
    // if (this.layout?.title !== undefined) {this.title = this.layout?.title; }
    if (this.layout?.loadOnInit !== undefined) {this.loadOnInit = this.layout?.loadOnInit; }

    this.checkScopes();

    this.chunkSize = this.layout?.chunkSize || 100;
    this.currentChunk = 0;

    if (this.loadOnInit) {
      // undefined means that authentication is disabled
      // if ([undefined, true].includes(this._authCompleted)) {
      if (this.isAuthCompleted) {
        // console.info('load from afterAuthInit');
        this.load();
      } else {
        this._loadOnAuthCompleted = true;
      }
    }
    if (this.layout?.click !== undefined) {
      this.cursorStyle = 'pointer';
    }
  }
  public ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
    for (const propName in changes) {
      if (!changes.hasOwnProperty(propName)) { continue; }
      const changedProp = changes[propName];
      switch (propName) {
        case 'url' :
          if (changedProp.currentValue !== undefined) {
            this.load();
          } else {
            this.records.splice(0, this.records.length);
            this.recordsChange.emit(this.records);
          }
          break;
        case 'records' :
          if (this.records) {
            this.records.forEach((rec): T[keyof T] => (rec as any).__primaryKey = rec[this.layout?.primaryKeyProperty]);
          }
          break;
      }
    }
  }

  public load(): void {
    // console.info('loading ' + this.url);
    if (this.getUrl && !this.getRestricted) {
      this.http.get<T[]>(this.getUrl).subscribe(
        async (resp: T[]): Promise<void> => {
          resp.map(async (rec: T): Promise<void> => {
            let res = rec;
            if (this.layout?.initRecord) { res = await this.layout?.initRecord(rec)}
            (res as any).__primaryKey = res[this.layout?.primaryKeyProperty];
          });

          this.records = this.layout?.load ? this.layout?.load(resp) : resp;
          this.recordsChange.emit(this.records);

          this.filterRecords = this.filteredRecords || [];
          this.filterRecordsChange.emit(this.filterRecords);
        },
        (e: HttpErrorResponse): void => {
          if (e.status === 403) {
            this.getRestricted = true;
          }
          console.error(JSON.stringify(e));
        });
    }
  }

  // layoutUpdated(target: any, p: PropertyKey, value: any, receiver: any): boolean {
  //   console.info('entityUrl updated (inside record-list)');
  //   switch (p) {
  //     case 'entityUrl' :
  //       this.load();
  //       break;
  //   }
  //   return true;
  // }

  public isModified(record: T): boolean {
    if (record === undefined) {
      return false;
    }
    return this.layout?.columns
      .map((c): any => record[c.recordProperty + 'Modified'])
      .some((m): boolean => m === true);
  }

  public modifiedRecords(): T[] {
    if (!this.records) return [];
    return this.records.filter((r): boolean =>
      this.layout?.columns.map((c): any => r[c.recordProperty + 'Modified']).some((c): boolean => c));
  }

  public getDataHeight(headerRow: HTMLElement, controlsRow: HTMLElement): number {
    const hh =  headerRow === undefined ? 0 : headerRow.clientHeight;
    const ch = controlsRow === undefined ? 0 : controlsRow.clientHeight;
    return this.layout?.height - hh - ch;
  }

  // noinspection JSMethodCanBeStatic
  public saveShortcut(event, saveButton: HTMLElement): void {
    event.preventDefault();
    event.stopPropagation();

    saveButton.focus();
    saveButton.click();
  }
  public save(/*event = null*/): void {
    if (this.layout?.save) {
      return this.layout?.save(this.modifiedRecords());
    }

    this.modifiedRecords().forEach((r): void => {
      if (!r['__primaryKey']) {
        if(!this.postRestricted){
          this.http.post(this.postUrl, r)
            .subscribe(async (newRecord: T): Promise<void> => {
              if (this.layout?.initRecord) { newRecord = await this.layout?.initRecord(newRecord)}
              (newRecord as any).__primaryKey = [this.layout?.primaryKeyProperty];
              this._updateObj(this.records[this.records.indexOf(r)], newRecord);
            }, (e): void => {
              if(e.status === 403) { this.postRestricted = true; }
              console.error(JSON.stringify(e));
            } );
        }
      } else {
        if(!this.patchRestricted){
          const pk = r['__primaryKey'];
          r['__primaryKey'] = undefined;
          
          this.http.patch(this.patchUrl(pk), r)
            .subscribe(this.replaceRecords.bind(this),
              (e): void => {
                if(e.status === 403) { this.patchRestricted = true; }
                console.error(JSON.stringify(e));
              });
        }
      }
    });
  }

  public cancelShortcut(event, cancelButton: HTMLElement): void {
    event.preventDefault();
    event.stopPropagation();

    cancelButton.focus();
    cancelButton.click();
  }

  public newShortcut(event, newButton: HTMLElement): void {
    event.preventDefault();
    event.stopPropagation();

    newButton.focus();
    newButton.click();
  }

  public cancelChanges(event = null): void {
    if (event !== null) {
      event.preventDefault();
      event.stopPropagation();
    }

    const mr = this.modifiedRecords();
    // confirm that new records will be removed
    if (mr.filter((r): boolean => r[this.layout?.primaryKeyProperty] === undefined).length > 0 && !confirm('new unsaved record(s) will be removed, do you want to continue?')) {
      return;
    }

    mr.forEach((r: T): void => {
      if (r[this.layout?.primaryKeyProperty] === undefined) {
        // new record
        this.records.splice(this.records.indexOf(r), 1);
      } else {
        if(!this.getRestricted){
          this.http.get(`${this.layout?.entityUrl}/${r[this.layout?.primaryKeyProperty]}`)
          // .subscribe((r2: T[]) => this.replaceRecords(r2));
            .subscribe(this.replaceRecords.bind(this),
              (e): void => {
                console.error(JSON.stringify(e));
              });
        }
        // strangely '.subscribe(this.replaceRecords)' doesn't work. this.records becomes undefined in the function
      }
    });
  }

  public replaceRecords(newRecords: T | T[]): void {
    const recs = this.records;
    const nRecs = Array.isArray(newRecords) ? newRecords : [newRecords];
    nRecs.forEach(async (r: T): Promise<void> => {
      if (this.layout?.initRecord) { r = await this.layout?.initRecord(r)}
      (r as any).__primaryKey = r[this.layout?.primaryKeyProperty];
      const index = this.records.map((r2): any => r2[this.layout?.primaryKeyProperty]).indexOf(r[this.layout?.primaryKeyProperty]);
      this._updateObj(recs[index], r);
    });
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
      const nv = !!event.shiftKey ? nextValue.previousSibling : nextValue.nextSibling;

      if (nv !== null) {
        nextValue = nv;
      } else {
        // end of row reached
        const nextRow = !!event.shiftKey ? nextValue.parentElement.previousSibling : nextValue.parentElement.nextSibling;
        // console.debug('next row');
        // console.debug(nextRow);
        if (nextRow === null || !nextRow.tagName) {
          // no more row found
          this.new();
          event.stopPropagation();
          event.preventDefault();
          return;
        } else {
          nextValue = !!event.shiftKey ? nextRow.lastChild : nextRow.firstChild;
        }
      }
    } while (nextValue && (nextValue.tagName === undefined || !nextValue.tagName.toUpperCase().endsWith('-VALUE')
    || nextValue.getAttribute('edit') === null));

    if ( !nextValue ) { return; }
    const elemToClick = Array.from<HTMLElement>(nextValue.children).filter((c): boolean => {
      const classAttr = c.getAttribute('class');
      const classes =  [null, ''].indexOf(classAttr)  === -1 ? classAttr.split(' ') : [];
      return classes.indexOf('edit') !== -1;
    })[0];

    scrollIntoView(elemToClick, {
      scrollMode: 'if-needed',
      block: 'nearest',
      inline: 'nearest',
    });

    elemToClick.click();
    event.stopPropagation();
    event.preventDefault();
  }

  public new(): void {
    if (!this.records) { this.records = []; }
    const templateCopy = JSON.parse(JSON.stringify(this.layout?.newRecTemplate));
    this.records.push(templateCopy as T);
    setTimeout((): void => {
      const elem: HTMLElement = this.grid.nativeElement;

      const rows: Element[] = Array.from(elem.children).filter((c: Element): boolean => {
        const classes = c.getAttribute('class').split(' ');
        return classes.indexOf('row') !== -1;
      });

      const firstEditField: Element = Array.from(rows[rows.length - 1].children).filter((c): boolean => {
        return c.getAttribute('edit') !== null;
      })[0];
      // console.info(`firstEditField: ${firstEditField}`);
      this.toggleSelection(templateCopy);
      if ( firstEditField === undefined ) { return; }
      const labelElement: HTMLElement = Array.from(firstEditField.children).filter((c): boolean => {
        const classStr = c.getAttribute('class');
        if (classStr === null) { return false; }
        const classes = classStr.split(' ');
        return classes.indexOf('edit') !== -1;
      })[0] as HTMLElement;

      labelElement.click();
      scrollIntoView(labelElement, {
        scrollMode: 'if-needed',
        block: 'nearest',
        inline: 'nearest',
      });

    }, 0);
  }

  public deleteRecord(r: T): void {
    if(!this.deleteRestricted){
      this.http.delete(this.deleteUrl(r[this.layout?.primaryKeyProperty].toString()))
        .subscribe((): void => {
          this.records.splice(this.records.indexOf(r), 1);
          if (this.selectedRecords.includes(r)) {
            this.selectedRecords.splice(this.selectedRecords.indexOf(r), 1);
          }
        },
        (e): void => {
          if(e.status == 403) { this.deleteRestricted = true; }
          console.error(JSON.stringify(e));
        });
    }
  }

  public toggleSelection(r: T): void {
    const idx = this.selectedRecords.indexOf(r);

    switch (this.layout?.selectionType) {
      case 'none':
        return;
      case 'multiple':
        if (idx === -1) {
          this.selectedRecords.push(r);
        } else {
          this.selectedRecords.splice(idx, 1);
        }
        break;
      case 'single':
      default:
        this.selectedRecords.splice(0, this.selectedRecords.length);
        if (idx === -1) {
          this.selectedRecords.push(r);
        }
        break;
    }
    // force update
    const tmp = this.selectedRecords;
    this.selectedRecords = [];
    this.selectedRecords = tmp;

    this.selectedRecordsChange.emit(this.selectedRecords);
  }
  public click(r: T): void {
    // console.info('click');
    if (this.layout?.click) {
      this.layout?.click(r);
      return;
    }
    if((typeof this.layout?.selectionTrigger === 'string' && ['dblclick', 'contextmenu'].includes(this.layout?.selectionTrigger))) return;

    if(!this.layout?.selectionTrigger || this.layout?.selectionTrigger.includes('click')) {
      this.toggleSelection(r);
    }
  }
  public dblclick(r: T): void {
    // console.info('dblclick');
    if (this.layout?.dblClick) {
      this.layout?.dblClick(r);
      return;
    }
    if(!this.layout?.selectionTrigger || (typeof this.layout?.selectionTrigger === 'string' && ['click', 'contextmenu'].includes(this.layout?.selectionTrigger))) return;

    if(this.layout?.selectionTrigger.includes('dblclick')) {
      this.toggleSelection(r);
    }
  }
  public toggleContextMenu(event): void {
    const target = event.target;
    const contextMenuElem = target.nextSibling;
    if (contextMenuElem.style.display === 'none') {
      contextMenuElem.style.display = 'block';
      contextMenuElem.focus();
    } else {
      contextMenuElem.style.display = 'none';
    }
    event.stopPropagation();
  }
  public hideContextMenu(event): void {
    setTimeout((): void => {
      event.target.style.display = 'none';
    }, 300);
  }
  public isReadOnly(): boolean {
    return !(this.layout?.isAddEnabled ||
      this.layout?.isDeleteEnabled ||
      this.layout?.columns.some((c): boolean => ['create', 'update'].includes(c.listDisplay)));
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
