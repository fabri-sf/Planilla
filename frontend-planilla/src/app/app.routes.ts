import { Routes } from '@angular/router';
import { CRUDAsistencia } from './crud-asistencia/crud-asistencia';
import { CrudEmpleado } from './crud-empleado/crud-empleado';
import { CrudAuditoria } from './crud-auditoria/crud-auditoria';
import { CrudBonificacionpago } from './crud-bonificacionpago/crud-bonificacionpago';
import { CrudDeduccionpago } from './crud-deduccionpago/crud-deduccionpago';
import { CrudDepartamento } from './crud-departamento/crud-departamento';
import { CrudHistorialsalario } from './crud-historialsalario/crud-historialsalario';
import { CrudPago } from './crud-pago/crud-pago';
import { CrudPlanilla } from './crud-planilla/crud-planilla';
import { CrudPuesto } from './crud-puesto/crud-puesto';
import { CrudTipobonificacion } from './crud-tipobonificacion/crud-tipobonificacion';
import { CrudTipocontrato } from './crud-tipocontrato/crud-tipocontrato';
import { CrudTipodeduccion } from './crud-tipodeduccion/crud-tipodeduccion';
import { CrudUsuario } from './crud-usuario/crud-usuario';
import { PlanillaDashboard } from './planilla-dashboard/planilla-dashboard';
import { PlanillaCrear } from './planilla-crear/planilla-crear';
import { PlanillaDetalle } from './planilla-detalle/planilla-detalle';
import { PlanillaAtraso } from './planilla-atraso/planilla-atraso';

export const routes: Routes = [
    {
        path: 'asistencia',
        component: CRUDAsistencia
    },
    {
        path: 'empleado',
        component: CrudEmpleado
    },
    {
        path: 'auditoria',
        component: CrudAuditoria
    },
    {
        path: 'bonificacionpago',
        component: CrudBonificacionpago
    },
    {
        path: 'deduccionpago',
        component: CrudDeduccionpago
    },
    {
        path: 'departamento',
        component: CrudDepartamento
    },
    {
        path: 'historialsalario',
        component: CrudHistorialsalario
    },
    {
        path: 'pago',
        component: CrudPago
    },
    // Rutas de planilla (orden importante: más específicas primero)
    {
        path: 'planilla/crear',
        component: PlanillaCrear
    },
    {
        path: 'planilla/:id/atraso',
        component: PlanillaAtraso
    },
    {
        path: 'planilla/:id',
        component: PlanillaDetalle
    },
    {
        path: 'planilla',
        component: PlanillaDashboard
    },
    // Ruta legacy CRUD planilla
    {
        path: 'crud-planilla',
        component: CrudPlanilla
    },
    {
        path: 'puesto',
        component: CrudPuesto
    },
    {
        path: 'tipobonificacion',
        component: CrudTipobonificacion
    },
    {
        path: 'tipocontrato',
        component: CrudTipocontrato
    },
    {
        path: 'tipodeduccion',
        component: CrudTipodeduccion
    },
    {
        path: 'usuario',
        component: CrudUsuario
    }

];


