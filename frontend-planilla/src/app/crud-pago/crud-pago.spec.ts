import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudPago } from './crud-pago';

describe('CrudPago', () => {
  let component: CrudPago;
  let fixture: ComponentFixture<CrudPago>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudPago],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudPago);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
