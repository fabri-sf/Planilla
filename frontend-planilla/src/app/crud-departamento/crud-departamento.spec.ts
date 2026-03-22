import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudDepartamento } from './crud-departamento';

describe('CrudDepartamento', () => {
  let component: CrudDepartamento;
  let fixture: ComponentFixture<CrudDepartamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudDepartamento],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudDepartamento);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
