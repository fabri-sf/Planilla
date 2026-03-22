import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudTipocontrato } from './crud-tipocontrato';

describe('CrudTipocontrato', () => {
  let component: CrudTipocontrato;
  let fixture: ComponentFixture<CrudTipocontrato>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudTipocontrato],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudTipocontrato);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
