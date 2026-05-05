import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AssetCreate, AssetOut, AssetUpdate } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AssetsService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<AssetOut[]>(`${this.api}/assets/`);
  }

  getById(id: number) {
    return this.http.get<AssetOut>(`${this.api}/assets/${id}`);
  }

  create(asset: AssetCreate) {
    return this.http.post<AssetOut>(`${this.api}/assets/`, asset);
  }

  update(id: number, asset: AssetUpdate) {
    return this.http.put<AssetOut>(`${this.api}/assets/${id}`, asset);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.api}/assets/${id}`);
  }
}