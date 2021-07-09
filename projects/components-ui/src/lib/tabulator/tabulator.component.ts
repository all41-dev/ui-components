import { HttpClient } from "@angular/common/http";
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { OAuthService } from "angular-oauth2-oidc";
import { AuthenticationBase } from "../authentication-base";
import { AddHeadersInterceptor } from "../add-headers";
import { Config } from "../config";
import moment from 'moment';

// if broken, add export default Tabulator at the top of @types/tabulator-tables/index.d.ts
import Tabulator from "tabulator-tables";

@Component({
  selector: 'all41-tabulator',
  templateUrl: './tabulator.component.html',
  styleUrls: ['./tabulator.component.css']
})
export class TabulatorComponent<T> extends AuthenticationBase {
  @Input() public extendedOptions?: TabulatorExtendedOptions<T>;
  @Input() public tabulator?: Tabulator;
  @Output() public tabulatorChange: EventEmitter<Tabulator> = new EventEmitter<Tabulator>();

  private _tabulatorElement?: ElementRef;
  @ViewChild('tabulatorelem') public get tabulatorElement(): ElementRef | undefined { return this._tabulatorElement; }
  public set tabulatorElement(value: ElementRef | undefined) {
    this._tabulatorElement = value;
    this._initTabulator();
  }

  private _tabulatorOptions?: Tabulator.Options;
  @Input() public get tabulatorOptions(): Tabulator.Options | undefined {
    return this._tabulatorOptions;
  }
  public set tabulatorOptions(options: Tabulator.Options | undefined) {
    this._tabulatorOptions = options;
    this._initTabulator();
  }

  public constructor(private http: HttpClient, protected oauthService: OAuthService, protected config: Config) {
    super(oauthService, config);
  }
  public get nbRowsToSave(): number {
    if (!this.tabulator) return 0;
    const rowsToSave = this.tabulator.getRows().filter((r) => r.getCells().some((c) => c.isEdited()));
    return rowsToSave.length;
  }
  public save = (): void => {
    const tabulator = this.tabulator;
    if (!tabulator) return;

    const baseUrl = this.extendedOptions.cudAjaxUrl || this.tabulatorOptions.ajaxURL;
    const rowsToSave = tabulator.getRows().filter((r) => r.getCells().some((c) => c.isEdited()));

    rowsToSave.forEach((r) => {
      const value = r.getData() as T;
      if (value[this.extendedOptions.pkProp]) {
        // update
        this.http.patch<T>(`${baseUrl}/${value[this.extendedOptions.pkProp]}`, value).toPromise()
          .then((savedVal) => {
            r.getCells().forEach((c) => { if (c.isEdited()) tabulator.clearCellEdited(c) })
            tabulator.updateRow(r, new this.extendedOptions.factory(savedVal));

            this._rowFormatter(r);
          });
      } else {
        // create
        this.http.post<T>(baseUrl, value).toPromise()
          .then((savedVal) => {
            r.getCells().forEach((c) => { if (c.isEdited()) tabulator.clearCellEdited(c) })
            tabulator.updateRow(r, new this.extendedOptions.factory(savedVal));
            this._rowFormatter(r);
          });
      }

    });
  }
  public rollback = (): void => {
    if (!this.tabulator) return;

    for (const c of this.tabulator.getEditedCells()) {
      c.setValue(c.getInitialValue());
      this.tabulator.clearCellEdited(c)
      this._rowFormatter(c.getRow());
    }
    return;
    // const rowsToRollback = tabulator.getRows().filter((r) => r.getCells().some((c) => c.isEdited()));
    // rowsToRollback.forEach((r) => {
    //   r.getCells().forEach((c) => { if (c.isEdited()) c.cancelEdit();tabulator.clearCellEdited(c) });
    //   this._rowFormatter(r);
    // });
  }
  public add = async (value?: Partial<T>): Promise<Tabulator.RowComponent> => this.tabulator.addRow(JSON.parse(JSON.stringify(value)));
  public delete = (): void => {
    if (!this.tabulator) return;
    const baseUrl = this.extendedOptions.cudAjaxUrl || this.tabulatorOptions.ajaxURL;
    const rows = this.tabulator.getSelectedRows();
    rows.forEach((r) => {
      const value = r.getData() as T;
      this.http.delete(`${baseUrl}/${value[this.extendedOptions.pkProp]}`).toPromise()
        .then(() => r.delete());
    });
  }
  protected async afterAuthInit(): Promise<void> {
    await super.afterAuthInit();
  }
  private _initTabulator = () => {
    if (!this.tabulatorOptions || !this.tabulatorElement) return;
    const options = this.tabulatorOptions;

    if (options && options.ajaxURL) {
      if (options.ajaxConfig !== 'GET' && options.ajaxConfig !== 'POST') {
        if (!options.ajaxConfig) options.ajaxConfig = {};
        if (!options.ajaxConfig.headers) options.ajaxConfig.headers = {};
        options.ajaxConfig.headers.Authorization = `Bearer ${AddHeadersInterceptor.idToken}`;
      }

      if (!options.ajaxResponse) {
        options.ajaxResponse = (_url, _params, recs: T[]) => {
          // received recs are unserialized Actitity objects, needs to be instanciated
          return recs.map((r) => new this.extendedOptions.factory(r));
        }
      }
    }

    options?.columns?.forEach((c) => {
      if (c.mutatorEdit) console.warn('mutatorEdit value has been replaced by default TabulatorComponent one.');
      c.mutatorEdit = this._cellMutator;
    })

    this.tabulator = options ? new Tabulator(this.tabulatorElement.nativeElement, options) : undefined;
    this.tabulatorChange.emit(this.tabulator);

  }
  private _dateEditor = (cell: any, onRendered: any, success: any, cancel: any) => {
    //cell - the cell component for the editable cell
    //onRendered - function to call when the editor has been rendered
    //success - function to call to pass the successfuly updated value to Tabulator
    //cancel - function to call to abort the edit and return to a normal cell

    //create and style input
    moment.locale('fr-CH');

    const cellValue = moment(cell.getValue(), "YYYY-MM-DD").format("YYYY-MM-DD"),
      input = document.createElement("input");

    input.setAttribute("type", "date");

    input.style.padding = "4px";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";

    input.value = cellValue;

    onRendered(function () {
      input.focus();
      input.style.height = "100%";
    });

    function onChange() {
      if (input.value != cellValue) {
        if (!input.value) success(input.value);
        const res = moment(input.value, "YYYY-MM-DD");
        if (!res.isValid) {
          alert('date is invalid');
          cancel();
        } else {
          success(res.format("YYYY-MM-DD"));
        }
      } else {
        cancel();
      }
    }

    //submit new value on blur or change
    input.addEventListener("blur", onChange);

    //submit new value on enter
    input.addEventListener("keydown", function (e) {
      if (e.keyCode == 13) {
        onChange();
      }

      if (e.keyCode == 27) {
        cancel();
      }
    });

    return input;
  };
  private _humanDate = (cell: any) => {
    const val = cell.getValue();
    if (!val) return '-';
    moment.locale('fr');
    return moment.duration(moment(val).diff(moment())).humanize(true);
  }
  private _rowFormatter = (row: Tabulator.RowComponent) => {
    const cells = row.getCells();
    if (cells.some((c) => c.isEdited())) row.getElement().style.backgroundColor = '#deba9b'
    else {
      row.getElement().style.backgroundColor = '#b9eab8';
      setTimeout(() => {
        row.getElement().style.backgroundColor = '';
      }, 1000);
    }
  };
  private _cellMutator = (val: any, _d: any, _t: any, _p: any, cell?: Tabulator.CellComponent) => { if (cell) this._rowFormatter(cell.getRow()); return val; }

  // private _cellMutator = (val: any, _d: any, _t: any, _p: any, cell?: Tabulator.CellComponent) => { if (cell) this._rowFormatter(cell.getRow()); return val; }
  // private _getFooter = (tabulator: Tabulator): HTMLElement => {
  //   const $this = this;
  //   const saveBtn = document.createElement('button')
  //   saveBtn.setAttribute('role', 'button');
  //   // saveBtn.onclick = 
  //   const elem = document.createElement('div');
  //   elem.appendChild(saveBtn);
  //   return elem;
  // }
}
export interface TabulatorExtendedOptions<T> {
  pkProp: string;
  isDeleteEnabled?: boolean;
  isAddEnabled?: boolean;
  /**
   * @description to be used when tabulator data is not retrieved using AJAX, but create|update|delete (cud) are.
   * or if url is different
   */
  cudAjaxUrl?: string;
  newRecordTemplate?: Partial<T>;// | (() => Promise<Partial<T>>); not required so far
  factory: {
    new(partial?: Partial<T>)
  };
}
