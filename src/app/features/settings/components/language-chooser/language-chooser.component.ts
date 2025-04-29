import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgbTypeahead, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {merge, Observable, OperatorFunction, Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';
import {Language, languages} from '../../models/language.model';

@Component({
  selector: 'app-language-chooser',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbTypeaheadModule],
  templateUrl: './language-chooser.component.html',
  styleUrl: './language-chooser.component.scss'
})
export class LanguageChooserComponent implements OnInit, OnChanges {
  @Input() selectedLanguage: Language | null = null;
  @Output() languageSelected = new EventEmitter<Language | null>();

  @ViewChild('instance', {static: true}) instance!: NgbTypeahead;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  model: any;
  languages = languages;

  ngOnInit(): void {
    this.updateModel();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedLanguage']) {
      this.updateModel();
    }
  }

  private updateModel(): void {
    if (this.selectedLanguage) {
      this.model = this.selectedLanguage;
    }
  }

  search: OperatorFunction<string, readonly Language[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) => {
        if (term === '') {
          return this.languages.slice(0, 10);
        }

        term = term.toLowerCase();
        return this.languages.filter((language) =>
          language.name.toLowerCase().includes(term) ||
          language.name_en.toLowerCase().includes(term)
        ).slice(0, 10);
      }),
    );
  };

  formatter = (language: Language) => `${language.flag} ${language.name}`;

  onSelectionChange(event: any): void {
    this.languageSelected.emit(event);
  }

  clearSelection(): void {
    this.model = null;
    this.languageSelected.emit(null);
  }
}
