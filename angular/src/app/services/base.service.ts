import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseService {

  private readonly _http = inject(HttpClient);
  
  post(url: string, data: any, optionalParam?: any) {
    return this._http.post(url, data || {}, optionalParam);
  }

  get(url: string, optionalParam?: any) {
    return  this._http.get(url, optionalParam);
  }

  put(url: string, data?: any) {
    return this._http.put(url, data);
  }

  delete(url: string, data?: any){
    return this._http.delete(url, data);
  }

}
