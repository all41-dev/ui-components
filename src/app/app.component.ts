import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Column, RecordListLayout, RecordListComponent, RecordComponent, ReadonlyColumn, EditableColumn} from '@all41-dev/ui-components';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public title = 'base-ui';
  public records = [];
  public sr = [];
  public fRecs;

  // public sampleEntityUrl = 'http://localhost:3010/api/samples';
  // public sampleEntityUrl = 'https://jsonplaceholder.typicode.com/posts';
  public sampleEntityUrl = 'https://api.airvisual.com/v2/countries?key=b0b877d8-1c61-41fc-a228-933e729bd97e';// key expires on Apr 15 2021

  public recordLayout = new RecordListLayout<any>({
    type: Object,
    columns: [new ReadonlyColumn({
      listDisplay: 'read',
      detailDisplay: 'read',
      label: 'col without data',
      recordProperty: undefined,
      width: '200px',
      html: (parent, record): string => `<span>I am the <a href='/foo/${record.country}'>${record.country}</a>!`,
      onClick: (parentComponent: RecordListComponent<any>, record): void => {
        alert(record.title);
        // to be implemented
      }
      // }, {
      //   label: 'Id',
      //   editType: EditType.Number,
      //   recordProperty: 'id',
      //   isEditable: false,
      //   width: '30px',
      // }, {
      //   label: 'User',
      //   editType: EditType.Typeahead,
      //   recordProperty: 'userId',
      //   isEditable: true,
      //   width: '300px',
      //   options: [
      //     { label: 'foo', value: 'foo'},
      //     { label: 'bar', value: 'bar'},
      //     { label: 'baz', value: 'baz'},
      //   ],
      //   //filterValue: 'is',
      //   //isFilterVisible: true,
    }), new ReadonlyColumn({
      label: 'country',
      // editType: EditType.Text,
      recordProperty: 'country',
      listDisplay: 'read',
      detailDisplay: 'read',
      isFilterVisible: true,
      // filterValue: 'ess',
      width: '300px'
      // }, {
      //   label: 'Body',
      //   editType: EditType.Textarea, // multiline
      //   recordProperty: 'body',
      //   isEditable: true,
      //   width: '500px'
      // }, {
      //   label: 'L4',
      //   editType: EditType.Date, // date
      //   recordProperty: 'recordDate',
      //   isEditable: true,
      //   isModifiedProperty: 'recordDateModified',
      //   width: '60px'
      // }, {
      //   label: 'L5',
      //   editType: EditType.Text, // dropdown
      //   recordProperty: 'hardOption',
      //   isEditable: true,
      //   isModifiedProperty: 'hardOptionModified',
      //   width: '100px',
      //   isValid: (record: any): boolean => {
      //     return record.hardOption !== null && record.hardOption.length >= 6;
      //   }
      // }, {
      //   label: 'L6 monster very fucking long label plus',
      //   editType: EditType.Dropdown,
      //   recordProperty: 'quantity',
      //   isEditable: true,
      //   isModifiedProperty: 'quantityModified',
      //   width: '70px',
      //   options: [
      //     {value: 1, label: 'First'},
      //     {value: 2, label: 'Second'},
      //     {value: 3, label: 'Third'},
      //   ]
    }), new EditableColumn({
      //   label: 'id',
      //   recordProperty: 'id',
      //   isEditable: false,
      //   editType: EditType.Text,
      //  }, {
      label: 'status',
      recordProperty: 'status',
      listDisplay: 'update',
      detailDisplay: 'update',
      editType: 'dropdown',
      width: '100px',
      options: (): any => [
        { label: 'nouveau', value: 'new' },
        { label: 'en cours', value: 'open' },
        { label: 'en attente', value: 'on-hold' },
        { label: 'annulé', value: 'cancelled' },
        { label: 'terminé', value: 'finished' },
      ],
      isFilterVisible: true,
    })],
    entityUrl: this.sampleEntityUrl,
    labelsWidth: '80px',
    valuesWidth: '250px',
    title: 'record title',
    primaryKeyProperty: 'id',
    save: async (records): Promise<Subscription[]> => {
      const saveOne = async (record): Promise<Subscription> => {
        if (record.id !== undefined) {
          return await this.http.put(`${this.recordLayout.entityUrl}/${record.id}`, record)
            .subscribe((resp: any[]): any => resp[0]);
        } else {
          return await this.http.post(`${this.recordLayout.entityUrl}/`, record)
            .subscribe((resp: any): any => resp);
        }
      }
      return Promise.all(records.map((r) => saveOne(r)));
    }
  });
  
  public emotionRecord: any;
  public emotionProjectLayout = new RecordListLayout<any>({
    type: Object,
    columns: [new EditableColumn({
      //   label: 'id',
      //   recordProperty: 'id',
      //   isEditable: false,
      //   editType: EditType.Text,
      //  }, {
      label: 'status',
      recordProperty: 'status',
      listDisplay: 'update',
      detailDisplay: 'update',
      editType: 'dropdown',
      options: [
        { label: 'nouveau', value: 'new' },
        { label: 'en cours', value: 'open' },
        { label: 'en attente', value: 'on-hold' },
        { label: 'annulé', value: 'cancelled' },
        { label: 'terminé', value: 'finished' },
      ]
    }), new EditableColumn({
      label: 'titre',
      recordProperty: 'title',
      listDisplay: 'update',
      detailDisplay: 'update',
      editType: 'text',
    }), new EditableColumn({
      label: 'description',
      recordProperty: 'description',
      listDisplay: 'update',
      detailDisplay: 'update',
      editType: 'textarea',
    }), new EditableColumn({
      label: 'lien',
      recordProperty: 'link',
      listDisplay: 'update',
      detailDisplay: 'update',  
      editType: 'text',
    }), new ReadonlyColumn({
      label: '',
      recordProperty: undefined,
      listDisplay: 'read',
      detailDisplay: 'read',
      html: (layout: RecordComponent<any>, record: any): string => {
        if(record.link) { return `<a href='${record.link}' target='_blank'>go</a>`}
        return '';
      },
    })],
    entityUrl: `http://localhost:8080/api/project`,
    getUrl: `http://localhost:8080/api/project/d9b7ea0a-3455-481c-86e6-39abea632dd2`,
    labelsWidth: '80px',
    valuesWidth: '250px',
    title: 'record title',
    primaryKeyProperty: 'id',
  });
  
  public recordListLayout = new RecordListLayout<any>({
    type: Object,
    height: 500,
    columns: [new ReadonlyColumn({
      listDisplay: 'read',
      detailDisplay: 'read',
      label: 'col without data',
      recordProperty: undefined,
      width: '200px',
      html: (parent, record): string => `<span>I am the <a href='/foo/${record.country}'>${record.country}</a>!`,
      onClick: (parentComponent: RecordListComponent<any>, record): void => {
        alert(record.title);
        // to be implemented
      }
      // }, {
      //   label: 'Id',
      //   editType: EditType.Number,
      //   recordProperty: 'id',
      //   isEditable: false,
      //   width: '30px',
      // }, {
      //   label: 'User',
      //   editType: EditType.Typeahead,
      //   recordProperty: 'userId',
      //   isEditable: true,
      //   width: '300px',
      //   options: [
      //     { label: 'foo', value: 'foo'},
      //     { label: 'bar', value: 'bar'},
      //     { label: 'baz', value: 'baz'},
      //   ],
      //   //filterValue: 'is',
      //   //isFilterVisible: true,
    }), new ReadonlyColumn({
      label: 'country',
      // editType: EditType.Text,
      recordProperty: 'country',
      listDisplay: 'read',
      detailDisplay: 'read',
      isFilterVisible: true,
      // filterValue: 'ess',
      width: '300px'
      // }, {
      //   label: 'Body',
      //   editType: EditType.Textarea, // multiline
      //   recordProperty: 'body',
      //   isEditable: true,
      //   width: '500px'
      // }, {
      //   label: 'L4',
      //   editType: EditType.Date, // date
      //   recordProperty: 'recordDate',
      //   isEditable: true,
      //   isModifiedProperty: 'recordDateModified',
      //   width: '60px'
      // }, {
      //   label: 'L5',
      //   editType: EditType.Text, // dropdown
      //   recordProperty: 'hardOption',
      //   isEditable: true,
      //   isModifiedProperty: 'hardOptionModified',
      //   width: '100px',
      //   isValid: (record: any): boolean => {
      //     return record.hardOption !== null && record.hardOption.length >= 6;
      //   }
      // }, {
      //   label: 'L6 monster very fucking long label plus',
      //   editType: EditType.Dropdown,
      //   recordProperty: 'quantity',
      //   isEditable: true,
      //   isModifiedProperty: 'quantityModified',
      //   width: '70px',
      //   options: [
      //     {value: 1, label: 'First'},
      //     {value: 2, label: 'Second'},
      //     {value: 3, label: 'Third'},
      //   ]
    }), new EditableColumn({
      //   label: 'id',
      //   recordProperty: 'id',
      //   isEditable: false,
      //   editType: EditType.Text,
      //  }, {
      label: 'status',
      recordProperty: 'status',
      listDisplay: 'update',
      detailDisplay: 'update',
      editType: 'dropdown',
      width: '100px',
      options: (): any => [
        { label: 'nouveau', value: 'new' },
        { label: 'en cours', value: 'open' },
        { label: 'en attente', value: 'on-hold' },
        { label: 'annulé', value: 'cancelled' },
        { label: 'terminé', value: 'finished' },
      ],
      isFilterVisible: true,
    })],
    primaryKeyProperty: 'country',
    entityUrl: this.sampleEntityUrl,
    selectionType: 'single',
    isDeleteEnabled: false,
    isAddEnabled: false,
    loadOnInit: false,
    title: 'record list layout',
    chunkSize: 20,
    newRecTemplate: {
      country: 'foobar'
    },
    selectionTrigger: 'click',
    // order: [{column: this.columns[0], direction: 'ASC'}],
  });

  public entityUrl2 = 'https://jsonplaceholder.typicode.com/todos';

  public recordListLayout2 = new RecordListLayout<any>({
    // type: Object,
    title: 'ceci est un titre',
    height: 600,
    componentWidth: '50%',
    detailPosition: 'right',
    labelsWidth: '100px',
    valuesWidth: '200px',
    columns: [new ReadonlyColumn({
      label: 'Id',
      editType: 'number',
      recordProperty: 'id',
      listDisplay: 'read',
      detailDisplay: 'read',
      width: '30px',
    }), new EditableColumn({
      label: 'Title',
      editType: 'text',
      recordProperty: 'title',
      listDisplay: 'update',
      detailDisplay: 'update',
      width: '50%',
    }), new EditableColumn({
      label: 'ChkBx',
      editType: 'checkbox',
      recordProperty: 'mybool',
      listDisplay: 'update',
      detailDisplay: 'update',
      width: '50px',
    }), new ReadonlyColumn({
      label: 'ChkBx text',
      editType: 'text',
      recordProperty: 'mybool',
      listDisplay: 'read',
      detailDisplay: 'read',
      width: '100px',
    }), new EditableColumn({
      label: 'User',
      editType: 'dropdown',
      recordProperty: 'userId',
      listDisplay: 'update',
      detailDisplay: 'update',
      // isEditable: (rec) => {
      //   const res = rec.completed !== true;
      //   console.info(res);
      //   return res;
      // },
      width: '200px',
      options: []
      // {value: 1, label: 'First'},
      // {value: 2, label: 'Second'},
      // {value: 3, label: 'Third'},
    }), new ReadonlyColumn({
      label: 'Completed',
      editType: 'text',
      recordProperty: 'completed',
      listDisplay: 'read',
      detailDisplay: 'read',
      width: '50px',
    })],
    entityUrl: this.entityUrl2,
    primaryKeyProperty: 'id'
  });

  public rlColWithoutProp = new RecordListLayout<any>({
    type: Object,
    height:150,
    entityUrl: '',
    chunkSize: 10,
    primaryKeyProperty: '',
    isAddEnabled: true,
    columns: [new ReadonlyColumn({
      listDisplay: 'read',
      detailDisplay: 'read',
      label: 'col without data',
      recordProperty: undefined,
      width: '200px',
      html: '<span>I am the <strong>content</strong>!',
      onClick: (/*_parentComponent: RecordListComponent<any>, _record*/): void => {
        alert('foo');
        // to be implemented
      },

    })]
  });

  // eslint-disable-next-line @typescript-eslint/no-parameter-properties
  public constructor(public http: HttpClient) {}

  public ngOnInit(): void {
    // this.http.get(`${'https://jsonplaceholder.typicode.com/users'}`)
    //   .subscribe((resp: any[]) => this.columns2.find(c => c.recordProperty === 'userId').options = resp.map(r => {
    //     return {value: r.id, label: r.name};
    //   }));
    this.http.get(this.sampleEntityUrl).toPromise().then((res: any) => this.records = res.data.map((r) => {
      r.status = 'open';
      r.mybool = false;
      return r;
    }));

    // this.http.get('https://jsonplaceholder.typicode.com/users').toPromise().then((users: any[]): void => {
    //   (this.recordListLayout.columns.find((c): boolean => c.recordProperty === 'userId') as OptionsEditableColumn<any>).options = users.map((u): any => ({label: u.name, value: u.id})),
    //   (this.recordLayout.columns.find((c): boolean => c.recordProperty === 'userId') as OptionsEditableColumn<any>).options = users.map((u): any => ({label: u.name, value: u.id}))
    // })
  }
}
