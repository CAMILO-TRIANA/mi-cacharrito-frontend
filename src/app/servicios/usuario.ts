import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API } from '../config';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiListar = API + '/usuarios/u/listarTodo';
  private apiGuardar = API + '/usuarios/u/guardarUsuario';
  private apiActualizar = API + '/usuarios/u/actualizarUsuario';
  private apiEliminar = API + '/usuarios/u/eliminarUsuario';
  private apiLogin = API + '/usuarios/u/login';
  private apiBuscarPorIdentificacion = API + '/usuarios/u/buscarPorIdentificacion';

  constructor(private httpCliente: HttpClient) {}

  listarUsuarios(): Observable<any> {
    return this.httpCliente.get<any>(this.apiListar);
  }

  guardarUsuario(usuario: any): Observable<any> {
    return this.httpCliente.post<any>(this.apiGuardar, usuario);
  }

  actualizarUsuario(usuario: any): Observable<any> {
    return this.httpCliente.post<any>(this.apiActualizar, usuario);
  }

  eliminarUsuario(id: number): Observable<any> {
    return this.httpCliente.post(this.apiEliminar, id);
  }

  login(identificacion: string, password: string): Observable<any> {
    const params = new HttpParams()
      .set('identificacion', identificacion)
      .set('password', password);
    return this.httpCliente.post<any>(this.apiLogin, null, { params });
  }

  buscarPorIdentificacion(identificacion: string): Observable<any> {
    const params = new HttpParams().set('identificacion', identificacion);
    return this.httpCliente.post<any>(this.apiBuscarPorIdentificacion, null, { params });
  }
}
