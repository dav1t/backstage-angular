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

import hljs from 'highlight.js/lib/core';
import yaml from 'highlight.js/lib/languages/yaml';

import YAML from 'yaml';
import { debounceTime, map, tap } from 'rxjs';

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
  ],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss',
})
export class ConfigComponent {
  loading = signal(false);
  code!: Signal<string | undefined>;
  types: string[] = ['Stream', 'Batch'];
  form!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      dataCollection: [''],
      type: [''],
      classification: [['internal', 'sensitive']],
    });

    this.code = toSignal(
      this.form.valueChanges.pipe(
        debounceTime(300),
        tap(() => this.loading.set(true)),
        map(jsonToYaml),
        tap(() => this.loading.set(false))
      )
    );
  }
}

const jsonToYaml = (json: object): string => {
  const doc = new YAML.Document();
  doc.contents = {
    ...(json as any),
  };

  return hljs.highlight(doc.toString(), {
    language: 'yaml',
  }).value;
};
