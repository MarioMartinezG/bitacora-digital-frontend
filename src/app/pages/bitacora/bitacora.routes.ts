import { Routes } from '@angular/router';

// Componentes
import { CaracterizaComponent } from './caracteriza-component/caracteriza-component';
import { FactoresComponent } from './factores-component/factores-component';
import { AjustesRazonablesComponent } from './ajustes-razonables-component/ajustes-razonables-component';
import { RapRacComponent } from './rap-rac-component/rap-rac-component';
import { ActividadesAprendizajeComponent } from './actividades-aprendizaje-component/actividades-aprendizaje-component';
import { ComoEvaluareComponent } from './como-evaluare-component/como-evaluare-component';
import { SecuenciaCursoComponent } from './secuencia-curso-component/secuencia-curso-component';
import { BibliografiaComponent } from './bibliografia-component/bibliografia-component';

export default [
    { path: 'caracteriza-asignatura', component: CaracterizaComponent },
    { path: 'factores-situacionales', component: FactoresComponent },
    { path: 'ajustes-razonables', component: AjustesRazonablesComponent },
    { path: 'rap-rac', component: RapRacComponent },
    { path: 'actividades-aprendizaje', component: ActividadesAprendizajeComponent },
    { path: 'como-evaluare', component: ComoEvaluareComponent },
    { path: 'secuencia-curso', component: SecuenciaCursoComponent },
    { path: 'bibliografia', component: BibliografiaComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;