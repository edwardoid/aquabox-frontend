import { Platform, NavController } from '@ionic/angular';
import { Injectable } from '@angular/core';
import {
    Barcode,
    BarcodeFormat,
    BarcodeScanner,
    LensFacing,
} from '@capacitor-mlkit/barcode-scanning';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

import { BarcodeScanningModalComponent } from './barcode-scanning-modal/barcode-scanning-modal.component';
import { DialogService } from './dialog.service';

@Injectable({
    providedIn: 'root'
})
export class ScanService {
    public formGroup = new UntypedFormGroup({
        formats: new UntypedFormControl([]),
        lensFacing: new UntypedFormControl(LensFacing.Back),
        googleBarcodeScannerModuleInstallState: new UntypedFormControl(0),
        googleBarcodeScannerModuleInstallProgress: new UntypedFormControl(0),
    });
    public barcodes: Barcode[] = [];
    public isSupported = false;
    public isPermissionGranted = false;

    public lastScannedText: string = "";

    constructor(
        private platform: Platform,
        private nav: NavController,
        private dialogService: DialogService) {
        //this.updateCurrentStatus();
    }

    public async startScan(): Promise<void> {
        const formats = this.formGroup.get('formats')?.value || [];
        const lensFacing =
            this.formGroup.get('lensFacing')?.value || LensFacing.Back;
        const element = await this.dialogService.showModal({
            component: BarcodeScanningModalComponent,
            // Set `visibility` to `visible` to show the modal (see `src/theme/variables.scss`)
            cssClass: 'barcode-scanning-modal',
            showBackdrop: false,
            componentProps: {
                formats: formats,
                lensFacing: lensFacing,
            },
        });
        element.onDidDismiss().then((result) => {
            const barcode: Barcode | undefined = result.data?.barcode;
            if (barcode) {
                this.barcodes = [barcode];
            }
        });
    }

    public async scan(): Promise<void> {
        const formats = this.formGroup.get('formats')?.value || [];
        const { barcodes } = await BarcodeScanner.scan({
            formats,
        });
        this.barcodes = barcodes;
    }

    public async openSettings(): Promise<void> {
        await BarcodeScanner.openSettings();
    }

    public async installGoogleBarcodeScannerModule(): Promise<void> {
        await BarcodeScanner.installGoogleBarcodeScannerModule();
    }

    public async requestPermissions(): Promise<void> {
        await BarcodeScanner.requestPermissions();
    }

}