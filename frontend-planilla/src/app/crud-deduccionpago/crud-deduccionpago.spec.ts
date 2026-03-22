import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudDeduccionpago } from './crud-deduccionpago';

describe('CrudDeduccionpago', () => {
  let component: CrudDeduccionpago;
  let fixture: ComponentFixture<CrudDeduccionpago>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudDeduccionpago],
    }).compileComponents();

    fixture = TestBed.createComponent(CrudDeduccionpago);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
