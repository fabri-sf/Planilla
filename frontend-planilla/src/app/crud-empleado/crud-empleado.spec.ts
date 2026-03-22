import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudEmpleado } from './crud-empleado';

describe('CrudEmpleado', () => {
  let component: CrudEmpleado;
  let fixture: ComponentFixture<CrudEmpleado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudEmpleado],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudEmpleado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
