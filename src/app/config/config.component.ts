import { Component, OnInit, Signal, computed, signal } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, debounceTime, map, take, tap } from 'rxjs';
import { ConfigService } from './config.service';

import hljs from 'highlight.js/lib/core';
import yaml from 'highlight.js/lib/languages/yaml';

import YAML from 'yaml';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';

hljs.registerLanguage('yaml', yaml);

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressBarModule,
    RouterModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    AsyncPipe,
    JsonPipe,
    NgIf,
  ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss',
})
export class ConfigComponent {
  form!: FormGroup;
  code!: Signal<string | undefined>;

  loading = signal(false);
  commitLoading = signal(false);
  types: string[] = ['Stream', 'Batch'];
  result?: { repositoryUrl: string, message: string };

  constructor(
    private formBuilder: FormBuilder,
    private configeService: ConfigService
  ) {
    this.form = this.formBuilder.group({
      dataCollection: [''],
      type: [''],
      classification: [['internal', 'sensitive']],
    });

    this.code = toSignal(
      this.form.valueChanges.pipe(
        debounceTime(300),
        tap(() => this.loading.set(true)),
        map(highlightYaml),
        tap(() => this.loading.set(false))
      )
    );
  }

  commmit() {
    this.commitLoading.set(true);
    const data = {
      name: this.form.value.dataCollection,
      content: jsonToYaml(this.form.value),
      commit: 'Initial commit',
    };

    this.configeService
      .createDataCollection(data)
      .pipe(
        take(1),
        tap(() => this.commitLoading.set(false)),
        catchError(() => {
          this.commitLoading.set(false);
          return EMPTY;
        })
      )
      .subscribe((result: { repositoryUrl: string, message: string }) => {
        this.result = result;
      });
  }

  registerComponent() {
    this.configeService.registerComponent(this.form.get('dataCollection')?.value).subscribe(console.log)
  }
}

const highlightYaml = (code: object): string => {
  return hljs.highlight(jsonToYaml(code), {
    language: 'yaml',
  }).value;
};

const jsonToYaml = (json: object): string => {
  const doc = new YAML.Document();
  doc.contents = {
    ...(json as any),
  };

  return doc.toString();
};
