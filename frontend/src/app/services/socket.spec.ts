import { TestBed } from '@angular/core/testing';
import { SocketService } from './socket'; // <-- Corregido: Importamos SocketService

describe('SocketService', () => {
  let service: SocketService; // <-- Corregido

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SocketService] // Declaramos el proveedor para el entorno de test
    });
    service = TestBed.inject(SocketService); // <-- Corregido
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});