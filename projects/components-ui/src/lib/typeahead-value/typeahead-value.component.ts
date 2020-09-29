import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ValueComponent} from '../value/value.component';
import { Option } from '../../model/column';
import scrollIntoView from "scroll-into-view-if-needed";

@Component({
  selector: 'ift-typeahead-value',
  templateUrl: './typeahead-value.component.html',
  styleUrls: ['./typeahead-value.component.css']
})
export class TypeaheadValueComponent extends ValueComponent {
  @Input() public value: any;
  @Output() public valueChange: EventEmitter<string> = new EventEmitter<any>();
  @Input() public options: Option[]|(() => Option[]) = [];
  @ViewChild('optionsDom') optionsDom: ElementRef;

  public get optionsArr(): Option[] {
    return (Array.isArray(this.options) ?
      this.options : this.options());
  }

  public selectedOption: Option = {label: '', value: undefined};
  public matchingOptions: Option[];
  public optionFilter = '';
  public filterHighlightIdx: number;

  protected initialValue: any;

  public constructor() {
    super();
  }

  public blur(): void {
    const modified = this.value !== this.initialValue;
    if (this.modified !== modified) {
      this.modified = modified;
      this.modifiedChange.emit(this.modified);
    }
    this.valueChange.emit(this.value);
    this.hasFocus = false;
    this.blurFilter();
  }

  public switchToFilterOption(idx: number): void {
    this.selectedOption = this.matchingOptions[idx];
    console.debug(`switching to option ${this.selectedOption.label}`);
    //this.navigate(this.selectedOption.id);
    this.optionFilter = this.selectedOption.label;
    this.value = this.selectedOption.value;
    this.matchingOptions = undefined;
  }
  public updOptionsFilter(event: KeyboardEvent, options: Option[]): void {
    console.debug(event.key);
    if (event.key === 'enter' && this.filterHighlightIdx !== undefined) {
      // enter
      this.switchToFilterOption(this.filterHighlightIdx);
      event.stopPropagation();
    } else if (event.key === 'up arrow') {
      // up arrow
      // console.debug(`up matchingPkg:${JSON.stringify(this.matchingPkg)} filterHighlighIdx:${JSON.stringify(this.filterHighlightIdx)}`);
      if (Array.isArray(this.matchingOptions) && this.matchingOptions.length > 0) {
        if (this.filterHighlightIdx === undefined) {
          this.filterHighlightIdx = 0;
        } else if (this.filterHighlightIdx > 0) {
          this.filterHighlightIdx--;
        }
      }
      event.stopPropagation();
    } else if (event.key === 'down arrow') {
      // down arrow
      // console.debug(`down matchingPkg:${JSON.stringify(this.matchingPkg)} filterHighlighIdx:${JSON.stringify(this.filterHighlightIdx)}`);
      if (Array.isArray(this.matchingOptions) && this.matchingOptions.length > 0) {
        if (this.filterHighlightIdx === undefined) {
          this.filterHighlightIdx = 0;
        } else if (this.filterHighlightIdx < this.matchingOptions.length - 1) {
          this.filterHighlightIdx++;
        }
      }
      event.stopPropagation();
    } else {
      this.matchingOptions = this.optionsArr.filter((p): boolean => p.label.toLowerCase().indexOf(this.optionFilter.toLowerCase()) !== -1).slice(0, 10);
      this.filterHighlightIdx = this.matchingOptions && this.matchingOptions.length > 0 ? 0 : undefined;
      setTimeout((): void => {
        this.ensureVisible(this.optionsDom.nativeElement);
      }, 100);
    }
  }
  public tab(event: KeyboardEvent): void {
    if (this.filterHighlightIdx && this.matchingOptions) {
      this.switchToFilterOption(this.filterHighlightIdx);
    }
    
    super.tab(event);
  }
  public blurFilter(): void {
    this.matchingOptions = undefined;
    //setTimeout(() => this.matchingOptions = undefined, 1000);
  }

  public displayValue(): string {
    const res = this.optionsArr.find((opt): boolean => opt.value === this.value);

    return res === undefined ? '' : res.label;
  }

  public focus(inputElem, event): void {
    // console.debug(`focus options: ${JSON.stringify(this.options)}`);
    this.selectedOption = this.optionsArr.find((opt): boolean => opt.value === this.value);
    // console.debug(`focus selected option: ${JSON.stringify(this.options)}`);
    this.optionFilter = this.selectedOption ? this.selectedOption.label : '';
    // console.debug(`focus option filter: ${JSON.stringify(this.optionFilter)}`);
    this.filterHighlightIdx = 0;

    if (this.selectedOption) {
      this.matchingOptions = this.optionsArr.filter((p): boolean => p.label.toLowerCase().indexOf(this.optionFilter.toLowerCase()) !== -1).slice(0, 10);
      // console.debug(`focus matching options: ${JSON.stringify(this.matchingOptions)}`);
    }
    super.focus(inputElem, event);
  }

  public ensureVisible(elem): void {
    scrollIntoView(elem, {
      behavior: 'smooth',
      block: 'nearest',
    });
    // console.info('pop');
  }
}
