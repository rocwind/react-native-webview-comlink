import { Platform } from 'react-native';
import { script } from './script';

export class WebScriptComposer {
    private targetScript: string;
    constructor(name: string, exposedObj: any, log: boolean) {
        // assum exposedObj to be an object with function props
        const exposedTarget = `{${Object.keys(exposedObj)
            .map((key) => `${key}:1`)
            .join(',')}}`;

        this.targetScript = script
            .replace(/\$EXPOSED_NAME/g, name)
            .replace('$EXPOSED_TARGET', exposedTarget)
            .replace('$PLATFORM_OS', Platform.OS)
            .replace('$LOG_ENABLED', `${log}`);
    }

    getScriptToInject(externalScript?: string): string {
        if (!externalScript) {
            return this.targetScript;
        }
        return this.targetScript + '\n' + externalScript;
    }
}
