import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API } from '../config';

@Injectable({
  providedIn: 'root'
})
export class VehiculoService {

  private base = API + '/vehiculos/v';

  constructor(private httpCliente: HttpClient) {}

  listarVehiculos(): Observable<any> {
    return this.httpCliente.get<any>(`${this.base}/listarTodo`);
  }

  // Catalogo: todos los vehiculos que se pueden alquilar ahora
  listarDisponibles(): Observable<any> {
    return this.httpCliente.get<any>(`${this.base}/listarDisponibles`);
  }

  buscarPorTipo(tipo: string): Observable<any> {
    const params = new HttpParams().set('tipo', tipo);
    return this.httpCliente.post<any>(`${this.base}/buscarPorTipo`, null, { params });
  }

  buscarPorPlaca(placa: string): Observable<any> {
    const params = new HttpParams().set('placa', placa);
    return this.httpCliente.post<any>(`${this.base}/buscarPorPlaca`, null, { params });
  }

  guardarVehiculo(vehiculo: any): Observable<any> {
    return this.httpCliente.post<any>(`${this.base}/guardarVehiculo`, vehiculo);
  }

  actualizarVehiculo(vehiculo: any): Observable<any> {
    return this.httpCliente.post<any>(`${this.base}/actualizarVehiculo`, vehiculo);
  }

  eliminarVehiculo(id: number): Observable<any> {
    return this.httpCliente.post(`${this.base}/eliminarVehiculo`, id);
  }

  // Sube la foto y devuelve { url }
  subirImagen(archivo: File): Observable<{ url: string }> {
    const datos = new FormData();
    datos.append('archivo', archivo);
    return this.httpCliente.post<{ url: string }>(`${this.base}/subirImagen`, datos);
  }
}
