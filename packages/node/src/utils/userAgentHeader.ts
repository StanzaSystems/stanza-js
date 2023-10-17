import { version as sdkVersion } from '../../package.json'
export const createUserAgentHeader = ({ serviceName, serviceRelease }: { serviceName: string, serviceRelease: string }) => `${serviceName}/${serviceRelease} StanzaNodeSDK/${sdkVersion}`
