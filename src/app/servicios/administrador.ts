import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API } from '../config';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {

  private apiListar = API + '/administradores/a/listarTodo';
  private apiGuardar = API + '/administradores/a/guardarAdministrador';
  private apiEliminar = API + '/administradores/a/eliminarAdministrador';
  private apiLogin = API + '/administradores/a/login';

  constructor(private httpCliente: HttpClient) {}

  listarAdministradores(): Observable<any> {
    return this.httpCliente.get<any>(this.apiListar);
  }

  guardarAdministrador(administrador: any): Observable<any> {
    return this.httpCliente.post<any>(this.apiGuardar, administrador);
  }

  eliminarAdministrador(id: number): Observable<any> {
    return this.httpCliente.post(this.apiEliminar, id);
  }

  login(usuario: string, password: string): Observable<any> {
    const params = new HttpParams().set('usuario', usuario).set('password', password);
    return this.httpCliente.post<any>(this.apiLogin, null, { params });
  }
}
