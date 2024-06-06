import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export interface DataCollection {
  name: string;
  content: string;
  commit: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(private httpClient: HttpClient) { }

  createDataCollection(data: DataCollection) {
    return this.httpClient.post<{
      repositoryUrl: string,
      message: string,
    }>(
      'http://localhost:3001/v1/infra/data-collection',
      data
    );
  }

  registerComponent(name: string) {
    return this.httpClient.post('http://localhost:3001/v1/create-component', { name })
  }
}
