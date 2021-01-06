import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { OAuthService } from "angular-oauth2-oidc";
import { AuthenticationBase } from "../authentication-base";
import { AddHeadersInterceptor } from "../add-headers";
import { Config } from "../config";
import moment from 'moment';

@Component({
  selector: 'all41-tabulator',
  templateUrl: './tabulator.component.html',
  styleUrls: ['./tabulator.component.css']
})
export class TabulatorComponent<T> extends AuthenticationBase {
  @Input() public typeHelpers: { pkProp: string; factory: { new(partial?: Partial<T>)}};
  @Output() public tabulatorChange: EventEmitter<Tabulator> = new EventEmitter<Tabulator>();
  public tabulator?: Tabulator;

  private _tabulatorOptions?: Tabulator.Options;
  @Input() public get tabulatorOptions(): Tabulator.Options | undefined {
    return this._tabulatorOptions;
  }
  public set tabulatorOptions(options: Tabulator.Options | undefined) {
    this._tabulatorOptions = options;

    if (options.ajaxConfig !== 'GET' && options.ajaxConfig !== 'POST') {
      if (!options.ajaxConfig) options.ajaxConfig = {};
      if (!options.ajaxConfig.headers) options.ajaxConfig.headers = {};
      options.ajaxConfig.headers.Authorization = `Bearer ${AddHeadersInterceptor.idToken}`;
    }

    this.tabulator = new Tabulator('#tabulator', options);
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

    const rowsToSave = tabulator.getRows().filter((r) => r.getCells().some((c) => c.isEdited()));
    rowsToSave.forEach((r) => {
      const value = r.getData() as T;
      if (value[this.typeHelpers.pkProp]) {
        // update
        this.http.patch<T>(`${this.tabulatorOptions.ajaxURL}/${value[this.typeHelpers.pkProp]}`, value).toPromise()
          .then((savedVal) => {
            r.getCells().forEach((c) => { if (c.isEdited()) tabulator.clearCellEdited(c) })
            tabulator.updateRow(r, new this.typeHelpers.factory(savedVal));

            this._rowFormatter(r);
          });
      } else {
        // create
        this.http.post<T>(this.tabulatorOptions.ajaxURL, value).toPromise()
          .then((savedVal) => {
            r.getCells().forEach((c) => { if (c.isEdited()) tabulator.clearCellEdited(c) })
            tabulator.updateRow(r, new this.typeHelpers.factory(savedVal));
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
  public add = () => this.tabulator.addRow();
  public delete = (): void => {
    if (!this.tabulator) return;
    const rows = this.tabulator.getSelectedRows();
    rows.forEach((r) => {
      const value = r.getData() as T;
      this.http.delete(`${this.tabulatorOptions.ajaxURL}/${value[this.typeHelpers.pkProp]}`).toPromise()
        .then(() => r.delete());
    });
  }
  protected async afterAuthInit(): Promise<void> {
    await super.afterAuthInit();
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
