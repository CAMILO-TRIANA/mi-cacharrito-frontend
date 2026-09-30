import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API } from '../config';

@Injectable({
  providedIn: 'root'
})
export class AlquilerService {

  private base = API + '/alquileres/al';

  constructor(private httpCliente: HttpClient) {}

  listarAlquileres(): Observable<any> {
    return this.httpCliente.get<any>(`${this.base}/listarTodo`);
  }

  guardarAlquiler(alquiler: any): Observable<any> {
    return this.httpCliente.post<any>(`${this.base}/guardarAlquiler`, alquiler);
  }

  cancelarAlquiler(numeroAlquiler: string): Observable<any> {
    const params = new HttpParams().set('numeroAlquiler', numeroAlquiler);
    return this.httpCliente.post<any>(`${this.base}/cancelarAlquiler`, null, { params });
  }

  buscarPorNumero(numeroAlquiler: string): Observable<any> {
    const params = new HttpParams().set('numeroAlquiler', numeroAlquiler);
    return this.httpCliente.post<any>(`${this.base}/buscarPorNumero`, null, { params });
  }

  listarPorUsuario(usuarioId: number): Observable<any> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.httpCliente.post<any>(`${this.base}/listarPorUsuario`, null, { params });
  }

  listarNoEntregados(): Observable<any> {
    return this.httpCliente.get<any>(`${this.base}/listarNoEntregados`);
  }

  marcarEntregado(placa: string, adminId: number): Observable<any> {
    const params = new HttpParams().set('placa', placa).set('adminId', adminId);
    return this.httpCliente.post<any>(`${this.base}/marcarEntregado`, null, { params });
  }

  marcarDisponible(numeroAlquiler: string, fechaEntregaReal: string, adminId: number): Observable<any> {
    const params = new HttpParams()
      .set('numeroAlquiler', numeroAlquiler)
      .set('fechaEntregaReal', fechaEntregaReal)
      .set('adminId', adminId);
    return this.httpCliente.post<any>(`${this.base}/marcarDisponible`, null, { params });
  }

  // Devuelve el PDF como blob para poder mostrarlo/descargarlo en el navegador
  generarPdf(numeroAlquiler: string): Observable<Blob> {
    const params = new HttpParams().set('numeroAlquiler', numeroAlquiler);
    return this.httpCliente.get(`${this.base}/generarPdf`, { params, responseType: 'blob' });
  }
}
