import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';

export interface ValidationResponse {
  request_id: string;
  timestamp: string;
  verdict: 'COHERENTE' | 'PARCIALMENTE COHERENTE' | 'NO COHERENTE';
  justification: string;
  sources: any[];
  model_used: string;
  processing_time_ms: number;
}

export interface ValidateActivityRequest {
  resultado_aprendizaje: string;
  dimension: string;
  metodologia: string;
  descripcion: string;
}

export interface ValidateEvaluationRequest {
  resultado_aprendizaje: string;
  nombre_actividad: string;
  dimension: string;
  metodologia: string;
  descripcion_actividad: string;
  descripcion_evaluacion: string;
  tipo: string;
  momento: string;
  actores: string;
  medios: string[];
  tecnicas: string[];
  instrumentos: string[];
}

@Injectable({ providedIn: 'root' })
export class ValidationService extends BaseHttpService {
  constructor(http: HttpClient) {
    super(http);
  }

  validateActivity(request: ValidateActivityRequest): Observable<ValidationResponse> {
    return this.post<ValidationResponse>('/api/validation/activity', request);
  }

  validateEvaluation(request: ValidateEvaluationRequest): Observable<ValidationResponse> {
    return this.post<ValidationResponse>('/api/validation/evaluation', request);
  }
}
