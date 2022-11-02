import { DevicesMap, RulesMap, HostsMap } from './id-map';
import { Rule } from './rule';
import { Device } from './device';
import { AquaboxInstance, AquaBoxConfiguration } from './aquabox-instance';
import { WiFiInfo } from './wi-fi-info'

export interface IAquabox {

    fetchConfigurations(lazy?: (hosts: HostsMap) => void): void;

    getHosts(lazy?: (hosts: HostsMap) => void): void;

    connect(box: AquaboxInstance): void;

    fetchDevices(   box: AquaboxInstance,
                    success: (devices: DevicesMap) => void,
                    fail?: () => void): void;

    getDevice(  device: Device,
                box: AquaboxInstance,
                success?: () => void,
                fail?: () => void): void;

    controlDevice(  dev: Device,
                    box: AquaboxInstance,
                    property: string,
                    value: any,
                    success?: (result: boolean) => void): void;

    fetchRules( box: AquaboxInstance,
                success: (rules: RulesMap) => void,
                fail?: () => void): void;

    fetchRulesForDevice(box: AquaboxInstance,
                        device: Device,
                        success: (rules: RulesMap) => void,
                        fail?: () => void): void;

    updateDevice(   box: AquaboxInstance,
                    device: Device,
                    result: (result: boolean) => void): void;

    updateRule( box: AquaboxInstance,
                rule: Rule,
                update: boolean,
                result: (result: boolean) => void): void;

    deleteRule( box: AquaboxInstance,
                rule: Rule,
                result: (result: boolean) => void): void

    getStatus(  box: AquaboxInstance,
                success?: (result: boolean) => void): void

    scanForNetworks(box: AquaboxInstance,
                    success?: (result: boolean) => void): void

    connectToWifi(  box: AquaboxInstance,
                    wifi: WiFiInfo,
                    success?: (uid: string) => void): void;

    getNetworks(box: AquaboxInstance,
                success?: (result: WiFiInfo[]) => void): void;

    testConfiguration(  configuration: AquaBoxConfiguration,
                        result: (ok: boolean) => void): void;
}
