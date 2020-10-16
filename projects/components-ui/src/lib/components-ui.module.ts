import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ComponentsUiComponent } from './components-ui.component';
import { ColumnComponent } from './column/column.component';
import { TextValueComponent } from './text-value/text-value.component';
import { TextareaValueComponent } from './textarea-value/textarea-value.component';
import { NumberValueComponent } from './number-value/number-value.component';
import { CheckboxValueComponent } from './checkbox-value/checkbox-value.component';
import { DateValueComponent } from './date-value/date-value.component';
import { RecordComponent } from './record/record.component';
import { RecordListComponent } from './record-list/record-list.component';
import { DropdownValueComponent } from './dropdown-value/dropdown-value.component';
import { TypeaheadValueComponent } from './typeahead-value/typeahead-value.component';
import { PasswordValueComponent } from './password-value/password-value.component';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
  ],
  declarations: [
    ComponentsUiComponent,
    ColumnComponent,
    TextValueComponent,
    PasswordValueComponent,
    TextareaValueComponent,
    NumberValueComponent,
    CheckboxValueComponent,
    DateValueComponent,
    RecordComponent,
    RecordListComponent,
    DropdownValueComponent,
    TypeaheadValueComponent
  ],
  exports: [
    ComponentsUiComponent,
    ColumnComponent,
    TextValueComponent,
    PasswordValueComponent,
    TextareaValueComponent,
    NumberValueComponent,
    CheckboxValueComponent,
    DateValueComponent,
    RecordComponent,
    RecordListComponent,
    HttpClientModule,
    DropdownValueComponent,
    TypeaheadValueComponent
  ],
})
export class ComponentsUiModule { }
