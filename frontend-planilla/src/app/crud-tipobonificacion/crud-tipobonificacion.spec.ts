import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudTipobonificacion } from './crud-tipobonificacion';

describe('CrudTipobonificacion', () => {
  let component: CrudTipobonificacion;
  let fixture: ComponentFixture<CrudTipobonificacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudTipobonificacion],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudTipobonificacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
